/**
 * RequireAdmin — Route guard for /adminpanel/* routes.
 * Redirects to /adminpanel (admin login) when no admin session exists.
 */
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export const RequireAdmin = ({ children }) => {
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) {
    return <Navigate to="/adminpanel" replace />;
  }
  return children;
};

export default RequireAdmin;
