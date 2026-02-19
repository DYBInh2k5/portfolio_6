import { useMemo, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Base from '@layouts/Baseof';
import {
  subscribeToPosts,
  createPost,
  deletePost,
  deletePostsBulk,
  updatePostsDraftStatusBulk,
  updatePostsFeaturedStatusBulk,
} from '@lib/firestorePosts';
import { onAuthChange } from '@lib/auth';
import { isAdminUser } from '@lib/utils/adminAccess';
import Link from 'next/link';
import dateFormat from '@lib/utils/dateFormat';
import ConfirmModal from '@layouts/components/admin/ConfirmModal';
import ToastStack from '@layouts/components/admin/ToastStack';

const PAGE_SIZE = 10;

const parsePage = (value) => {
  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.floor(num) : 1;
};

const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkStatusLoading, setBulkStatusLoading] = useState(false);
  const [bulkFeaturedLoading, setBulkFeaturedLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
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

  const openConfirm = ({ title, message, confirmLabel = 'Confirm', onConfirm }) => {
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
      title: '',
      message: '',
      confirmLabel: 'Confirm',
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
    let unsubscribePosts;

    const unsubscribeAuth = onAuthChange((currentUser) => {
      if (!currentUser || !isAdminUser(currentUser)) {
        router.push('/login');
      } else {
        setUser(currentUser);
        unsubscribePosts = subscribeToPosts(
          (allPosts) => {
            setPosts(allPosts);
            setLoading(false);
          },
          () => {
            setLoading(false);
            notify('error', 'Khong the tai danh sach posts.');
          }
        );
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribePosts) unsubscribePosts();
    };
  }, [router]);

  useEffect(() => {
    if (!router.isReady || initializedQuery.current) return;
    setSearch(typeof router.query.q === 'string' ? router.query.q : '');
    setSortBy(typeof router.query.sort === 'string' ? router.query.sort : 'date_desc');
    setStatusFilter(typeof router.query.status === 'string' ? router.query.status : 'all');
    setFeaturedFilter(typeof router.query.featured === 'string' ? router.query.featured : 'all');
    setPage(parsePage(router.query.page));
    initializedQuery.current = true;
  }, [router.isReady, router.query]);

  useEffect(() => {
    if (!router.isReady || !initializedQuery.current) return;
    const query = {};
    if (search) query.q = search;
    if (sortBy !== 'date_desc') query.sort = sortBy;
    if (statusFilter !== 'all') query.status = statusFilter;
    if (featuredFilter !== 'all') query.featured = featuredFilter;
    if (page > 1) query.page = String(page);

    router.replace({ pathname: router.pathname, query }, undefined, { shallow: true });
  }, [search, sortBy, statusFilter, featuredFilter, page, router]);

  const visiblePosts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    let next = [...posts];

    if (keyword) {
      next = next.filter((post) => {
        return [post.title, post.slug, post.author, post.description]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(keyword));
      });
    }

    if (statusFilter === 'published') next = next.filter((post) => !post.draft);
    if (statusFilter === 'draft') next = next.filter((post) => post.draft);
    if (featuredFilter === 'featured') next = next.filter((post) => Boolean(post.featured));
    if (featuredFilter === 'normal') next = next.filter((post) => !post.featured);

    next.sort((a, b) => {
      if (sortBy === 'title_asc') return String(a.title || '').localeCompare(String(b.title || ''));
      if (sortBy === 'title_desc') return String(b.title || '').localeCompare(String(a.title || ''));
      const aTime = new Date(a.date || 0).getTime();
      const bTime = new Date(b.date || 0).getTime();
      return sortBy === 'date_asc' ? aTime - bTime : bTime - aTime;
    });

    return next;
  }, [posts, search, sortBy, statusFilter, featuredFilter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(visiblePosts.length / PAGE_SIZE)), [visiblePosts.length]);

  const pagedPosts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return visiblePosts.slice(start, start + PAGE_SIZE);
  }, [visiblePosts, page]);

  useEffect(() => {
    if (!initializedQuery.current) return;
    setPage(1);
  }, [search, sortBy, statusFilter, featuredFilter]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => visiblePosts.some((post) => post.id === id)));
  }, [visiblePosts]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const handleDelete = (postId) => {
    openConfirm({
      title: 'Xoa bai viet',
      message: 'Ban co chac chan muon xoa bai viet nay?',
      confirmLabel: 'Xoa',
      onConfirm: async () => {
        setDeleteLoading(postId);
        try {
          const result = await deletePost(postId);
          if (!result.success) {
            notify('error', `Loi: ${result.error}`);
            return;
          }
          notify('success', 'Da xoa bai viet.');
        } catch {
          notify('error', 'Loi khi xoa bai viet.');
        } finally {
          setDeleteLoading(null);
        }
      },
    });
  };

  const handleSelectOne = (postId, checked) => {
    setSelectedIds((prev) => {
      if (checked) return Array.from(new Set([...prev, postId]));
      return prev.filter((id) => id !== postId);
    });
  };

  const handleSelectAllInPage = (checked) => {
    if (checked) {
      setSelectedIds((prev) => {
        const merged = new Set(prev);
        pagedPosts.forEach((post) => merged.add(post.id));
        return Array.from(merged);
      });
      return;
    }
    const currentPageIds = new Set(pagedPosts.map((post) => post.id));
    setSelectedIds((prev) => prev.filter((id) => !currentPageIds.has(id)));
  };

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    openConfirm({
      title: 'Xoa nhieu bai viet',
      message: `Xoa ${selectedIds.length} bai viet da chon?`,
      confirmLabel: 'Xoa tat ca',
      onConfirm: async () => {
        setBulkDeleteLoading(true);
        try {
          const result = await deletePostsBulk(selectedIds);
          if (!result.success) {
            notify('error', `Loi: ${result.error}`);
            return;
          }
          setSelectedIds([]);
          notify('success', `Da xoa ${result.deleted || selectedIds.length} bai viet.`);
        } catch (error) {
          notify('error', `Loi xoa hang loat: ${error.message}`);
        } finally {
          setBulkDeleteLoading(false);
        }
      },
    });
  };

  const handleBulkSetDraft = (nextDraft) => {
    if (!selectedIds.length) return;
    openConfirm({
      title: 'Cap nhat trang thai',
      message: nextDraft
        ? `Chuyen ${selectedIds.length} bai viet da chon sang nhap?`
        : `Publish ${selectedIds.length} bai viet da chon?`,
      confirmLabel: 'Xac nhan',
      onConfirm: async () => {
        setBulkStatusLoading(true);
        try {
          const result = await updatePostsDraftStatusBulk(selectedIds, nextDraft);
          if (!result.success) {
            notify('error', `Loi: ${result.error}`);
            return;
          }
          setSelectedIds([]);
          notify('success', nextDraft ? 'Da chuyen sang nhap.' : 'Da publish bai viet da chon.');
        } catch (error) {
          notify('error', `Loi cap nhat trang thai: ${error.message}`);
        } finally {
          setBulkStatusLoading(false);
        }
      },
    });
  };

  const handleBulkSetFeatured = (nextFeatured) => {
    if (!selectedIds.length) return;
    openConfirm({
      title: 'Cap nhat featured',
      message: nextFeatured
        ? `Danh dau featured cho ${selectedIds.length} bai viet da chon?`
        : `Bo featured cho ${selectedIds.length} bai viet da chon?`,
      confirmLabel: 'Xac nhan',
      onConfirm: async () => {
        setBulkFeaturedLoading(true);
        try {
          const result = await updatePostsFeaturedStatusBulk(selectedIds, nextFeatured);
          if (!result.success) {
            notify('error', `Loi: ${result.error}`);
            return;
          }
          setSelectedIds([]);
          notify('success', nextFeatured ? 'Da bat featured.' : 'Da tat featured.');
        } catch (error) {
          notify('error', `Loi cap nhat featured: ${error.message}`);
        } finally {
          setBulkFeaturedLoading(false);
        }
      },
    });
  };

  const handleImportThongTin = async () => {
    setImportLoading(true);
    try {
      const response = await fetch('/api/thongtin-sections');
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || 'Khong the doc thongtin.md');
      }

      const sections = Array.isArray(payload.sections) ? payload.sections : [];
      if (!sections.length) {
        notify('info', 'Khong tim thay section hop le trong thongtin.md.');
        return;
      }

      const existingSlugs = new Set(posts.map((post) => post.slug));
      let createdCount = 0;
      let skippedCount = 0;

      for (const section of sections) {
        if (!section.slug || existingSlugs.has(section.slug)) {
          skippedCount += 1;
          continue;
        }

        const result = await createPost({
          title: section.title,
          slug: section.slug,
          description: section.description,
          content: section.content,
          author: user?.displayName || user?.email || 'Admin',
          image: '',
          date: new Date().toISOString(),
          categories: ['thongtin', 'profile'],
          tags: ['thongtin-md', 'import'],
          featured: false,
          draft: false,
          source: 'thongtin.md',
        });

        if (result.success) {
          createdCount += 1;
          existingSlugs.add(section.slug);
        }
      }

      notify('success', `Import xong: ${createdCount} moi, ${skippedCount} bo qua.`);
    } catch (error) {
      notify('error', `Loi import: ${error.message}`);
    } finally {
      setImportLoading(false);
    }
  };

  if (loading) {
    return (
      <Base>
        <div className="container py-20 text-center">
          <p>Dang tai...</p>
        </div>
      </Base>
    );
  }

  if (!user) return null;

  return (
    <Base>
      <section className="section">
        <div className="container">
          <div className="mb-8 flex items-center justify-between gap-3">
            <h1 className="h2">Quan ly Bai viet</h1>
            <div className="flex items-center gap-3">
              <Link href="/admin/posts/new" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xl font-bold text-white" title="Them bai viet moi" aria-label="Them bai viet moi">+</Link>
              <button type="button" onClick={handleImportThongTin} disabled={importLoading} className="btn btn-outline-primary">
                {importLoading ? 'Dang import...' : 'Import thongtin.md'}
              </button>
              <Link href="/admin/posts/new" className="btn btn-primary">+ Tao bai viet moi</Link>
            </div>
          </div>

          <div className="mb-6 flex gap-3">
            <Link href="/admin" className="btn btn-outline-primary btn-sm">Dashboard</Link>
            <span className="btn btn-primary btn-sm pointer-events-none">Posts</span>
            <Link href="/admin/projects" className="btn btn-outline-primary btn-sm">Projects</Link>
          </div>

          <div className="mb-6 grid gap-3 md:grid-cols-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, slug, author..."
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

          {visiblePosts.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <p className="mr-auto text-sm text-text-light dark:text-darkmode-text-light">
                {visiblePosts.length} posts, da chon {selectedIds.length}
              </p>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={!selectedIds.length || bulkDeleteLoading}
                className="btn btn-outline-danger btn-sm"
              >
                {bulkDeleteLoading ? 'Dang xoa...' : `Xoa da chon (${selectedIds.length})`}
              </button>
              <button
                type="button"
                onClick={() => handleBulkSetDraft(false)}
                disabled={!selectedIds.length || bulkStatusLoading}
                className="btn btn-outline-primary btn-sm"
              >
                {bulkStatusLoading ? 'Dang cap nhat...' : 'Publish da chon'}
              </button>
              <button
                type="button"
                onClick={() => handleBulkSetDraft(true)}
                disabled={!selectedIds.length || bulkStatusLoading}
                className="btn btn-outline-primary btn-sm"
              >
                {bulkStatusLoading ? 'Dang cap nhat...' : 'Chuyen sang nhap'}
              </button>
              <button
                type="button"
                onClick={() => handleBulkSetFeatured(true)}
                disabled={!selectedIds.length || bulkFeaturedLoading}
                className="btn btn-outline-primary btn-sm"
              >
                {bulkFeaturedLoading ? 'Dang cap nhat...' : 'Bat featured'}
              </button>
              <button
                type="button"
                onClick={() => handleBulkSetFeatured(false)}
                disabled={!selectedIds.length || bulkFeaturedLoading}
                className="btn btn-outline-primary btn-sm"
              >
                {bulkFeaturedLoading ? 'Dang cap nhat...' : 'Tat featured'}
              </button>
            </div>
          )}

          {visiblePosts.length === 0 ? (
            <div className="rounded border border-border p-8 text-center dark:border-darkmode-border">
              <p className="mb-4">Khong co bai viet phu hop.</p>
              <Link href="/admin/posts/new" className="btn btn-primary">Tao bai viet moi</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full rounded border border-border dark:border-darkmode-border">
                <thead className="bg-gray-100 dark:bg-darkmode-theme-dark">
                  <tr>
                    <th className="p-4 text-left">
                      <input
                        type="checkbox"
                        checked={pagedPosts.length > 0 && pagedPosts.every((post) => selectedIds.includes(post.id))}
                        onChange={(e) => handleSelectAllInPage(e.target.checked)}
                      />
                    </th>
                    <th className="p-4 text-left">Tieu de</th>
                    <th className="p-4 text-left">Slug</th>
                    <th className="p-4 text-left">Ngay dang</th>
                    <th className="p-4 text-left">Tac gia</th>
                    <th className="p-4 text-left">Featured</th>
                    <th className="p-4 text-center">Thao tac</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedPosts.map((post) => (
                    <tr key={post.id} className="border-t border-border dark:border-darkmode-border">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(post.id)}
                          onChange={(e) => handleSelectOne(post.id, e.target.checked)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{post.title}</div>
                        {post.description && <div className="line-clamp-1 text-sm text-gray-500">{post.description}</div>}
                      </td>
                      <td className="p-4 text-sm">{post.slug}</td>
                      <td className="p-4 text-sm">{post.date ? dateFormat(post.date) : 'N/A'}</td>
                      <td className="p-4 text-sm">{post.author || 'N/A'}</td>
                      <td className="p-4 text-sm">{post.featured ? 'Yes' : 'No'}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/admin/posts/${post.id}`} className="btn btn-outline-primary btn-sm">Sua</Link>
                          <button onClick={() => handleDelete(post.id)} disabled={deleteLoading === post.id} className="btn btn-outline-danger btn-sm">
                            {deleteLoading === post.id ? 'Dang xoa...' : 'Xoa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {visiblePosts.length > PAGE_SIZE && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-text-light dark:text-darkmode-text-light">
                Trang {page}/{totalPages}
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

export default AdminPosts;
