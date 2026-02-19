const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const toText = (value) => (typeof value === "string" ? value.trim() : "");

const toArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => toText(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const toIsoDate = (value) => {
  if (!value) return new Date().toISOString();
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
};

const validateSlug = (slug) => {
  if (!slug) return "Slug is required.";
  if (!slugPattern.test(slug)) {
    return "Slug only accepts lowercase letters, numbers, and hyphens.";
  }
  return null;
};

export const normalizePostInput = (input) => {
  const normalized = {
    title: toText(input?.title),
    slug: toText(input?.slug).toLowerCase(),
    description: toText(input?.description),
    content: typeof input?.content === "string" ? input.content.trim() : "",
    author: toText(input?.author),
    image: toText(input?.image),
    categories: toArray(input?.categories),
    tags: toArray(input?.tags),
    featured: Boolean(input?.featured),
    draft: Boolean(input?.draft),
    date: toIsoDate(input?.date),
  };

  const errors = [];
  if (!normalized.title) errors.push("Title is required.");
  if (!normalized.content) errors.push("Content is required.");
  const slugError = validateSlug(normalized.slug);
  if (slugError) errors.push(slugError);

  return { normalized, errors };
};

export const normalizeProjectInput = (input) => {
  const normalized = {
    title: toText(input?.title),
    slug: toText(input?.slug).toLowerCase(),
    summary: toText(input?.summary),
    description: toText(input?.description),
    content: typeof input?.content === "string" ? input.content.trim() : "",
    techStack: toText(input?.techStack),
    repoUrl: toText(input?.repoUrl),
    demoUrl: toText(input?.demoUrl),
    image: toText(input?.image),
    status: toText(input?.status) || "active",
    featured: Boolean(input?.featured),
    draft: Boolean(input?.draft),
    date: toIsoDate(input?.date),
  };

  const errors = [];
  if (!normalized.title) errors.push("Title is required.");
  const slugError = validateSlug(normalized.slug);
  if (slugError) errors.push(slugError);

  return { normalized, errors };
};
