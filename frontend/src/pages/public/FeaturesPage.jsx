import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Check, Radar, Pen, Send, Share2, ArrowRight } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const modules = [
  {
    id: 'ai-visibility',
    icon: Radar,
    name: 'AI Visibility',
    tagline: 'AI Visibility Monitoring',
    headline: 'Know exactly what AI says about you — and fix it',
    description: 'While your competitors wonder why they\'re invisible to ChatGPT and Perplexity, you\'ll have a clear dashboard showing exactly where you stand and what to do about it.',
    features: [
      'Real-time monitoring across ChatGPT, Perplexity, Gemini, Claude, and Copilot',
      'AI Visibility Score from 0-100 with weekly tracking',
      'Competitor comparison — see how you stack up',
      'Actionable recommendations with estimated impact',
      'AI response simulator — test questions before your customers ask',
      'Weekly email reports with improvement suggestions'
    ]
  },
  {
    id: 'ai-writer',
    icon: Pen,
    name: 'AI Writer',
    tagline: 'AI Content in Your Voice',
    headline: 'Content that sounds like you, not like everyone else',
    description: 'Most AI content sounds generic because it is. AI Writer learns your unique brand voice and creates content that your audience will never know was AI-assisted.',
    features: [
      'Custom brand voice model trained on your existing content',
      'Blog articles, emails, ad copy, product descriptions',
      'Voice consistency scoring — never go off-brand',
      'Support for 100+ languages with voice preservation',
      'Content brief to finished draft in minutes',
      'Seamless handoff to Auto Publish'
    ]
  },
  {
    id: 'auto-publish',
    icon: Send,
    name: 'Auto Publish',
    tagline: 'Automated Content Publishing',
    headline: 'From keyword idea to published article — on autopilot',
    description: 'Stop switching between keyword tools, writing apps, and your CMS. Auto Publish handles the entire content pipeline so you can focus on running your business.',
    features: [
      'AI-powered keyword research with traffic estimates',
      'Automatic research and outline generation',
      'One-click publishing to WordPress, Shopify, Webflow, and 7 more',
      'Built-in SEO scoring with real-time suggestions',
      'Content calendar with auto-scheduling',
      'ROI tracking — see exactly which content drives revenue'
    ]
  },
  {
    id: 'social-autopilot',
    icon: Share2,
    name: 'Social Autopilot',
    tagline: 'Social Media Automation',
    headline: 'Your brand posts itself. Every single day.',
    description: 'Consistency is the #1 factor in social media success. Social Autopilot ensures your brand shows up every day across every platform — without you lifting a finger.',
    features: [
      'Publish to Instagram, Facebook, LinkedIn, X, Pinterest, YouTube',
      'AI-generated images tailored to each platform',
      'Smart scheduling based on your audience\'s active hours',
      'Automatic article → social post conversion (1 article = 6 posts)',
      'Approval workflow for teams',
      'Analytics dashboard with engagement insights'
    ]
  }
];

export const FeaturesPage = () => {
  return (
    <div className="min-h-screen" data-testid="features-page">
      {/* Hero */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-syne text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A0A0A] mb-6"
          >
            Every tool your brand needs.<br />One platform.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#6B7280] max-w-2xl mx-auto"
          >
            Four intelligent modules that work together so you don't have to.
          </motion.p>
        </div>
      </section>

      {/* Module Sections */}
      {modules.map((module, index) => (
        <section 
          key={module.id}
          className={`py-20 ${index % 2 === 0 ? 'bg-[#F9FAFB]' : 'bg-white'}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className={index % 2 === 1 ? 'lg:order-2' : ''}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1F5EE] text-[#1D9E75] text-sm font-medium mb-4">
                  <module.icon size={16} />
                  {module.tagline}
                </div>
                <h2 className="font-syne text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-4">
                  {module.headline}
                </h2>
                <p className="text-lg text-[#6B7280] mb-6">
                  {module.description}
                </p>
                <ul className="space-y-3 mb-6">
                  {module.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check size={20} className="text-[#1D9E75] flex-shrink-0 mt-0.5" />
                      <span className="text-[#6B7280]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <span className="inline-block px-3 py-1 bg-[#F0F0F0] text-[#6B7280] text-sm rounded-full">
                  Included in Growth & Agency plans
                </span>
              </motion.div>
              
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className={index % 2 === 1 ? 'lg:order-1' : ''}
              >
                <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-[#E1F5EE] to-[#1D9E75]/20 border border-[#1D9E75]/20 flex items-center justify-center">
                  <div className="text-center">
                    <module.icon size={64} className="text-[#1D9E75] mx-auto mb-4" />
                    <p className="font-syne text-2xl font-bold text-[#0A0A0A]">{module.name}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-20 bg-[#0A0A0A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-syne text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to see it in action?
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Start your 14-day free trial. No credit card required.
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
