import { site } from "../site.config.ts";

type ContributionLevel = 0 | 1 | 2 | 3 | 4;

interface ContributionDay {
  date: string;
  count: number;
  level: ContributionLevel;
}

interface ContributionSnapshot {
  total: number;
  weeks: ContributionDay[][];
}

interface Contributions extends ContributionSnapshot {
  from: Date;
  to: Date;
}

interface CalendarResponse {
  data?: {
    user?: {
      contributionsCollection: {
        contributionCalendar: {
          weeks: {
            contributionDays: {
              date: string;
              contributionCount: number;
              contributionLevel: string;
            }[];
          }[];
        };
      };
    } | null;
  };
}

const requestTimeout = 15_000;

const calendarLevels = [
  "NONE",
  "FIRST_QUARTILE",
  "SECOND_QUARTILE",
  "THIRD_QUARTILE",
  "FOURTH_QUARTILE",
];

const calendarQuery = `query ($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}`;

export function toDate(day: string): Date {
  return new Date(`${day}T00:00:00Z`);
}

function isLevel(value: number): value is ContributionLevel {
  return Number.isInteger(value) && value >= 0 && value <= 4;
}

function toDay(date: string, count: number, level: number): ContributionDay {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !Number.isInteger(count) ||
    count < 0 ||
    !isLevel(level)
  ) {
    throw new Error(`unexpected contribution day "${date}"`);
  }
  return { date, count, level };
}

function toSnapshot(days: ContributionDay[]): ContributionSnapshot {
  if (days.length === 0) {
    throw new Error("no contribution days found");
  }
  const weeks: ContributionDay[][] = [];
  let total = 0;
  for (const day of days.toSorted((a, b) => a.date.localeCompare(b.date))) {
    if (weeks.length === 0 || toDate(day.date).getUTCDay() === 0) {
      weeks.push([]);
    }
    weeks.at(-1)?.push(day);
    total += day.count;
  }
  return { total, weeks };
}

function withRange(snapshot: ContributionSnapshot): Contributions {
  const first = snapshot.weeks.at(0)?.at(0);
  const last = snapshot.weeks.at(-1)?.at(-1);
  return {
    ...snapshot,
    from: first ? toDate(first.date) : new Date(),
    to: last ? toDate(last.date) : new Date(),
  };
}

function attribute(tag: string, name: string): string {
  return new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1] ?? "";
}

function parseContributionsPage(html: string): ContributionSnapshot {
  const counts = new Map<string, number>();
  const tooltips = /<tool-tip\b[^>]*\sfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g;
  for (const [, id = "", text = ""] of html.matchAll(tooltips)) {
    counts.set(id, Number.parseInt(text.trim().replaceAll(",", ""), 10) || 0);
  }
  const days: ContributionDay[] = [];
  for (const [cell] of html.matchAll(/<td\b[^>]*\sdata-date="[^>]*>/g)) {
    const count = counts.get(attribute(cell, "id"));
    if (count === undefined) {
      throw new Error("contribution counts missing from the public page");
    }
    days.push(
      toDay(
        attribute(cell, "data-date"),
        count,
        Number.parseInt(attribute(cell, "data-level"), 10),
      ),
    );
  }
  return toSnapshot(days);
}

async function fetchCalendar(
  username: string,
  token: string,
): Promise<ContributionSnapshot> {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "user-agent": username,
    },
    body: JSON.stringify({
      query: calendarQuery,
      variables: { login: username },
    }),
    signal: AbortSignal.timeout(requestTimeout),
  });
  if (!response.ok) {
    throw new Error(`GitHub GraphQL responded ${response.status}`);
  }
  const payload = (await response.json()) as CalendarResponse;
  const weeks =
    payload.data?.user?.contributionsCollection.contributionCalendar.weeks ??
    [];
  return toSnapshot(
    weeks.flatMap((week) =>
      week.contributionDays.map((day) =>
        toDay(
          day.date,
          day.contributionCount,
          calendarLevels.indexOf(day.contributionLevel),
        ),
      ),
    ),
  );
}

async function fetchPage(username: string): Promise<ContributionSnapshot> {
  const response = await fetch(
    `https://github.com/users/${username}/contributions`,
    { signal: AbortSignal.timeout(requestTimeout) },
  );
  if (!response.ok) {
    throw new Error(`GitHub contributions page responded ${response.status}`);
  }
  return parseContributionsPage(await response.text());
}

function reason(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function fetchContributions(
  username: string,
  token?: string,
): Promise<ContributionSnapshot> {
  const sources = [
    ...(token ? [() => fetchCalendar(username, token)] : []),
    () => fetchPage(username),
    () => fetchPage(username),
  ];
  const failures: string[] = [];
  for (const source of sources) {
    try {
      return await source();
    } catch (error) {
      failures.push(reason(error));
    }
  }
  throw new Error(failures.join("; "));
}

async function readSnapshot(): Promise<ContributionSnapshot> {
  try {
    const { default: snapshot } = await import(
      "../data/github-contributions.json",
      { with: { type: "json" } }
    );
    return toSnapshot(
      snapshot.weeks.flat().map((day) => toDay(day.date, day.count, day.level)),
    );
  } catch {
    return { total: 0, weeks: [] };
  }
}

async function loadContributions(): Promise<Contributions> {
  try {
    return withRange(
      await fetchContributions(site.github.username, process.env.GITHUB_TOKEN),
    );
  } catch (error) {
    console.warn(
      `[github] contributions fall back to the committed snapshot: ${reason(error)}`,
    );
    return withRange(await readSnapshot());
  }
}

let contributions: Promise<Contributions> | undefined;

export function getContributions(): Promise<Contributions> {
  contributions ??= loadContributions();
  return contributions;
}
