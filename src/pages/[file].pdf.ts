import type { APIRoute, GetStaticPaths } from "astro";
import {
  getExperience,
  getPage,
  getResumeSections,
  label,
} from "@/lib/content";
import { formatMonthYear, printableUrl } from "@/lib/format";
import { pageTitle } from "@/lib/paths";
import { renderResumePdf, type ResumeDocument } from "@/lib/resume-pdf";
import { site } from "@/site.config";

const file = site.resume.pdf.replace(/^\//, "").replace(/\.pdf$/, "");
const space = /\u00a0/g;

function html(entry: { id: string; rendered?: { html: string } }): string {
  if (entry.rendered === undefined) {
    throw new Error(`Resume PDF: ${entry.id} has no rendered content`);
  }
  return entry.rendered.html;
}

function monthYear(date: Date): string {
  return formatMonthYear(date).replace(space, " ");
}

async function resumeDocument(): Promise<ResumeDocument> {
  const page = await getPage("resume");
  const separator = site.labels.metaSeparator;
  const present = label(page, "present");

  return {
    title: pageTitle(page.data.title),
    subject: page.data.description,
    name: site.name,
    headline: [label(page, "role"), label(page, "location")].join(separator),
    separator,
    contacts: page.data.links.map((link) => ({
      text: printableUrl(link.href) ?? link.label,
      href: link.href,
    })),
    sections: [
      { title: label(page, "summary"), html: html(page) },
      {
        title: label(page, "experience"),
        entries: (await getExperience()).map((entry) => {
          const { role, company, url, type, location, start, end } = entry.data;
          return {
            role,
            company,
            ...(url ? { companyUrl: url } : {}),
            dates: `${monthYear(start)}${site.labels.rangeSeparator}${end ? monthYear(end) : present}`,
            details: [type, location]
              .filter(Boolean)
              .map((part) => `${separator}${part}`)
              .join(""),
            html: html(entry),
          };
        }),
      },
      ...(await getResumeSections()).map((section) => ({
        title: section.data.label,
        html: html(section),
      })),
    ],
  };
}

export const getStaticPaths = (() => [
  { params: { file } },
]) satisfies GetStaticPaths;

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await renderResumePdf(await resumeDocument())), {
    headers: { "Content-Type": "application/pdf" },
  });
