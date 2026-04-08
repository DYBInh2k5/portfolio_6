import config from "@config/config.json";
import Base from "@layouts/Baseof";
import ImageFallback from "@layouts/components/ImageFallback";
import Pagination from "@layouts/components/Pagination";
import Post from "@layouts/partials/Post";
import Sidebar from "@layouts/partials/Sidebar";
import { getListPage, getSinglePage } from "@lib/contentParser";
import { getTaxonomy } from "@lib/taxonomyParser";
import dateFormat from "@lib/utils/dateFormat";
import { sortByDate } from "@lib/utils/sortFunctions";
import { markdownify } from "@lib/utils/textConverter";
import Link from "next/link";
import { FaRegCalendar } from "react-icons/fa";
const { blog_folder, pagination } = config.settings;

const Home = ({
  banner,
  posts,
  featured_posts,
  recent_posts,
  categories,
  promotion,
  service_packages,
  case_studies,
  testimonials,
  lead_magnet,
}) => {
  // define state
  const sortPostByDate = sortByDate(posts);
  const featuredPosts = sortPostByDate.filter(
    (post) => post.frontmatter.featured
  );
  const showPosts = pagination;

  return (
    <Base>
      {/* Banner */}
      <section className="section banner relative pb-0">
        <ImageFallback
          className="absolute bottom-0 left-0 z-[-1] w-full"
          src={"/images/banner-bg-shape.svg"}
          width={1905}
          height={295}
          alt="banner-shape"
          priority
        />

        <div className="container">
          <div className="row flex-wrap-reverse items-center justify-center lg:flex-row">
            <div className={banner.image_enable ? "mt-12 text-center lg:mt-0 lg:text-left lg:col-6" : "mt-12 text-center lg:mt-0 lg:text-left lg:col-12"}>
              <div className="banner-title">
                {markdownify(banner.title, "h1")}
                {markdownify(banner.title_small, "span")}
              </div>
              {markdownify(banner.content, "p", "mt-4")}
              {banner.button.enable && (
                  <Link
                    className="btn btn-primary mt-6"
                    href={banner.button.link}
                    rel={banner.button.rel}
                  >
                    {banner.button.label}
                  </Link>
              )}
            </div>
            {banner.image_enable && (
                <div className="col-9 lg:col-6">
                  <ImageFallback
                    className="mx-auto object-contain"
                    src={banner.image}
                    width={548}
                    height={443}
                    priority={true}
                    alt="Banner Image"
                  />
                </div>
            )}
          </div>
        </div>
      </section>

      {/* Home main */}
      <section className="section">
        <div className="container">
          <div className="row items-start">
            <div className="mb-12 lg:mb-0 lg:col-8">
              {/* Featured posts */}
              {featured_posts.enable && featuredPosts.length > 0 && (
                <div className="section">
                  {markdownify(featured_posts.title, "h2", "section-title")}
                  <div className="rounded border border-border p-6 dark:border-darkmode-border">
                    <div className="row">
                      <div className="md:col-6">
                        <Post post={featuredPosts[0]} />
                      </div>
                      <div className="scrollbar-w-[10px] mt-8 max-h-[480px] scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-border dark:scrollbar-track-gray-800 dark:scrollbar-thumb-darkmode-theme-dark md:mt-0 md:col-6">
                        {featuredPosts
                          .slice(1, featuredPosts.length)
                          .map((post, i, arr) => (
                            <div
                              className={`mb-6 flex items-center pb-6 ${
                                i !== arr.length - 1 &&
                                "border-b border-border dark:border-darkmode-border"
                              }`}
                              key={`key-${i}`}
                            >
                              {post.frontmatter.image && (
                                <ImageFallback
                                  className="mr-3 h-[85px] rounded object-cover"
                                  src={post.frontmatter.image}
                                  alt={post.frontmatter.title}
                                  width={105}
                                  height={85}
                                />
                              )}
                              <div>
                                <h3 className="h5 mb-2">
                                  <Link
                                    href={`/${blog_folder}/${post.slug}`}
                                    className="block hover:text-primary"
                                  >
                                    {post.frontmatter.title}
                                  </Link>
                                </h3>
                                <p className="inline-flex items-center font-bold">
                                  <FaRegCalendar className="mr-1.5" />
                                  {dateFormat(post.frontmatter.date)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Promotion */}
              {promotion.enable && (
                <Link href={promotion.link} className="section block pt-0">
                  <ImageFallback
                    className="h-full w-full"
                    height="115"
                    width="800"
                    src={promotion.image}
                    alt="promotion"
                  />
                </Link>
              )}

              {/* Recent Posts */}
              {recent_posts.enable && (
                <div className="section pt-0">
                  {markdownify(recent_posts.title, "h2", "section-title")}
                  <div className="rounded border border-border px-6 pt-6 dark:border-darkmode-border">
                    <div className="row">
                      {sortPostByDate.slice(0, showPosts).map((post) => (
                        <div className="mb-8 md:col-6" key={post.slug}>
                          <Post post={post} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Service Packages */}
              {service_packages?.enable && service_packages?.items?.length > 0 && (
                <div className="section pt-0">
                  {markdownify(service_packages.title, "h2", "section-title")}
                  <div className="row">
                    {service_packages.items.map((item, index) => (
                      <div className="mb-6 md:col-4" key={`package-${index}`}>
                        <div className="h-full rounded border border-border p-6 dark:border-darkmode-border">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-primary">
                            {item.timeline}
                          </p>
                          <h3 className="h4 mb-2">{item.name}</h3>
                          <p className="mb-4 text-sm text-light dark:text-darkmode-light">
                            {item.price}
                          </p>
                          <p className="mb-6">{item.outcome}</p>
                          {item.cta_link && (
                            <Link className="btn btn-outline-primary btn-sm" href={item.cta_link}>
                              {item.cta_label || "Get Details"}
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Case Studies */}
              {case_studies?.enable && case_studies?.items?.length > 0 && (
                <div className="section pt-0">
                  {markdownify(case_studies.title, "h2", "section-title")}
                  <div className="rounded border border-border p-6 dark:border-darkmode-border">
                    <div className="row">
                      {case_studies.items.map((item, index) => (
                        <div className="mb-6 lg:mb-0 lg:col-4" key={`case-${index}`}>
                          <h3 className="h5 mb-3">{item.name}</h3>
                          <p className="mb-2 text-sm font-semibold text-primary">{item.impact}</p>
                          <p className="mb-4 text-sm">{item.summary}</p>
                          {item.link && (
                            <Link className="text-primary font-semibold hover:underline" href={item.link}>
                              {item.link_label || "View Project"}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Testimonials */}
              {testimonials?.enable && testimonials?.items?.length > 0 && (
                <div className="section pt-0">
                  {markdownify(testimonials.title, "h2", "section-title")}
                  <div className="row">
                    {testimonials.items.map((item, index) => (
                      <div className="mb-6 md:col-6" key={`testimonial-${index}`}>
                        <div className="h-full rounded border border-border p-6 dark:border-darkmode-border">
                          <p className="mb-4 italic">"{item.quote}"</p>
                          <p className="font-semibold">{item.author}</p>
                          <p className="text-sm text-light dark:text-darkmode-light">{item.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lead Magnet */}
              {lead_magnet?.enable && (
                <div className="section pt-0">
                  <div className="rounded border border-primary bg-theme-light p-8 text-center dark:bg-darkmode-theme-dark">
                    {markdownify(lead_magnet.title, "h2", "mb-3")}
                    <p className="mx-auto mb-6 max-w-2xl">{lead_magnet.content}</p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {lead_magnet.primary_link && (
                        <Link className="btn btn-primary" href={lead_magnet.primary_link}>
                          {lead_magnet.primary_label || "Book a call"}
                        </Link>
                      )}
                      {lead_magnet.secondary_link && (
                        <Link className="btn btn-outline-primary" href={lead_magnet.secondary_link}>
                          {lead_magnet.secondary_label || "Download"}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <Pagination
                totalPages={Math.ceil(posts.length / showPosts)}
                currentPage={1}
              />
            </div>
            {/* sidebar */}
            <Sidebar
              className={"lg:mt-[9.5rem]"}
              posts={posts}
              categories={categories}
            />
          </div>
        </div>
      </section>
    </Base>
  );
};

export default Home;

// for homepage data
export const getStaticProps = async () => {
  const homepage = await getListPage("content/_index.md");
  const { frontmatter } = homepage;
  const {
    banner,
    featured_posts,
    recent_posts,
    promotion,
    service_packages,
    case_studies,
    testimonials,
    lead_magnet,
  } = frontmatter;
  const posts = getSinglePage(`content/${blog_folder}`);
  const categories = getTaxonomy(`content/${blog_folder}`, "categories");

  const categoriesWithPostsCount = categories.map((category) => {
    const filteredPosts = posts.filter((post) =>
      post.frontmatter.categories.includes(category)
    );
    return {
      name: category,
      posts: filteredPosts.length,
    };
  });

  return {
    props: {
      banner: banner,
      posts: posts,
      featured_posts,
      recent_posts,
      promotion,
      service_packages,
      case_studies,
      testimonials,
      lead_magnet,
      categories: categoriesWithPostsCount,
    },
  };
};
