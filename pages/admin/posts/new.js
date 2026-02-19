import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Base from '@layouts/Baseof';
import { createPost } from '@lib/firestorePosts';
import { onAuthChange } from '@lib/auth';
import { isAdminUser } from '@lib/utils/adminAccess';
import Link from 'next/link';
import { marked } from 'marked';

const NewPost = () => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    author: '',
    image: '',
    date: new Date().toISOString().split('T')[0],
    categories: '',
    tags: '',
    featured: false,
    draft: false,
  });
  const [loading, setLoading] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [user, setUser] = useState(null);
  const [notice, setNotice] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      if (!currentUser || !isAdminUser(currentUser)) {
        router.push('/login');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80);

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
      const postData = {
        ...formData,
        categories: formData.categories
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        tags: formData.tags
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        date: new Date(formData.date).toISOString(),
      };

      const result = await createPost(postData);

      if (result.success) {
        setNotice({ type: 'success', message: 'Post created successfully. Redirecting...' });
        setTimeout(() => router.push('/admin/posts'), 700);
      } else {
        setNotice({ type: 'error', message: 'Error: ' + result.error });
      }
    } catch (error) {
      setNotice({ type: 'error', message: 'Create post failed: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Base>
        <div className="container py-20 text-center">
          <p>Checking access...</p>
        </div>
      </Base>
    );
  }

  return (
    <Base>
      <section className="section">
        <div className="container">
          <div className="mb-8">
            <Link href="/admin/posts" className="text-primary hover:underline">
              Back to posts
            </Link>
            <h1 className="h2 mt-4">Create New Post</h1>
          </div>

          {notice && (
            <div
              className={`mb-6 rounded border px-4 py-3 text-sm ${
                notice.type === 'error'
                  ? 'border-red-300 bg-red-50 text-red-700'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-700'
              }`}
            >
              {notice.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-w-5xl">
            <div className="mb-6">
              <label className="mb-2 block font-medium">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                required
                className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
                placeholder="Enter post title"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium">Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
                placeholder="my-post-slug"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium">Short Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
                placeholder="Short intro for listing pages"
              />
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <label className="block font-medium">Content *</label>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => setPreviewEnabled((prev) => !prev)}
                >
                  {previewEnabled ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows="15"
                className="w-full rounded border border-border p-3 font-mono dark:border-darkmode-border dark:bg-darkmode-theme-light"
                placeholder="Write markdown content..."
              />
              {previewEnabled && (
                <div className="mt-4 rounded border border-border p-4 dark:border-darkmode-border">
                  <p className="mb-2 text-sm font-medium">Markdown Preview</p>
                  <div
                    className="content"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(formData.content || ''),
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="mb-6">
                <label className="mb-2 block font-medium">Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
                />
              </div>

              <div className="mb-6">
                <label className="mb-2 block font-medium">Publish Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium">Categories (comma separated)</label>
              <input
                type="text"
                name="categories"
                value={formData.categories}
                onChange={handleChange}
                className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
                placeholder="technology, programming"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block font-medium">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full rounded border border-border p-3 dark:border-darkmode-border dark:bg-darkmode-theme-light"
                placeholder="nextjs, firebase"
              />
            </div>

            <div className="mb-6 flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                />
                <span>Featured</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="draft"
                  checked={formData.draft}
                  onChange={handleChange}
                />
                <span>Draft</span>
              </label>
            </div>

            <div className="flex gap-4">
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Creating...' : 'Create Post'}
              </button>
              <Link href="/admin/posts" className="btn btn-outline-primary">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </section>
    </Base>
  );
};

export default NewPost;
