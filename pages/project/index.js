import Base from "@layouts/Baseof";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { subscribeToProjects } from "@lib/firestoreProjects";
import dateFormat from "@lib/utils/dateFormat";

const normalizeDate = (value) => {
  if (!value) return new Date().toISOString();
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  return value;
};

const ProjectIndex = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToProjects(
      (nextProjects) => {
        setProjects(nextProjects);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => unsub();
  }, []);

  const published = useMemo(
    () => projects.filter((project) => !project.draft),
    [projects]
  );

  return (
    <Base title="Projects">
      <section className="section">
        <div className="container">
          <h1 className="h2 mb-8 text-center">Projects</h1>

          {loading ? (
            <div className="py-12 text-center">Loading projects...</div>
          ) : published.length ? (
            <div className="row">
              {published.map((project) => (
                <div key={project.id} className="mb-8 lg:col-6">
                  <div className="h-full rounded border border-border p-6 dark:border-darkmode-border">
                    <h3 className="h4 mb-2">{project.title}</h3>
                    <p className="mb-3 text-sm text-gray-500">
                      {dateFormat(normalizeDate(project.date))}
                    </p>
                    <p className="mb-5">{project.summary || project.description}</p>
                    <div className="flex items-center gap-3">
                      <Link className="btn btn-outline-primary" href={`/project/${project.slug}`}>
                        View Detail
                      </Link>
                      {project.demoUrl && (
                        <a className="btn btn-primary" href={project.demoUrl} target="_blank" rel="noreferrer">
                          Demo
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded border border-border p-8 text-center dark:border-darkmode-border">
              No project found in Firestore.
            </div>
          )}
        </div>
      </section>
    </Base>
  );
};

export default ProjectIndex;
