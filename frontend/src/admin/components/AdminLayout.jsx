import { Outlet, Navigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Toaster } from 'sonner';

export const AdminLayout = () => {
  const { isAuthenticated } = useAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/adminpanel" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 p-6 md:p-8">
          <div className="max-w-[1600px] mx-auto w-full page-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  );
};
