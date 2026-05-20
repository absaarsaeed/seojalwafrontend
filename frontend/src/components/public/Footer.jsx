import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Instagram } from 'lucide-react';
import { Logo } from './Logo';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-[#F0F0F0]" data-testid="public-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Product */}
          <div>
            <h4 className="font-semibold text-[#0A0A0A] mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-sm text-[#6B7280] hover:text-[#1D9E75]">AI Visibility</Link></li>
              <li><Link to="/features" className="text-sm text-[#6B7280] hover:text-[#1D9E75]">AI Writer</Link></li>
              <li><Link to="/features" className="text-sm text-[#6B7280] hover:text-[#1D9E75]">Auto Publish</Link></li>
              <li><Link to="/features" className="text-sm text-[#6B7280] hover:text-[#1D9E75]">Social Autopilot</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-[#0A0A0A] mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-[#6B7280] hover:text-[#1D9E75]">About</Link></li>
              <li><Link to="/blog" className="text-sm text-[#6B7280] hover:text-[#1D9E75]">Blog</Link></li>
              <li><Link to="/contact" className="text-sm text-[#6B7280] hover:text-[#1D9E75]">Contact</Link></li>
              <li><Link to="/feedback" className="text-sm text-[#6B7280] hover:text-[#1D9E75]" data-testid="footer-feedback-link">Send feedback</Link></li>
              <li><a href="#" className="text-sm text-[#6B7280] hover:text-[#1D9E75]">Careers</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-[#0A0A0A] mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm text-[#6B7280] hover:text-[#1D9E75]">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-[#6B7280] hover:text-[#1D9E75]">Terms of Service</Link></li>
              <li><Link to="/cookies" className="text-sm text-[#6B7280] hover:text-[#1D9E75]">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-[#0A0A0A] mb-4">Connect</h4>
            <div className="flex gap-4">
              <a href="https://twitter.com/seojalwa" target="_blank" rel="noopener noreferrer" className="text-[#6B7280] hover:text-[#1D9E75]">
                <Twitter size={20} />
              </a>
              <a href="https://linkedin.com/company/seojalwa" target="_blank" rel="noopener noreferrer" className="text-[#6B7280] hover:text-[#1D9E75]">
                <Linkedin size={20} />
              </a>
              <a href="https://instagram.com/seojalwa" target="_blank" rel="noopener noreferrer" className="text-[#6B7280] hover:text-[#1D9E75]">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[#F0F0F0] flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <Logo height={28} />
            <p className="text-sm text-[#6B7280]">
              © 2026 SEO Jalwa. Built for businesses that refuse to stay small.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-[#6B7280] hover:text-[#1D9E75]">Status</a>
            <Link to="/privacy" className="text-sm text-[#6B7280] hover:text-[#1D9E75]">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
