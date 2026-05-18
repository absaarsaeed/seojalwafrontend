import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';
import { Mail, Clock, Twitter, Linkedin, Instagram, CheckCircle } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitted(true);
    toast.success('Message sent successfully!');
  };

  return (
    <div className="min-h-screen" data-testid="contact-page">
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left - Info */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <h1 className="font-syne text-4xl sm:text-5xl font-extrabold text-[#0A0A0A] mb-6">
                We'd love to hear from you
              </h1>
              <p className="text-lg text-[#6B7280] mb-8">
                Have a question, feedback, or just want to say hi? We're here to help.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-[#1D9E75]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0A0A0A]">Email us</h3>
                    <p className="text-[#6B7280]">hello@seojalwa.com</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#E1F5EE] flex items-center justify-center flex-shrink-0">
                    <Clock size={20} className="text-[#1D9E75]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#0A0A0A]">Response time</h3>
                    <p className="text-[#6B7280]">We typically respond within 24 hours</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12">
                <h3 className="font-semibold text-[#0A0A0A] mb-4">Follow us</h3>
                <div className="flex gap-4">
                  <a href="https://twitter.com/seojalwa" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#F0F0F0] flex items-center justify-center text-[#6B7280] hover:bg-[#1DA1F2] hover:text-white transition-colors">
                    <Twitter size={20} />
                  </a>
                  <a href="https://linkedin.com/company/seojalwa" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#F0F0F0] flex items-center justify-center text-[#6B7280] hover:bg-[#0A66C2] hover:text-white transition-colors">
                    <Linkedin size={20} />
                  </a>
                  <a href="https://instagram.com/seojalwa" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-[#F0F0F0] flex items-center justify-center text-[#6B7280] hover:bg-[#E4405F] hover:text-white transition-colors">
                    <Instagram size={20} />
                  </a>
                </div>
              </div>
            </motion.div>
            
            {/* Right - Form */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="bg-[#F9FAFB] rounded-2xl p-8"
            >
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-[#1D9E75]" />
                  </div>
                  <h3 className="font-syne text-2xl font-bold text-[#0A0A0A] mb-2">Message sent!</h3>
                  <p className="text-[#6B7280]">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-[#0A0A0A]">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                      className="border-[#F0F0F0] bg-white"
                      data-testid="contact-name-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-[#0A0A0A]">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="border-[#F0F0F0] bg-white"
                      data-testid="contact-email-input"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium text-[#0A0A0A]">Subject</Label>
                    <Select onValueChange={(v) => setFormData(prev => ({ ...prev, subject: v }))}>
                      <SelectTrigger className="border-[#F0F0F0] bg-white">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-medium text-[#0A0A0A]">Message *</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="How can we help?"
                      rows={5}
                      className="border-[#F0F0F0] bg-white"
                      data-testid="contact-message-input"
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-[#1D9E75] hover:bg-[#0F6E56] text-white" data-testid="contact-submit-btn">
                    Send message
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};
