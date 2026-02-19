import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Base from "@layouts/Baseof";
import {
  subscribeToProjects,
  createProject,
  deleteProject,
  deleteProjectsBulk,
  updateProjectsDraftStatusBulk,
  updateProjectsFeaturedStatusBulk,
} from "@lib/firestoreProjects";
import { onAuthChange } from "@lib/auth";
import { isAdminUser } from "@lib/utils/adminAccess";
import Link from "next/link";
import dateFormat from "@lib/utils/dateFormat";
import ConfirmModal from "@layouts/components/admin/ConfirmModal";
import ToastStack from "@layouts/components/admin/ToastStack";

const PAGE_SIZE = 10;

const parsePage = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : 1;
};

const normalizeDate = (value) => {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  return value;
};

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkStatusLoading, setBulkStatusLoading] = useState(false);
  const [bulkFeaturedLoading, setBulkFeaturedLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    onConfirm: null,
  });
  const router = useRouter();
  const initializedQuery = useRef(false);

  const notify = (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const openConfirm = ({ title, message, confirmLabel = "Confirm", onConfirm }) => {
    setConfirmState({
      open: true,
      title,
      message,
      confirmLabel,
      onConfirm,
    });
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmState({
      open: false,
      title: "",
      message: "",
      confirmLabel: "Confirm",
      onConfirm: null,
    });
  };

  const runConfirmedAction = async () => {
    if (!confirmState.onConfirm) return;
    setConfirmLoading(true);
    try {
      await confirmState.onConfirm();
      closeConfirm();
    } finally {
      setConfirmLoading(false);
    }
  };

  useEffect(() => {
    if (!toasts.length) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 2800);
    return () => clearTimeout(timer);
  }, [toasts]);

  useEffect(() => {
    let unsubscribeProjects;
    const unsubscribeAuth = onAuthChange((currentUser) => {
      if (!currentUser || !isAdminUser(currentUser)) {
        router.push("/login");
      } else {
        setUser(currentUser);
        unsubscribeProjects = subscribeToProjects(
          (items) => {
            setProjects(items);
            setLoading(false);
          },
          () => {
            setLoading(false);
            notify("error", "Could not load projects list.");
          }
        );
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProjects) unsubscribeProjects();
    };
  }, [router]);

  useEffect(() => {
    if (!router.isReady || initializedQuery.current) return;
    setSearch(typeof router.query.q === "string" ? router.query.q : "");
    setSortBy(typeof router.query.sort === "string" ? router.query.sort : "date_desc");
    setStatusFilter(typeof router.query.status === "string" ? router.query.status : "all");
    setFeaturedFilter(typeof router.query.featured === "string" ? router.query.featured : "all");
    setPage(parsePage(router.query.page));
    initializedQuery.current = true;
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!router.isReady || !initializedQuery.current) return;
    const query = {};
    if (search) query.q = search;
    if (sortBy !== "date_desc") query.sort = sortBy;
    if (statusFilter !== "all") query.status = statusFilter;
    if (featuredFilter !== "all") query.featured = featuredFilter;
    if (page > 1) query.page = String(page);
    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [search, sortBy, statusFilter, featuredFilter, page, router]);

  const visibleProjects = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    let next = [...projects];

    if (keyword) {
      next = next.filter((project) => {
        return [project.title, project.slug, project.status, project.summary]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(keyword));
      });
    }

    if (statusFilter === "published") next = next.filter((project) => !project.draft);
    if (statusFilter === "draft") next = next.filter((project) => project.draft);
    if (featuredFilter === "featured") next = next.filter((project) => Boolean(project.featured));
    if (featuredFilter === "normal") next = next.filter((project) => !project.featured);

    next.sort((a, b) => {
      if (sortBy === "title_asc") return String(a.title || "").localeCompare(String(b.title || ""));
      if (sortBy === "title_desc") return String(b.title || "").localeCompare(String(a.title || ""));
      const aTime = new Date(normalizeDate(a.date) || 0).getTime();
      const bTime = new Date(normalizeDate(b.date) || 0).getTime();
      return sortBy === "date_asc" ? aTime - bTime : bTime - aTime;
    });

    return next;
  }, [projects, search, sortBy, statusFilter, featuredFilter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(visibleProjects.length / PAGE_SIZE)), [visibleProjects.length]);

  const pagedProjects = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return visibleProjects.slice(start, start + PAGE_SIZE);
  }, [visibleProjects, page]);

  useEffect(() => {
    if (!initializedQuery.current) return;
    setPage(1);
  }, [search, sortBy, statusFilter, featuredFilter]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => visibleProjects.some((project) => project.id === id)));
  }, [visibleProjects]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleDelete = (projectId) => {
    openConfirm({
      title: "Delete project",
      message: "Do you want to delete this project?",
      confirmLabel: "Delete",
      onConfirm: async () => {
        setDeleteLoading(projectId);
        try {
          const result = await deleteProject(projectId);
          if (!result.success) {
            notify("error", `Error: ${result.error}`);
            return;
          }
          notify("success", "Project deleted.");
        } catch {
          notify("error", "Delete failed.");
        } finally {
          setDeleteLoading(null);
        }
      },
    });
  };

  const handleImportProjects = async () => {
    setImportLoading(true);
    try {
      const response = await fetch("/api/thongtin-projects");
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Import failed");

      const imported = Array.isArray(payload.projects) ? payload.projects : [];
      const existingSlugs = new Set(projects.map((item) => item.slug));
      let created = 0;
      let skipped = 0;

      for (const item of imported) {
        if (!item.slug || existingSlugs.has(item.slug)) {
          skipped += 1;
          continue;
        }

        const result = await createProject({
          title: item.title,
          slug: item.slug,
          summary: item.summary,
          description: item.description,
          content: item.content,
          techStack: item.techStack || "",
          repoUrl: "https://github.com/DYBInh2k5",
          demoUrl: "",
          image: "",
          status: item.status || "active",
          featured: Boolean(item.featured),
          draft: Boolean(item.draft),
          date: new Date().toISOString(),
        });

        if (result.success) {
          existingSlugs.add(item.slug);
          created += 1;
        }
      }

      notify("success", `Import done: ${created} created, ${skipped} skipped.`);
    } catch (error) {
      notify("error", `Import failed: ${error.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  const handleSelectOne = (projectId, checked) => {
    setSelectedIds((prev) => {
      if (checked) return Array.from(new Set([...prev, projectId]));
      return prev.filter((id) => id !== projectId);
    });
  };

  const handleSelectAllInPage = (checked) => {
    if (checked) {
      setSelectedIds((prev) => {
        const merged = new Set(prev);
        pagedProjects.forEach((project) => merged.add(project.id));
        return Array.from(merged);
      });
      return;
    }
    const currentPageIds = new Set(pagedProjects.map((project) => project.id));
    setSelectedIds((prev) => prev.filter((id) => !currentPageIds.has(id)));
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    openConfirm({
      title: "Bulk delete projects",
      message: `Delete ${selectedIds.length} selected projects?`,
      confirmLabel: "Delete all",
      onConfirm: async () => {
        setBulkDeleteLoading(true);
        try {
          const result = await deleteProjectsBulk(selectedIds);
          if (!result.success) {
            notify("error", `Error: ${result.error}`);
            return;
          }
          setSelectedIds([]);
          notify("success", `Deleted ${result.deleted || selectedIds.length} projects.`);
        } catch (error) {
          notify("error", `Bulk delete failed: ${error.message}`);
        } finally {
          setBulkDeleteLoading(false);
        }
      },
    });
  };

  const handleBulkSetDraft = (nextDraft) => {
    if (!selectedIds.length) return;
    openConfirm({
      title: "Bulk status update",
      message: nextDraft
        ? `Move ${selectedIds.length} selected projects to draft?`
        : `Publish ${selectedIds.length} selected projects?`,
      confirmLabel: "Confirm",
      onConfirm: async () => {
        setBulkStatusLoading(true);
        try {
          const result = await updateProjectsDraftStatusBulk(selectedIds, nextDraft);
          if (!result.success) {
            notify("error", `Error: ${result.error}`);
            return;
          }
          setSelectedIds([]);
          notify("success", nextDraft ? "Moved to draft." : "Published selected projects.");
        } catch (error) {
          notify("error", `Bulk status update failed: ${error.message}`);
        } finally {
          setBulkStatusLoading(false);
        }
      },
    });
  };

  const handleBulkSetFeatured = (nextFeatured) => {
    if (!selectedIds.length) return;
    openConfirm({
      title: "Bulk featured update",
      message: nextFeatured
        ? `Mark ${selectedIds.length} selected projects as featured?`
        : `Remove featured from ${selectedIds.length} selected projects?`,
      confirmLabel: "Confirm",
      onConfirm: async () => {
        setBulkFeaturedLoading(true);
        try {
          const result = await updateProjectsFeaturedStatusBulk(selectedIds, nextFeatured);
          if (!result.success) {
            notify("error", `Error: ${result.error}`);
            return;
          }
          setSelectedIds([]);
          notify("success", nextFeatured ? "Featured enabled." : "Featured removed.");
        } catch (error) {
          notify("error", `Bulk featured update failed: ${error.message}`);
        } finally {
          setBulkFeaturedLoading(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <Base>
        <div className="container py-20 text-center">Loading...</div>
      </Base>
    );
  }

  if (!user) return null;

  return (
    <Base>
      <section className="section">
        <div className="container">
          <div className="mb-8 flex items-center justify-between gap-3">
            <h1 className="h2">Manage Projects</h1>
            <div className="flex items-center gap-3">
              <Link href="/admin/projects/new" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xl font-bold text-white" title="Add new project" aria-label="Add new project">+</Link>
              <button type="button" onClick={handleImportProjects} disabled={importLoading} className="btn btn-outline-primary">
                {importLoading ? "Importing..." : "Import from thongtin.md"}
              </button>
              <Link href="/admin/projects/new" className="btn btn-primary">+ New Project</Link>
            </div>
          </div>

          <div className="mb-6 flex gap-3">
            <Link href="/admin" className="btn btn-outline-primary btn-sm">Dashboard</Link>
            <Link href="/admin/posts" className="btn btn-outline-primary btn-sm">Posts</Link>
            <span className="btn btn-primary btn-sm pointer-events-none">Projects</span>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, slug, status..."
              className="rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
            >
              <option value="all">All status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
            >
              <option value="all">All featured</option>
              <option value="featured">Featured</option>
              <option value="normal">Not featured</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
            >
              <option value="date_desc">Newest</option>
              <option value="date_asc">Oldest</option>
              <option value="title_asc">Title A-Z</option>
              <option value="title_desc">Title Z-A</option>
            </select>
          </div>

          {visibleProjects.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <p className="mr-auto text-sm text-text-light dark:text-darkmode-text-light">
                {visibleProjects.length} projects, selected {selectedIds.length}
              </p>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={!selectedIds.length || bulkDeleteLoading}
                className="btn btn-outline-danger btn-sm"
              >
                {bulkDeleteLoading ? "Deleting..." : `Delete Selected (${selectedIds.length})`}
              </button>
              <button
                type="button"
                onClick={() => handleBulkSetDraft(false)}
                disabled={!selectedIds.length || bulkStatusLoading}
                className="btn btn-outline-primary btn-sm"
              >
                {bulkStatusLoading ? "Updating..." : "Publish Selected"}
              </button>
              <button
                type="button"
                onClick={() => handleBulkSetDraft(true)}
                disabled={!selectedIds.length || bulkStatusLoading}
                className="btn btn-outline-primary btn-sm"
              >
                {bulkStatusLoading ? "Updating..." : "Move To Draft"}
              </button>
              <button
                type="button"
                onClick={() => handleBulkSetFeatured(true)}
                disabled={!selectedIds.length || bulkFeaturedLoading}
                className="btn btn-outline-primary btn-sm"
              >
                {bulkFeaturedLoading ? "Updating..." : "Mark Featured"}
              </button>
              <button
                type="button"
                onClick={() => handleBulkSetFeatured(false)}
                disabled={!selectedIds.length || bulkFeaturedLoading}
                className="btn btn-outline-primary btn-sm"
              >
                {bulkFeaturedLoading ? "Updating..." : "Remove Featured"}
              </button>
            </div>
          )}

          {!visibleProjects.length ? (
            <div className="rounded border border-border p-8 text-center dark:border-darkmode-border">
              No project in Firestore.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full rounded border border-border dark:border-darkmode-border">
                <thead className="bg-gray-100 dark:bg-darkmode-theme-dark">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={pagedProjects.length > 0 && pagedProjects.every((project) => selectedIds.includes(project.id))}
                        onChange={(e) => handleSelectAllInPage(e.target.checked)}
                      />
                    </th>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Slug</th>
                    <th className="p-4 text-left">Date</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Featured</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedProjects.map((project) => (
                    <tr key={project.id} className="border-t border-border dark:border-darkmode-border">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(project.id)}
                          onChange={(e) => handleSelectOne(project.id, e.target.checked)}
                        />
                      </td>
                      <td className="p-4">{project.title}</td>
                      <td className="p-4 text-sm">{project.slug}</td>
                      <td className="p-4 text-sm">{project.date ? dateFormat(normalizeDate(project.date)) : "N/A"}</td>
                      <td className="p-4 text-sm">{project.status || "N/A"}</td>
                      <td className="p-4 text-sm">{project.featured ? "Yes" : "No"}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/admin/projects/${project.id}`} className="btn btn-outline-primary btn-sm">Edit</Link>
                          <button onClick={() => handleDelete(project.id)} disabled={deleteLoading === project.id} className="btn btn-outline-danger btn-sm">
                            {deleteLoading === project.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {visibleProjects.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-text-light dark:text-darkmode-text-light">
                Page {page}/{totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="btn btn-outline-primary btn-sm"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="btn btn-outline-primary btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        confirmLabel={confirmState.confirmLabel}
        onCancel={closeConfirm}
        onConfirm={runConfirmedAction}
        loading={confirmLoading}
      />
      <ToastStack toasts={toasts} onClose={removeToast} />
    </Base>
  );
};

export default AdminProjects;
