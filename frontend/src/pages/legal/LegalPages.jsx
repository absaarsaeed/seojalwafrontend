import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { legalApi } from '../../lib/api';

const fallbacks = {
  'privacy-policy': {
    title: 'Privacy Policy',
    content: '<p>Loading the latest privacy policy from our records...</p>',
  },
  'terms-of-service': {
    title: 'Terms of Service',
    content: '<p>Loading the latest terms of service from our records...</p>',
  },
  'cookie-policy': {
    title: 'Cookie Policy',
    content: '<p>Loading the latest cookie policy from our records...</p>',
  },
};

const otherLinks = [
  { key: 'privacy-policy', label: 'Privacy Policy', to: '/privacy-policy' },
  { key: 'terms-of-service', label: 'Terms of Service', to: '/terms-of-service' },
  { key: 'cookie-policy', label: 'Cookie Policy', to: '/cookie-policy' },
];

const LegalPage = ({ slug }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await legalApi.get(slug);
        const page = res?.page || res;
        if (!cancelled && page && (page.content || page.body)) {
          setData({
            title: page.title || fallbacks[slug].title,
            content: page.content || page.body,
            updatedAt: page.updatedAt || page.lastUpdated,
          });
        } else if (!cancelled) {
          setData(fallbacks[slug]);
        }
      } catch {
        if (!cancelled) setData(fallbacks[slug]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <div className="min-h-screen py-12 px-4" data-testid={`${slug}-page`}>
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1D9E75] mb-6">
          <ArrowLeft size={14} /> Back to home
        </Link>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-syne text-4xl font-bold text-[#0A0A0A] mb-2">
            {data?.title || fallbacks[slug].title}
          </h1>
          <p className="text-sm text-[#6B7280] mb-8" data-testid="legal-last-updated">
            Last updated:{' '}
            {data?.updatedAt
              ? new Date(data.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
              : 'January 1, 2026'}
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-16" data-testid="legal-loading">
              <Loader2 className="animate-spin text-[#1D9E75]" size={28} />
            </div>
          ) : (
            <article
              className="prose prose-lg max-w-none text-[#27272A]"
              data-testid="legal-content"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: data?.content || fallbacks[slug].content }}
            />
          )}

          <div className="mt-12 pt-6 border-t border-[#F0F0F0]">
            <p className="text-xs text-[#6B7280] mb-3 uppercase tracking-wide">More legal</p>
            <div className="flex flex-wrap gap-4">
              {otherLinks.filter((l) => l.key !== slug).map((l) => (
                <Link key={l.key} to={l.to} className="text-sm text-[#1D9E75] hover:underline">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const PrivacyPage = () => <LegalPage slug="privacy-policy" />;
export const TermsPage = () => <LegalPage slug="terms-of-service" />;
export const CookiesPage = () => <LegalPage slug="cookie-policy" />;
