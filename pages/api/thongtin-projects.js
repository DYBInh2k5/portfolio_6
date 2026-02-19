import fs from "fs";
import path from "path";

const PROJECT_NAMES = [
  "AI Content Generator Pro",
  "Social Growth Suite",
  "E-commerce Analytics Pro",
  "AI Video Script Studio",
];

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const extractValueAfterBold = (block) => {
  const match = block.match(/\*\*([^*]+)\*\*/);
  return match ? match[1].trim() : "";
};

const extractCodeBlock = (block) => {
  const match = block.match(/```([\s\S]*?)```/);
  if (!match) return "";
  return match[1].replace(/\s+/g, " ").trim();
};

const extractFeatures = (block) => {
  const lines = block.split(/\r?\n/);
  return lines
    .filter((line) => line.trim().startsWith("- "))
    .map((line) => line.replace(/^- /, "").trim())
    .filter(Boolean);
};

const parseProjects = (content) => {
  const projects = [];
  for (const name of PROJECT_NAMES) {
    const marker = `### ${name}`;
    const startIndex = content.indexOf(marker);
    if (startIndex < 0) continue;

    const rest = content.slice(startIndex + marker.length);
    const nextHeadingIndex = rest.search(/\n###\s+/);
    const block =
      nextHeadingIndex >= 0 ? rest.slice(0, nextHeadingIndex) : rest;

    const description = extractValueAfterBold(block) || `${name} project`;
    const techStack = extractCodeBlock(block);
    const features = extractFeatures(block);

    projects.push({
      title: name,
      slug: slugify(name),
      summary: description,
      description,
      content: block.trim(),
      techStack,
      features,
      status: "active",
      featured: true,
      draft: false,
    });
  }
  return projects;
};

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const filePath = path.join(process.cwd(), "thongtin.md");
    const raw = fs.readFileSync(filePath, "utf-8");
    const projects = parseProjects(raw);
    return res.status(200).json({ projects });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
