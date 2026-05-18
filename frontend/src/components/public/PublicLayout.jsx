import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CookieBanner } from './CookieBanner';
import { Toaster } from 'sonner';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
      <Toaster position="bottom-right" richColors />
    </div>
  );
};
