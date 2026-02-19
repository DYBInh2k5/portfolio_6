import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Base from "@layouts/Baseof";
import { getAllProjects, updateProject } from "@lib/firestoreProjects";
import { onAuthChange } from "@lib/auth";
import { isAdminUser } from "@lib/utils/adminAccess";
import Link from "next/link";
import { marked } from "marked";

const normalizeDateInput = (value) => {
  if (!value) return "";
  if (typeof value?.toDate === "function") return value.toDate().toISOString().split("T")[0];
  return String(value).split("T")[0];
};

const EditProject = () => {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    date: "",
  });

  useEffect(() => {
    const unsub = onAuthChange((currentUser) => {
      if (!currentUser || !isAdminUser(currentUser)) router.push("/login");
      else setUser(currentUser);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!id || !user) return;
    const load = async () => {
      setNotice(null);
      try {
        const projects = await getAllProjects();
        const project = projects.find((item) => item.id === id);
        if (!project) {
          setNotice({ type: "error", message: "Project not found. Redirecting..." });
          router.push("/admin/projects");
          return;
        }

        setFormData({
          title: project.title || "",
          slug: project.slug || "",
          summary: project.summary || "",
          description: project.description || "",
          content: project.content || "",
          techStack: project.techStack || "",
          repoUrl: project.repoUrl || "",
          demoUrl: project.demoUrl || "",
          image: project.image || "",
          status: project.status || "active",
          featured: Boolean(project.featured),
          draft: Boolean(project.draft),
          date: normalizeDateInput(project.date),
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, user, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const result = await updateProject(id, {
        ...formData,
        date: new Date(formData.date).toISOString(),
      });
      if (result.success) {
        setNotice({ type: "success", message: "Project updated successfully. Redirecting..." });
        setTimeout(() => router.push("/admin/projects"), 700);
      } else {
        setNotice({ type: "error", message: "Error: " + result.error });
      }
    } catch (error) {
      setNotice({ type: "error", message: "Update failed: " + error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Base>
        <div className="container py-20 text-center">Loading project...</div>
      </Base>
    );
  }

  if (!user) return null;

  return (
    <Base>
      <section className="section">
        <div className="container">
          <div className="mb-8">
            <Link href="/admin/projects" className="text-primary hover:underline">Back to projects</Link>
            <h1 className="h2 mt-4">Edit Project</h1>
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
              <input name="title" value={formData.title} onChange={handleChange} required className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light" />
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
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link href="/admin/projects" className="btn btn-outline-primary">Cancel</Link>
            </div>
          </form>
        </div>
      </section>
    </Base>
  );
};

export default EditProject;
