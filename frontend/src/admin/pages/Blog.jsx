import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../lib/api';

const StatusBadge = ({ status }) => {
  const s = (status || 'DRAFT').toUpperCase();
  const map = {
    PUBLISHED: 'bg-[#E1F5EE] text-[#1D9E75]',
    DRAFT:     'bg-[#F0F0F0] text-[#6B7280]',
    SCHEDULED: 'bg-[#DBEAFE] text-[#2563EB]',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[s] || map.DRAFT}`} data-testid={`blog-status-${s.toLowerCase()}`}>
      {s}
    </span>
  );
};

export const Blog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.blog();
      const list = Array.isArray(res) ? res : res?.posts || res?.items || [];
      setPosts(list);
    } catch (err) {
      toast.error(err?.message || 'Could not load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    try {
      await adminApi.blogDelete(post.id);
      toast.success('Post deleted');
      setPosts((p) => p.filter((x) => x.id !== post.id));
    } catch (err) {
      toast.error(err?.message || 'Could not delete');
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-blog-list">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#09090B]">Blog</h2>
          <p className="text-sm text-[#71717A]">Write and manage public blog posts.</p>
        </div>
        <Link to="/adminpanel/blog/new">
          <Button className="admin-btn-primary" data-testid="new-post-btn">
            <Plus size={16} className="mr-2" /> New post
          </Button>
        </Link>
      </div>

      <div className="admin-card">
        {loading ? (
          <div className="flex items-center justify-center py-16" data-testid="blog-loading">
            <Loader2 className="animate-spin text-[#1D9E75]" size={24} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16" data-testid="blog-empty">
            <p className="text-sm text-[#71717A] mb-3">No blog posts yet.</p>
            <Link to="/adminpanel/blog/new">
              <Button className="admin-btn-primary">Write your first post</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Read time</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody data-testid="blog-posts-tbody">
                {posts.map((p) => (
                  <tr key={p.id} data-testid={`blog-row-${p.id}`}>
                    <td className="font-medium">{p.title}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td className="text-xs text-[#71717A]">
                      {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="text-xs text-[#71717A]">{p.readTime || p.read_time || '—'}</td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        {p.slug && p.status === 'PUBLISHED' && (
                          <a
                            href={`/blog/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#1D9E75] hover:underline inline-flex items-center gap-1"
                            data-testid={`blog-view-${p.id}`}
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                        <Link to={`/adminpanel/blog/${p.id}`} className="text-[#2563EB] hover:underline" data-testid={`blog-edit-${p.id}`}>
                          <Edit2 size={14} />
                        </Link>
                        <button onClick={() => handleDelete(p)} className="text-[#EF4444] hover:text-[#DC2626]" data-testid={`blog-delete-${p.id}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
