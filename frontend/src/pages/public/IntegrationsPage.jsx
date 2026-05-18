import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { INTEGRATIONS } from '../../data/publicData';
import { ArrowRight, Globe } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const categories = ['All', 'CMS & Website', 'Social Media', 'CRM & Sales', 'E-commerce', 'Other'];

export const IntegrationsPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredIntegrations = activeCategory === 'All' 
    ? INTEGRATIONS 
    : INTEGRATIONS.filter(i => i.category === activeCategory);

  return (
    <div className="min-h-screen" data-testid="integrations-page">
      {/* Hero */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-syne text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A0A0A] mb-6"
          >
            Connects to everything you already use
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#6B7280] max-w-2xl mx-auto"
          >
            No migration needed. Plug in your existing tools and start automating.
          </motion.p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat 
                    ? 'bg-[#1D9E75] text-white' 
                    : 'bg-[#F0F0F0] text-[#6B7280] hover:bg-[#E0E0E0]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration, i) => (
              <motion.div
                key={integration.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl border border-[#F0F0F0] p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F0F0F0] flex items-center justify-center flex-shrink-0">
                    <Globe size={24} className="text-[#6B7280]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#0A0A0A]">{integration.name}</h3>
                      <span className="px-2 py-0.5 bg-[#E1F5EE] text-[#1D9E75] text-xs font-medium rounded-full">
                        {integration.method}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7280]">{integration.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-[#6B7280] mb-4">Don't see yours? We have an open API.</p>
            <Link to="/contact">
              <Button variant="outline" className="border-[#1D9E75] text-[#1D9E75] hover:bg-[#E1F5EE]">
                Request an integration
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#E1F5EE]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-syne text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-6">
            Ready to connect your stack?
          </h2>
          <p className="text-lg text-[#6B7280] mb-8">
            Start your free trial and connect your first integration in minutes.
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
