import config from "@config/config.json";
import PostSingle from "@layouts/PostSingle";
import { getSinglePage } from "@lib/contentParser";
import { getAllPosts, getPostBySlug } from "@lib/firestorePosts";
import parseMDX from "@lib/utils/mdxParser";

const { blog_folder } = config.settings;

const normalizeFirestorePost = (post) => {
  const categories = Array.isArray(post.categories)
    ? post.categories
    : typeof post.categories === "string" && post.categories.length
      ? post.categories.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

  const normalizedDate =
    post.date && typeof post.date.toDate === "function"
      ? post.date.toDate().toISOString()
      : post.date || new Date().toISOString();

  return {
    id: post.id,
    slug: post.slug || post.id,
    content: post.content || post.description || "",
    frontmatter: {
      title: post.title || "Untitled",
      description: post.description || "",
      image: post.image || "",
      author: post.author || "",
      categories,
      date: normalizedDate,
      draft: Boolean(post.draft),
      featured: Boolean(post.featured),
    },
  };
};

const categoriesWithCount = (posts) => {
  const counts = new Map();
  posts.forEach((post) => {
    const categories = post.frontmatter?.categories || [];
    categories.forEach((category) => {
      counts.set(category, (counts.get(category) || 0) + 1);
    });
  });
  return Array.from(counts.entries()).map(([name, postsCount]) => ({
    name,
    posts: postsCount,
  }));
};

const Article = ({
  post,
  mdxContent,
  slug,
  allCategories,
  relatedPosts,
  posts,
}) => {
  const { frontmatter, content } = post;

  return (
    <PostSingle
      frontmatter={frontmatter}
      content={content}
      mdxContent={mdxContent}
      slug={slug}
      allCategories={allCategories}
      relatedPosts={relatedPosts}
      posts={posts}
    />
  );
};

export const getStaticPaths = () => {
  const allSlug = getSinglePage(`content/${blog_folder}`);
  const paths = allSlug.map((item) => ({
    params: {
      single: item.slug,
    },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps = async ({ params }) => {
  const { single } = params;
  const markdownPosts = getSinglePage(`content/${blog_folder}`);

  let post = markdownPosts.find((item) => item.slug === single);
  let availablePosts = markdownPosts;

  if (!post) {
    const firestorePost = await getPostBySlug(single);
    if (!firestorePost) {
      return { notFound: true };
    }

    post = normalizeFirestorePost(firestorePost);
    const firestorePosts = await getAllPosts();
    availablePosts = firestorePosts
      .map(normalizeFirestorePost)
      .filter((item) => !item.frontmatter.draft);
  }

  const mdxContent = await parseMDX(post.content || "");
  const postCategories = post.frontmatter?.categories || [];
  const relatedPosts = availablePosts.filter(
    (item) =>
      item.slug !== post.slug &&
      postCategories.some((category) =>
        (item.frontmatter?.categories || []).includes(category)
      )
  );

  return {
    props: {
      post,
      mdxContent,
      slug: single,
      allCategories: categoriesWithCount(availablePosts),
      relatedPosts,
      posts: availablePosts,
    },
    revalidate: 60,
  };
};

export default Article;
