import config from "@config/config.json";
import { getSinglePage } from "@lib/contentParser";
import { getAllProjects } from "@lib/firestoreProjects";

const SITE_URL = "https://example.com";

const normalizeDate = (value) => {
  if (!value) return new Date().toISOString();
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const generateSiteMap = (urls) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (item) => `  <url>
    <loc>${item.loc}</loc>
    <lastmod>${item.lastmod}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;
};

export const getServerSideProps = async ({ res }) => {
  const staticPages = ["/", "/about", "/contact", "/services", "/posts", "/project", "/categories"];
  const markdownPosts = getSinglePage(`content/${config.settings.blog_folder}`);
  const projectDocs = await getAllProjects();

  const urls = [
    ...staticPages.map((path) => ({
      loc: `${SITE_URL}${path}`,
      lastmod: new Date().toISOString(),
    })),
    ...markdownPosts.map((post) => ({
      loc: `${SITE_URL}/posts/${post.slug}`,
      lastmod: normalizeDate(post.frontmatter?.date),
    })),
    ...projectDocs
      .filter((project) => project.slug && !project.draft)
      .map((project) => ({
        loc: `${SITE_URL}/project/${project.slug}`,
        lastmod: normalizeDate(project.date),
      })),
  ];

  const xml = generateSiteMap(urls);
  res.setHeader("Content-Type", "text/xml");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function SiteMap() {
  return null;
}
