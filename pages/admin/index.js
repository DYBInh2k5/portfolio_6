import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Base from "@layouts/Baseof";
import { onAuthChange } from "@lib/auth";
import { isAdminUser } from "@lib/utils/adminAccess";
import { subscribeToPosts } from "@lib/firestorePosts";
import { subscribeToProjects } from "@lib/firestoreProjects";
import dateFormat from "@lib/utils/dateFormat";

const getDateValue = (value) => {
  if (!value) return "";
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  return value;
};

const AdminDashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let unsubscribePosts;
    let unsubscribeProjects;

    const unsubscribeAuth = onAuthChange((currentUser) => {
      if (!currentUser || !isAdminUser(currentUser)) {
        router.push("/login");
        return;
      }

      setUser(currentUser);
      unsubscribePosts = subscribeToPosts(
        (items) => {
          setPosts(items);
          setLoading(false);
        },
        () => setLoading(false)
      );
      unsubscribeProjects = subscribeToProjects(
        (items) => {
          setProjects(items);
          setLoading(false);
        },
        () => setLoading(false)
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribePosts) unsubscribePosts();
      if (unsubscribeProjects) unsubscribeProjects();
    };
  }, [router]);

  const stats = useMemo(() => {
    const publishedPosts = posts.filter((item) => !item.draft).length;
    const draftPosts = posts.filter((item) => item.draft).length;
    const publishedProjects = projects.filter((item) => !item.draft).length;
    const draftProjects = projects.filter((item) => item.draft).length;
    return { publishedPosts, draftPosts, publishedProjects, draftProjects };
  }, [posts, projects]);

  const recentPosts = useMemo(() => posts.slice(0, 5), [posts]);
  const recentProjects = useMemo(() => projects.slice(0, 5), [projects]);

  if (loading) {
    return (
      <Base>
        <div className="container py-20 text-center">Loading dashboard...</div>
      </Base>
    );
  }

  if (!user) return null;

  return (
    <Base>
      <section className="section">
        <div className="container">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="h2">Admin Dashboard</h1>
              <p className="text-sm text-text-light dark:text-darkmode-text-light">
                Signed in as {user.email || "admin"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/posts/new" className="btn btn-primary">
                + New Post
              </Link>
              <Link href="/admin/projects/new" className="btn btn-outline-primary">
                + New Project
              </Link>
            </div>
          </div>

          <div className="mb-6 flex gap-3">
            <span className="btn btn-primary btn-sm pointer-events-none">Dashboard</span>
            <Link href="/admin/posts" className="btn btn-outline-primary btn-sm">
              Posts
            </Link>
            <Link href="/admin/projects" className="btn btn-outline-primary btn-sm">
              Projects
            </Link>
          </div>

          <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded border border-border p-4 dark:border-darkmode-border">
              <p className="text-sm text-text-light dark:text-darkmode-text-light">Published Posts</p>
              <p className="mt-2 text-3xl font-bold">{stats.publishedPosts}</p>
            </div>
            <div className="rounded border border-border p-4 dark:border-darkmode-border">
              <p className="text-sm text-text-light dark:text-darkmode-text-light">Draft Posts</p>
              <p className="mt-2 text-3xl font-bold">{stats.draftPosts}</p>
            </div>
            <div className="rounded border border-border p-4 dark:border-darkmode-border">
              <p className="text-sm text-text-light dark:text-darkmode-text-light">Published Projects</p>
              <p className="mt-2 text-3xl font-bold">{stats.publishedProjects}</p>
            </div>
            <div className="rounded border border-border p-4 dark:border-darkmode-border">
              <p className="text-sm text-text-light dark:text-darkmode-text-light">Draft Projects</p>
              <p className="mt-2 text-3xl font-bold">{stats.draftProjects}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded border border-border p-4 dark:border-darkmode-border">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="h5 mb-0">Recent Posts</h2>
                <Link href="/admin/posts" className="text-sm text-primary hover:underline">
                  Manage
                </Link>
              </div>
              {!recentPosts.length ? (
                <p className="text-sm text-text-light dark:text-darkmode-text-light">No posts yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentPosts.map((post) => (
                    <li key={post.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{post.title || "Untitled"}</p>
                        <p className="text-xs text-text-light dark:text-darkmode-text-light">
                          {post.slug || "no-slug"}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-text-light dark:text-darkmode-text-light">
                        {post.date ? dateFormat(getDateValue(post.date)) : "N/A"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded border border-border p-4 dark:border-darkmode-border">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="h5 mb-0">Recent Projects</h2>
                <Link href="/admin/projects" className="text-sm text-primary hover:underline">
                  Manage
                </Link>
              </div>
              {!recentProjects.length ? (
                <p className="text-sm text-text-light dark:text-darkmode-text-light">No projects yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentProjects.map((project) => (
                    <li key={project.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{project.title || "Untitled"}</p>
                        <p className="text-xs text-text-light dark:text-darkmode-text-light">
                          {project.slug || "no-slug"}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-text-light dark:text-darkmode-text-light">
                        {project.date ? dateFormat(getDateValue(project.date)) : "N/A"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>
    </Base>
  );
};

export default AdminDashboard;
