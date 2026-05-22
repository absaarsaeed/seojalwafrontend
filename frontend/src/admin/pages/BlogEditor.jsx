import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../components/ui/collapsible';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Upload,
  X as XIcon,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { adminApi } from '../../lib/api';

export const BlogEditor = () => {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('DRAFT');
  const [scheduledAt, setScheduledAt] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [featuredAlt, setFeaturedAlt] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [category, setCategory] = useState('');
  const [author, setAuthor] = useState('SEO Jalwa Team');
  const [seoOpen, setSeoOpen] = useState(true);

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploadingFeatured, setUploadingFeatured] = useState(false);

  // Load existing post
  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await adminApi.blogGet(id);
        const p = res?.post || res || {};
        if (cancelled) return;
        setTitle(p.title || '');
        setContent(p.content || p.body || '');
        setStatus(p.status || 'DRAFT');
        setScheduledAt(p.scheduledAt || p.scheduled_at || '');
        setFeaturedImage(p.featuredImage || p.featured_image || '');
        setFeaturedAlt(p.featuredImageAlt || p.featured_image_alt || '');
        setMetaTitle(p.metaTitle || p.meta_title || '');
        setMetaDescription(p.metaDescription || p.meta_description || '');
        setTags(Array.isArray(p.tags) ? p.tags : []);
        setCategory(p.category || '');
        setAuthor(p.author || 'SEO Jalwa Team');
      } catch (err) {
        toast.error('Could not load post');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isNew]);

  // Image insert handler — uses Quill ref + upload API
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const data = await adminApi.blogUploadImage(file);
        const url = data?.url || data?.imageUrl || data?.path;
        if (!url) throw new Error('No URL returned');
        const editor = quillRef.current?.getEditor?.();
        const range = editor?.getSelection?.();
        editor?.insertEmbed?.(range?.index ?? 0, 'image', url);
        toast.success('Image inserted');
      } catch (err) {
        toast.error(err?.message || 'Image upload failed');
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'blockquote', 'code-block'],
        ['clean'],
      ],
      handlers: { image: imageHandler },
    },
  // We intentionally pin modules to a single instance so the toolbar
  // handlers don't reset on every keystroke.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const handleFeaturedUpload = async (file) => {
    if (!file) return;
    setUploadingFeatured(true);
    try {
      const data = await adminApi.blogUploadImage(file);
      const url = data?.url || data?.imageUrl || data?.path;
      if (url) setFeaturedImage(url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err?.message || 'Image upload failed');
    } finally {
      setUploadingFeatured(false);
    }
  };

  const handleSave = async (targetStatus) => {
    if (!title.trim()) {
      toast.error('Add a title first');
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      content,
      status: targetStatus,
      scheduledAt: targetStatus === 'SCHEDULED' ? scheduledAt : null,
      featuredImage,
      featuredImageAlt: featuredAlt,
      metaTitle,
      metaDescription,
      tags,
      category,
      author,
    };
    try {
      if (isNew) await adminApi.blogCreate(payload);
      else await adminApi.blogUpdate(id, payload);
      toast.success(targetStatus === 'PUBLISHED' ? 'Post published' : 'Saved');
      navigate('/adminpanel/blog');
    } catch (err) {
      toast.error(err?.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim();
      if (!tags.includes(t)) setTags((arr) => [...arr, t]);
      setTagInput('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20" data-testid="blog-editor-loading">
        <Loader2 className="animate-spin text-[#1D9E75]" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="blog-editor-page">
      <button
        onClick={() => navigate('/adminpanel/blog')}
        className="inline-flex items-center gap-1 text-sm text-[#71717A] hover:text-[#09090B]"
        data-testid="back-to-blog"
      >
        <ArrowLeft size={14} /> Back to blog
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr,18rem] gap-4">
        {/* MAIN editor */}
        <div className="admin-card p-5 space-y-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="!text-2xl !font-bold border-0 border-b border-transparent focus-visible:border-[#1D9E75] rounded-none px-0 h-auto py-2"
            data-testid="blog-title-input"
          />
          <div data-testid="blog-content-editor">
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="Write your post..."
              style={{ minHeight: 400 }}
            />
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="admin-card p-4 space-y-5 h-fit lg:sticky lg:top-4" data-testid="blog-editor-sidebar">
          {/* Status */}
          <div>
            <Label className="text-xs text-[#71717A] uppercase tracking-wide mb-1.5 block">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="admin-input" data-testid="blog-status-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            {status === 'SCHEDULED' && (
              <Input
                type="datetime-local"
                value={scheduledAt ? new Date(scheduledAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="admin-input mt-2"
                data-testid="blog-scheduled-at"
              />
            )}
          </div>

          {/* Featured image */}
          <div>
            <Label className="text-xs text-[#71717A] uppercase tracking-wide mb-1.5 block">Featured Image</Label>
            {featuredImage ? (
              <div className="relative">
                <img src={featuredImage} alt={featuredAlt} className="w-full aspect-video object-cover rounded-md" data-testid="featured-image-preview" />
                <button
                  type="button"
                  onClick={() => setFeaturedImage('')}
                  className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center"
                  data-testid="featured-image-remove"
                >
                  <XIcon size={14} />
                </button>
              </div>
            ) : (
              <label className="block border-2 border-dashed border-[#E5E5E5] rounded-md p-4 text-center cursor-pointer hover:border-[#1D9E75] hover:bg-[#FAFAFA] transition-colors" data-testid="featured-image-upload">
                {uploadingFeatured ? (
                  <Loader2 className="animate-spin text-[#1D9E75] mx-auto" size={18} />
                ) : (
                  <>
                    <Upload size={18} className="mx-auto text-[#71717A] mb-1" />
                    <p className="text-xs text-[#71717A]">Click to upload image</p>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFeaturedUpload(e.target.files?.[0])}
                />
              </label>
            )}
            <Input
              value={featuredAlt}
              onChange={(e) => setFeaturedAlt(e.target.value)}
              placeholder="Alt text"
              className="admin-input mt-2"
              data-testid="featured-image-alt"
            />
          </div>

          {/* SEO */}
          <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
            <CollapsibleTrigger className="flex items-center justify-between w-full" data-testid="seo-toggle">
              <Label className="text-xs text-[#71717A] uppercase tracking-wide">SEO</Label>
              <ChevronDown size={14} className={`text-[#71717A] transition-transform ${seoOpen ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              <div>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Meta title"
                  className="admin-input"
                  data-testid="meta-title-input"
                />
                <p className={`text-[10px] mt-0.5 ${metaTitle.length > 60 ? 'text-[#F59E0B]' : 'text-[#9CA3AF]'}`} data-testid="meta-title-count">
                  {metaTitle.length}/60
                </p>
              </div>
              <div>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Meta description"
                  rows={3}
                  className="admin-input"
                  data-testid="meta-description-input"
                />
                <p className={`text-[10px] mt-0.5 ${metaDescription.length > 160 ? 'text-[#F59E0B]' : 'text-[#9CA3AF]'}`} data-testid="meta-description-count">
                  {metaDescription.length}/160
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Tags */}
          <div>
            <Label className="text-xs text-[#71717A] uppercase tracking-wide mb-1.5 block">Tags</Label>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Press Enter to add"
              className="admin-input"
              data-testid="tag-input"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2" data-testid="tag-pills">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#F0F0F0] text-[#27272A] text-xs rounded-full">
                    {t}
                    <button onClick={() => setTags((arr) => arr.filter((x) => x !== t))} className="text-[#71717A] hover:text-[#EF4444]" data-testid={`tag-remove-${t}`}>
                      <XIcon size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Category */}
          <div>
            <Label className="text-xs text-[#71717A] uppercase tracking-wide mb-1.5 block">Category</Label>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} className="admin-input" data-testid="category-input" />
          </div>

          {/* Author */}
          <div>
            <Label className="text-xs text-[#71717A] uppercase tracking-wide mb-1.5 block">Author</Label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} className="admin-input" data-testid="author-input" />
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#F0F0F0]">
            <Button
              variant="outline"
              className="admin-btn-secondary"
              disabled={saving}
              onClick={() => handleSave('DRAFT')}
              data-testid="save-draft-btn"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Draft'}
            </Button>
            <Button
              className="admin-btn-primary"
              disabled={saving}
              onClick={() => handleSave(status === 'SCHEDULED' ? 'SCHEDULED' : 'PUBLISHED')}
              data-testid="publish-btn"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : status === 'SCHEDULED' ? 'Schedule' : 'Publish'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
