import { isoDate } from "@/lib/format";
import { site } from "@/site.config";

interface Page {
  isHome: boolean;
  url: string;
  title: string;
  description: string;
  image?: string;
  lang: string;
  publishedTime?: Date;
  modifiedTime?: Date;
}

const home = new URL("/", site.url).href;
const personId = `${home}#person`;

const person = {
  "@type": "Person",
  "@id": personId,
  name: site.name,
  url: home,
  sameAs: site.social.map(({ href }) => href),
};

function schema(page: Page): Record<string, unknown> | undefined {
  if (page.isHome) {
    return {
      "@graph": [
        {
          "@type": "WebSite",
          "@id": `${home}#website`,
          name: site.name,
          url: home,
          description: page.description,
          inLanguage: page.lang,
          publisher: { "@id": personId },
        },
        person,
      ],
    };
  }
  if (page.publishedTime) {
    return {
      "@type": "BlogPosting",
      headline: page.title,
      description: page.description,
      url: page.url,
      inLanguage: page.lang,
      datePublished: isoDate(page.publishedTime),
      ...(page.modifiedTime
        ? { dateModified: isoDate(page.modifiedTime) }
        : {}),
      ...(page.image ? { image: page.image } : {}),
      author: person,
    };
  }
  return undefined;
}

export function structuredData(page: Page): string | undefined {
  const data = schema(page);
  return data
    ? JSON.stringify({ "@context": "https://schema.org", ...data }).replace(
        /</g,
        "\\u003c",
      )
    : undefined;
}
