import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { publicApi } from '../../lib/api';
import { DUMMY_BLOG_POSTS } from '../../data/publicData';
import { ArrowLeft, Clock, Calendar, Twitter, Linkedin, Facebook } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

// Map a backend post (any reasonable shape) to the UI shape used by the cards.
const adaptPost = (p) => ({
  id: p.id || p._id || p.slug,
  slug: p.slug || p.id,
  title: p.title,
  excerpt: p.excerpt || p.summary || p.description || '',
  category: p.category || p.tag || 'Article',
  date: p.publishedAt
    ? new Date(p.publishedAt).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : p.date || '',
  readTime: p.readTime || p.readingTime || '5 min read',
  image:
    p.coverImage ||
    p.image ||
    `https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80`,
  content: p.content || p.body || '',
});

// Blog listing page
export const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await publicApi.blogList({ status: 'published', limit: 24 });
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.posts || [];
        if (list.length) {
          setPosts(list.map(adaptPost));
        } else {
          // Backend has no posts yet — show launch-state fallback so the page isn't blank.
          setPosts(DUMMY_BLOG_POSTS);
          setUsedFallback(true);
        }
      } catch {
        if (cancelled) return;
        setPosts(DUMMY_BLOG_POSTS);
        setUsedFallback(true);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen" data-testid="blog-page">
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-syne text-4xl sm:text-5xl font-extrabold text-[#0A0A0A] mb-6"
          >
            The SEO Jalwa Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#6B7280]"
          >
            Tips, strategies, and insights on AI visibility, SEO, and content marketing.
          </motion.p>
        </div>
      </section>

      <section className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="blog-loading">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden animate-pulse">
                  <div className="aspect-[16/9] bg-[#F0F0F0]" />
                  <div className="p-6 space-y-3">
                    <div className="h-3 w-20 bg-[#F0F0F0] rounded" />
                    <div className="h-5 bg-[#F0F0F0] rounded w-3/4" />
                    <div className="h-3 bg-[#F0F0F0] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 text-[#6B7280]" data-testid="blog-empty">
              No posts yet. Check back soon!
            </div>
          ) : (
            <>
              {usedFallback && (
                <div className="mb-8 inline-block px-3 py-1 bg-[#FEF3C7] text-[#92400E] text-xs font-medium rounded-full" data-testid="blog-fallback-notice">
                  Showing preview content while we publish our launch articles.
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <motion.article
                    key={post.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                    className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden hover:shadow-lg transition-shadow"
                    data-testid={`blog-card-${post.slug}`}
                  >
                    <Link to={`/blog/${post.slug}`}>
                      <div className="aspect-[16/9] bg-[#F0F0F0] overflow-hidden">
                        <img src={post.image} alt={post.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="p-6">
                        <span className="inline-block px-2 py-1 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full mb-3">
                          {post.category}
                        </span>
                        <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mb-2 line-clamp-2">{post.title}</h2>
                        <p className="text-[#6B7280] text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                        <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                          {post.date && (
                            <span className="flex items-center gap-1"><Calendar size={14} />{post.date}</span>
                          )}
                          <span className="flex items-center gap-1"><Clock size={14} />{post.readTime}</span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        const data = await publicApi.blogPost(slug);
        if (cancelled) return;
        setPost(adaptPost(data?.post || data));
      } catch (err) {
        if (cancelled) return;
        const fallback = DUMMY_BLOG_POSTS.find((p) => p.slug === slug);
        if (fallback) {
          setPost(fallback);
        } else {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
      // Always fetch related from list (best-effort)
      try {
        const list = await publicApi.blogList({ limit: 4 });
        if (cancelled) return;
        const arr = Array.isArray(list) ? list : list?.posts || [];
        const adapted = arr.map(adaptPost).filter((p) => p.slug !== slug).slice(0, 3);
        setRelated(adapted.length ? adapted : DUMMY_BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3));
      } catch {
        if (!cancelled) setRelated(DUMMY_BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="blog-post-loading">
        <div className="w-8 h-8 border-2 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" data-testid="blog-post-not-found">
        <h1 className="font-syne text-3xl font-bold text-[#0A0A0A] mb-4">Article not found</h1>
        <Link to="/blog" className="text-[#1D9E75] font-medium hover:underline">Back to blog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" data-testid="blog-post-page">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1D9E75]">
          <ArrowLeft size={16} />
          Back to blog
        </Link>
      </div>

      <article className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-2 py-1 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full mb-4">
              {post.category}
            </span>
            <h1 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0A0A0A] mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[#6B7280] mb-8">
              {post.date && <span className="flex items-center gap-1"><Calendar size={16} />{post.date}</span>}
              <span className="flex items-center gap-1"><Clock size={16} />{post.readTime}</span>
            </div>
          </motion.div>

          {post.image && (
            <div className="aspect-[16/9] rounded-xl overflow-hidden mb-8">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-lg max-w-none text-[#6B7280]">
            {post.content ? (
              // If backend returns HTML (sanitised server-side), render directly; otherwise plain text.
              /<[a-z][\s\S]*>/i.test(post.content) ? (
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              ) : (
                post.content.split('\n').map((para, i) => (
                  <p key={i} className="leading-relaxed mb-6">{para}</p>
                ))
              )
            ) : (
              <p className="text-lg leading-relaxed mb-6">{post.excerpt}</p>
            )}
          </div>

          <div className="mt-12 pt-8 border-t border-[#F0F0F0]">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[#0A0A0A]">Share this article:</span>
              <div className="flex gap-2">
                <button className="p-2 rounded-full bg-[#F0F0F0] hover:bg-[#1DA1F2] hover:text-white transition-colors"><Twitter size={18} /></button>
                <button className="p-2 rounded-full bg-[#F0F0F0] hover:bg-[#0A66C2] hover:text-white transition-colors"><Linkedin size={18} /></button>
                <button className="p-2 rounded-full bg-[#F0F0F0] hover:bg-[#1877F2] hover:text-white transition-colors"><Facebook size={18} /></button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="py-12 bg-[#F9FAFB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((relPost) => (
                <Link key={relPost.id} to={`/blog/${relPost.slug}`} className="bg-white rounded-xl border border-[#F0F0F0] p-4 hover:shadow-lg transition-shadow">
                  <h3 className="font-semibold text-[#0A0A0A] mb-2 line-clamp-2">{relPost.title}</h3>
                  <p className="text-sm text-[#6B7280]">{relPost.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
