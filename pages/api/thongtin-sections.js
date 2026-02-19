import fs from "fs";
import path from "path";

const normalizeTitle = (rawTitle) => {
  return rawTitle
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, " ")
    .replace(/[*_`#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const slugify = (text) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
};

const descriptionFromContent = (content) => {
  const plain = content
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]+\]\([^)]+\)/g, " ")
    .replace(/[*_`>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.slice(0, 180);
};

const parseSections = (content) => {
  const lines = content.split(/\r?\n/);
  const sections = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current && current.content.trim()) {
        sections.push(current);
      }
      current = {
        title: normalizeTitle(line.replace(/^##\s+/, "")),
        content: "",
      };
      continue;
    }

    if (current) {
      current.content += `${line}\n`;
    }
  }

  if (current && current.content.trim()) {
    sections.push(current);
  }

  return sections
    .map((section, index) => {
      const safeTitle = section.title || `Thong tin ${index + 1}`;
      return {
        title: safeTitle,
        slug: slugify(safeTitle) || `thong-tin-${index + 1}`,
        content: section.content.trim(),
        description: descriptionFromContent(section.content),
      };
    })
    .filter((section) => section.content.length > 20);
};

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const filePath = path.join(process.cwd(), "thongtin.md");
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const sections = parseSections(fileContent);
    return res.status(200).json({ sections });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
