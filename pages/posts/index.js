import Base from "@layouts/Baseof";
import Post from "@partials/Post";
import { getListPage } from "@lib/contentParser";
import { subscribeToPosts } from "@lib/firestorePosts";
import { markdownify } from "@lib/utils/textConverter";
import { useEffect, useMemo, useState } from "react";

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

const PostsPage = ({ postIndex }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const title = postIndex?.frontmatter?.title || "Posts";

  useEffect(() => {
    const unsubscribe = subscribeToPosts(
      (nextPosts) => {
        setPosts(nextPosts);
        setLoading(false);
      },
      () => {
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const mappedPosts = useMemo(() => {
    return posts
      .map(normalizeFirestorePost)
      .filter((post) => !post.frontmatter.draft);
  }, [posts]);

  return (
    <Base title={title}>
      <section className="section">
        <div className="container">
          {markdownify(title, "h1", "h2 mb-8 text-center")}

          {loading ? (
            <div className="py-12 text-center">Loading posts...</div>
          ) : mappedPosts.length ? (
            <div className="row mb-16">
              {mappedPosts.map((post) => (
                <div className="mt-16 lg:col-6" key={post.id}>
                  <Post post={post} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded border border-border p-8 text-center dark:border-darkmode-border">
              No posts found in Firestore.
            </div>
          )}
        </div>
      </section>
    </Base>
  );
};

export const getStaticProps = async () => {
  const postIndex = await getListPage("content/posts/_index.md");
  return {
    props: {
      postIndex,
    },
  };
};

export default PostsPage;
