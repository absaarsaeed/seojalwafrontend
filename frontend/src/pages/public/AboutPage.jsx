import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ArrowRight, Sparkles, Zap, Target } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const AboutPage = () => {
  return (
    <div className="min-h-screen" data-testid="about-page">
      {/* Hero */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-syne text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A0A0A] mb-6"
          >
            We built what we couldn't find
          </motion.h1>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-[#F9FAFB]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-6">The Jalwa Origin</h2>
            <div className="prose prose-lg text-[#6B7280]">
              <p className="text-lg leading-relaxed mb-6">
                <strong className="text-[#1D9E75]">Jalwa (جلوہ)</strong> is an Arabic-origin word used in Urdu and Hindi. 
                It means <em>splendor, radiance, brilliance</em> — making your presence felt so powerfully, 
                people can't ignore you.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                That's exactly what we built SEO Jalwa to do for your business.
              </p>
              <p className="text-lg leading-relaxed">
                We were tired of juggling 5 different marketing tools, paying for overlapping features, 
                and manually connecting data between systems. So we built the platform we wished existed — 
                one that handles SEO, AI visibility, content, and social media in a single, connected system.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-6">Our Mission</h2>
            <p className="text-xl text-[#6B7280]">
              Every business deserves to shine online. Not just the ones who can afford 
              5 different tools and a full marketing team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#E1F5EE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-12 text-center">What We Believe</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: 'Radically Simple',
                description: 'Complex tools slow you down. We obsess over making powerful features feel effortless.'
              },
              {
                icon: Zap,
                title: 'Genuinely Automated',
                description: 'Automation shouldn\'t mean more work. Set it once, then focus on what matters.'
              },
              {
                icon: Target,
                title: 'Built for Results',
                description: 'Every feature exists to improve your Jalwa Score. If it doesn\'t move the needle, we don\'t build it.'
              }
            ].map((value) => (
              <motion.div
                key={value.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="bg-white rounded-xl p-6 border border-[#F0F0F0]"
              >
                <div className="w-12 h-12 rounded-lg bg-[#E1F5EE] flex items-center justify-center mb-4">
                  <value.icon size={24} className="text-[#1D9E75]" />
                </div>
                <h3 className="font-syne text-xl font-bold text-[#0A0A0A] mb-2">{value.title}</h3>
                <p className="text-[#6B7280]">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-syne text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to make your brand shine?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Join 2,400+ businesses using SEO Jalwa to dominate online.
          </p>
          <Link to="/signup">
            <Button size="lg" className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white rounded-full px-8">
              Start free trial <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
