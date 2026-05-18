import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { DUMMY_BLOG_POSTS } from '../../data/publicData';
import { ArrowLeft, ArrowRight, Clock, Calendar, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';
import { Button } from '../../components/ui/button';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

// Blog listing page
export const BlogPage = () => {
  return (
    <div className="min-h-screen" data-testid="blog-page">
      {/* Hero */}
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

      {/* Blog Grid */}
      <section className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {DUMMY_BLOG_POSTS.map((post, i) => (
              <motion.article
                key={post.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="bg-white rounded-xl border border-[#F0F0F0] overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link to={`/blog/${post.slug}`}>
                  <div className="aspect-[16/9] bg-[#F0F0F0] overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <span className="inline-block px-2 py-1 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full mb-3">
                      {post.category}
                    </span>
                    <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mb-2 line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-[#6B7280] text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#6B7280]">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// Single blog post page
export const BlogPostPage = () => {
  const { slug } = useParams();
  const post = DUMMY_BLOG_POSTS.find(p => p.slug === slug) || DUMMY_BLOG_POSTS[0];
  const relatedPosts = DUMMY_BLOG_POSTS.filter(p => p.slug !== slug).slice(0, 3);

  return (
    <div className="min-h-screen" data-testid="blog-post-page">
      {/* Back link */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-[#6B7280] hover:text-[#1D9E75]">
          <ArrowLeft size={16} />
          Back to blog
        </Link>
      </div>

      {/* Article */}
      <article className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-block px-2 py-1 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full mb-4">
              {post.category}
            </span>
            <h1 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0A0A0A] mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-[#6B7280] mb-8">
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                {post.readTime}
              </span>
            </div>
          </motion.div>

          {/* Featured Image */}
          <div className="aspect-[16/9] rounded-xl overflow-hidden mb-8">
            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-[#6B7280]">
            <p className="text-lg leading-relaxed mb-6">
              {post.excerpt}
            </p>
            <p className="leading-relaxed mb-6">
              In today's rapidly evolving digital landscape, understanding how AI systems perceive and recommend 
              your brand has become crucial. Traditional SEO is no longer enough — you need to optimize for 
              AI visibility as well.
            </p>
            <h2 className="font-syne text-2xl font-bold text-[#0A0A0A] mt-8 mb-4">Key Takeaways</h2>
            <ul className="space-y-2">
              <li>AI visibility is becoming as important as traditional search visibility</li>
              <li>Content quality and accuracy matter more than keyword density</li>
              <li>Building topical authority helps both SEO and AI recommendations</li>
              <li>Regular monitoring of AI responses about your brand is essential</li>
            </ul>
            <h2 className="font-syne text-2xl font-bold text-[#0A0A0A] mt-8 mb-4">Conclusion</h2>
            <p className="leading-relaxed">
              The brands that win in 2026 and beyond will be those that understand the dual nature of 
              modern visibility — optimizing for both search engines and AI systems. Start monitoring 
              your AI visibility today and take action to improve your brand's digital presence.
            </p>
          </div>

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-[#F0F0F0]">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[#0A0A0A]">Share this article:</span>
              <div className="flex gap-2">
                <button className="p-2 rounded-full bg-[#F0F0F0] hover:bg-[#1DA1F2] hover:text-white transition-colors">
                  <Twitter size={18} />
                </button>
                <button className="p-2 rounded-full bg-[#F0F0F0] hover:bg-[#0A66C2] hover:text-white transition-colors">
                  <Linkedin size={18} />
                </button>
                <button className="p-2 rounded-full bg-[#F0F0F0] hover:bg-[#1877F2] hover:text-white transition-colors">
                  <Facebook size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      <section className="py-12 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-8">Related Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relPost) => (
              <Link key={relPost.id} to={`/blog/${relPost.slug}`} className="bg-white rounded-xl border border-[#F0F0F0] p-4 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-[#0A0A0A] mb-2 line-clamp-2">{relPost.title}</h3>
                <p className="text-sm text-[#6B7280]">{relPost.readTime}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
