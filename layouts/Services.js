import { markdownify } from "@lib/utils/textConverter";
import shortcodes from "@shortcodes/all";
import { MDXRemote } from "next-mdx-remote";
import Link from "next/link";
import ImageFallback from "./components/ImageFallback";

const Services = ({ data }) => {
  const { frontmatter, mdxContent } = data;
  const {
    title,
    description,
    image,
    cta_label = "Start A Project",
    cta_link = "/contact",
  } = frontmatter;

  return (
    <section className="section mt-10 lg:mt-16">
      <div className="container">
        <div className="mb-12 rounded border border-border p-8 dark:border-darkmode-border lg:p-10">
          <div className="row items-center">
            <div className={image ? "lg:col-7" : "lg:col-12"}>
              {markdownify(title, "h1", "h2 mb-4")}
              {description && (
                <p className="text-lg text-text-light dark:text-darkmode-text-light">
                  {description}
                </p>
              )}
              <div className="mt-6">
                <Link href={cta_link} className="btn btn-primary">
                  {cta_label}
                </Link>
              </div>
            </div>
            {image && (
              <div className="mt-8 lg:col-5 lg:mt-0">
                <ImageFallback
                  src={image}
                  width={640}
                  height={420}
                  alt={title}
                  className="w-full rounded object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="rounded border border-border p-6 dark:border-darkmode-border lg:p-8">
          <div className="content">
            <MDXRemote {...mdxContent} components={shortcodes} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
