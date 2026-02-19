import Base from "@layouts/Baseof";
import { markdownify } from "@lib/utils/textConverter";
import { subscribeToProjectBySlug } from "@lib/firestoreProjects";
import dateFormat from "@lib/utils/dateFormat";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

const normalizeDate = (value) => {
  if (!value) return new Date().toISOString();
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  return value;
};

const ProjectSingle = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug || Array.isArray(slug)) return;

    const unsub = subscribeToProjectBySlug(
      slug,
      (nextProject) => {
        setProject(nextProject);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, [slug]);

  const safeDate = useMemo(() => normalizeDate(project?.date), [project]);

  if (loading) {
    return (
      <Base title="Project">
        <section className="section">
          <div className="container text-center py-16">Loading project...</div>
        </section>
      </Base>
    );
  }

  if (!project) {
    return (
      <Base title="Project not found">
        <section className="section">
          <div className="container text-center py-16">
            <p className="mb-6">Project not found.</p>
            <Link href="/project" className="btn btn-primary">Back to projects</Link>
          </div>
        </section>
      </Base>
    );
  }

  return (
    <Base title={project.title} description={project.summary || project.description || ""}>
      <section className="section">
        <div className="container max-w-4xl">
          <Link href="/project" className="text-primary hover:underline">\u2190 Back to projects</Link>
          <h1 className="h2 mt-4">{project.title}</h1>
          <p className="text-sm text-gray-500 mt-2">{dateFormat(safeDate)}</p>

          {project.summary && <p className="mt-6 text-lg">{project.summary}</p>}

          {project.techStack && (
            <div className="mt-6 rounded border border-border p-4 dark:border-darkmode-border">
              <h2 className="h5 mb-2">Tech Stack</h2>
              <p>{project.techStack}</p>
            </div>
          )}

          {project.content && (
            <div className="content mt-8">{markdownify(project.content, "div")}</div>
          )}

          <div className="mt-8 flex gap-3">
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noreferrer" className="btn btn-outline-primary">
                Repository
              </a>
            )}
            {project.demoUrl && (
              <a href={project.demoUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
                Live Demo
              </a>
            )}
          </div>
        </div>
      </section>
    </Base>
  );
};

export default ProjectSingle;
