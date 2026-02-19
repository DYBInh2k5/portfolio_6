import config from "@config/config.json";
import { getSinglePage } from "@lib/contentParser";
import { getAllProjects } from "@lib/firestoreProjects";

const SITE_URL = "https://example.com";

const normalizeDate = (value) => {
  if (!value) return new Date().toUTCString();
  if (typeof value?.toDate === "function") return value.toDate().toUTCString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toUTCString() : parsed.toUTCString();
};

const escapeXml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");

const generateRss = (items) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(config.site.title)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(config.metadata.meta_description)}</description>
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid>${item.link}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

export const getServerSideProps = async ({ res }) => {
  const markdownPosts = getSinglePage(`content/${config.settings.blog_folder}`);
  const projects = await getAllProjects();

  const postItems = markdownPosts.map((post) => ({
    title: post.frontmatter?.title || post.slug,
    link: `${SITE_URL}/posts/${post.slug}`,
    pubDate: normalizeDate(post.frontmatter?.date),
    description: post.frontmatter?.description || post.content?.slice(0, 160) || "",
  }));

  const projectItems = projects
    .filter((project) => project.slug && !project.draft)
    .map((project) => ({
      title: project.title || project.slug,
      link: `${SITE_URL}/project/${project.slug}`,
      pubDate: normalizeDate(project.date),
      description: project.summary || project.description || "",
    }));

  const xml = generateRss([...postItems, ...projectItems]);
  res.setHeader("Content-Type", "application/rss+xml");
  res.write(xml);
  res.end();

  return { props: {} };
};

export default function RssFeed() {
  return null;
}
