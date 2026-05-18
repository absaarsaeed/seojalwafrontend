import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { TableSkeleton } from '../components/SkeletonLoaders';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const isPublished = status === 'Published';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
      isPublished ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
    }`}>
      {status}
    </span>
  );
};

const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

export const Blog = () => {
  const { blogPosts, addBlogPost, updateBlogPost, deleteBlogPost } = useAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    status: 'Draft',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      featuredImage: '',
      metaTitle: '',
      metaDescription: '',
      status: 'Draft',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingPost(null);
  };

  const handleTitleChange = (title) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: slugify(title),
      metaTitle: prev.metaTitle || title
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }

    if (editingPost) {
      updateBlogPost(editingPost.id, formData);
      toast.success('Post updated successfully');
    } else {
      addBlogPost(formData);
      toast.success('Post created successfully');
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content || '',
      featuredImage: post.featuredImage || '',
      metaTitle: post.metaTitle || post.title,
      metaDescription: post.metaDescription || '',
      status: post.status,
      date: post.date
    });
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    deleteBlogPost(id);
    toast.success('Post deleted successfully');
  };

  if (isLoading) {
    return <TableSkeleton rows={10} columns={5} />;
  }

  return (
    <div className="space-y-6" data-testid="blog-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#09090B]">Blog Manager</h2>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="admin-btn-primary" data-testid="new-post-btn">
              <Plus size={16} className="mr-2" />
              New post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? 'Edit Post' : 'Create New Post'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-xs text-[#71717A]">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                  className="admin-input"
                  data-testid="post-title-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-[#71717A]">Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="auto-generated-from-title"
                  className="admin-input"
                  data-testid="post-slug-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-[#71717A]">Content</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your post content..."
                  className="admin-input min-h-[200px]"
                  data-testid="post-content-input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-[#71717A]">Featured Image URL</Label>
                <Input
                  value={formData.featuredImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="admin-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-[#71717A]">SEO Meta Title</Label>
                  <Input
                    value={formData.metaTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="SEO title"
                    className="admin-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-[#71717A]">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}
                  >
                    <SelectTrigger className="border-[#F0F0F0]" data-testid="post-status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-[#71717A]">SEO Meta Description</Label>
                <Textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="Brief description for search engines..."
                  className="admin-input min-h-[80px]"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="admin-btn-primary" data-testid="save-post-btn">
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setDialogOpen(false); resetForm(); }}
                  className="admin-btn-secondary"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts Table */}
      {blogPosts.length === 0 ? (
        <div className="admin-card">
          <EmptyState
            type="file"
            title="No blog posts yet"
            description="Create your first blog post to engage your audience."
            action={
              <Button onClick={() => setDialogOpen(true)} className="admin-btn-primary">
                <Plus size={16} className="mr-2" />
                New post
              </Button>
            }
          />
        </div>
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full admin-table" data-testid="blog-posts-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Views</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogPosts.map((post) => (
                  <tr key={post.id} data-testid={`blog-row-${post.id}`}>
                    <td>
                      <div>
                        <p className="font-medium text-[#09090B]">{post.title}</p>
                        <p className="text-xs text-[#71717A]">/{post.slug}</p>
                      </div>
                    </td>
                    <td><StatusBadge status={post.status} /></td>
                    <td>{post.date}</td>
                    <td>{post.views.toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0"
                          onClick={() => handleEdit(post)}
                          data-testid={`edit-post-${post.id}`}
                        >
                          <Edit size={14} />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-7 w-7 p-0 text-[#EF4444]"
                              data-testid={`delete-post-${post.id}`}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Post</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{post.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(post.id)}
                                className="bg-[#EF4444] hover:bg-[#DC2626]"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
