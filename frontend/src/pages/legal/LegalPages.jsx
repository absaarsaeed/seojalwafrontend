import { motion } from 'framer-motion';

export const PrivacyPage = () => (
  <div className="min-h-screen py-20" data-testid="privacy-page">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-syne text-4xl font-bold text-[#0A0A0A] mb-4">Privacy Policy</h1>
        <p className="text-[#6B7280] mb-8">Last updated: January 1, 2026</p>
        <div className="prose prose-lg text-[#6B7280]">
          <p>At SEO Jalwa, we take your privacy seriously. This policy describes how we collect, use, and protect your personal information.</p>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mt-8 mb-4">Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.</p>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mt-8 mb-4">How We Use Your Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, and to communicate with you.</p>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mt-8 mb-4">Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access or disclosure.</p>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mt-8 mb-4">Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@seojalwa.com.</p>
        </div>
      </motion.div>
    </div>
  </div>
);

export const TermsPage = () => (
  <div className="min-h-screen py-20" data-testid="terms-page">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-syne text-4xl font-bold text-[#0A0A0A] mb-4">Terms of Service</h1>
        <p className="text-[#6B7280] mb-8">Last updated: January 1, 2026</p>
        <div className="prose prose-lg text-[#6B7280]">
          <p>Welcome to SEO Jalwa. By using our services, you agree to these terms. Please read them carefully.</p>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mt-8 mb-4">Use of Services</h2>
          <p>You must follow any policies made available to you within the Services. You may use our Services only as permitted by law.</p>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mt-8 mb-4">Your Account</h2>
          <p>You are responsible for maintaining the security of your account and password. SEO Jalwa cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.</p>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mt-8 mb-4">Termination</h2>
          <p>We may terminate or suspend your account at any time for conduct that we believe violates these Terms or is harmful to other users of the Services.</p>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mt-8 mb-4">Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at legal@seojalwa.com.</p>
        </div>
      </motion.div>
    </div>
  </div>
);

export const CookiesPage = () => (
  <div className="min-h-screen py-20" data-testid="cookies-page">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-syne text-4xl font-bold text-[#0A0A0A] mb-4">Cookie Policy</h1>
        <p className="text-[#6B7280] mb-8">Last updated: January 1, 2026</p>
        <div className="prose prose-lg text-[#6B7280]">
          <p>This Cookie Policy explains how SEO Jalwa uses cookies and similar technologies to recognize you when you visit our website.</p>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mt-8 mb-4">What Are Cookies</h2>
          <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently.</p>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mt-8 mb-4">How We Use Cookies</h2>
          <p>We use cookies to understand how you use our website, remember your preferences, and improve your experience.</p>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mt-8 mb-4">Managing Cookies</h2>
          <p>Most web browsers allow you to control cookies through their settings. However, if you limit the ability of websites to set cookies, you may affect your overall experience.</p>
          <h2 className="font-syne text-xl font-bold text-[#0A0A0A] mt-8 mb-4">Contact Us</h2>
          <p>If you have any questions about our use of cookies, please contact us at privacy@seojalwa.com.</p>
        </div>
      </motion.div>
    </div>
  </div>
);
