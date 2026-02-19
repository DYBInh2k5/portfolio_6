import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Base from "@layouts/Baseof";
import { createProject } from "@lib/firestoreProjects";
import { onAuthChange } from "@lib/auth";
import { isAdminUser } from "@lib/utils/adminAccess";
import Link from "next/link";
import { marked } from "marked";

const NewProject = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [notice, setNotice] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    description: "",
    content: "",
    techStack: "",
    repoUrl: "",
    demoUrl: "",
    image: "",
    status: "active",
    featured: false,
    draft: false,
    date: new Date().toISOString().split("T")[0],
  });
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthChange((currentUser) => {
      if (!currentUser || !isAdminUser(currentUser)) router.push("/login");
      else setUser(currentUser);
    });
    return () => unsub();
  }, [router]);

  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setNotice(null);
    try {
      const result = await createProject({
        ...formData,
        date: new Date(formData.date).toISOString(),
      });
      if (result.success) {
        setNotice({ type: "success", message: "Project created successfully. Redirecting..." });
        setTimeout(() => router.push("/admin/projects"), 700);
      } else {
        setNotice({ type: "error", message: "Error: " + result.error });
      }
    } catch (error) {
      setNotice({ type: "error", message: "Create project failed: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Base>
        <div className="container py-20 text-center">Checking auth...</div>
      </Base>
    );
  }

  return (
    <Base>
      <section className="section">
        <div className="container">
          <div className="mb-8">
            <Link href="/admin/projects" className="text-primary hover:underline">Back to projects</Link>
            <h1 className="h2 mt-4">Create Project</h1>
          </div>

          {notice && (
            <div
              className={`mb-6 rounded border px-4 py-3 text-sm ${
                notice.type === "error"
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-emerald-300 bg-emerald-50 text-emerald-700"
              }`}
            >
              {notice.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-w-5xl">
            <div className="mb-6">
              <label className="mb-2 block font-medium">Title *</label>
              <input name="title" value={formData.title} onChange={handleTitleChange} required className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light" />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium">Slug *</label>
              <input name="slug" value={formData.slug} onChange={handleChange} required className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light" />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium">Summary</label>
              <textarea name="summary" value={formData.summary} onChange={handleChange} rows="3" className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light" />
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <label className="block font-medium">Content</label>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setPreviewEnabled((prev) => !prev)}
                >
                  {previewEnabled ? "Hide Preview" : "Show Preview"}
                </button>
              </div>
              <textarea name="content" value={formData.content} onChange={handleChange} rows="12" className="w-full rounded border border-border p-3 font-mono dark:border-darkmode-border dark:bg-darkmode-theme-light" />
              {previewEnabled && (
                <div className="mt-4 rounded border border-border p-4 dark:border-darkmode-border">
                  <p className="mb-2 text-sm font-medium">Markdown Preview</p>
                  <div className="content" dangerouslySetInnerHTML={{ __html: marked.parse(formData.content || "") }} />
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="mb-6">
                <label className="mb-2 block font-medium">Tech Stack</label>
                <input name="techStack" value={formData.techStack} onChange={handleChange} className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light" />
              </div>
              <div className="mb-6">
                <label className="mb-2 block font-medium">Status</label>
                <input name="status" value={formData.status} onChange={handleChange} className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light" />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="mb-6">
                <label className="mb-2 block font-medium">Repository URL</label>
                <input name="repoUrl" value={formData.repoUrl} onChange={handleChange} className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light" />
              </div>
              <div className="mb-6">
                <label className="mb-2 block font-medium">Demo URL</label>
                <input name="demoUrl" value={formData.demoUrl} onChange={handleChange} className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light" />
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium">Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light" />
            </div>

            <div className="mb-6 flex gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
                <span>Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="draft" checked={formData.draft} onChange={handleChange} />
                <span>Draft</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? "Creating..." : "Create Project"}
              </button>
              <Link href="/admin/projects" className="btn btn-outline-primary">Cancel</Link>
            </div>
          </form>
        </div>
      </section>
    </Base>
  );
};

export default NewProject;
