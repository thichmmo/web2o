import { Navigate } from 'react-router-dom';

const getAdminUser = () => {
  try {
    return JSON.parse(localStorage.getItem('admin_user'));
  } catch {
    return null;
  }
};

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  const user = getAdminUser();

  if (!token || user?.role !== 'admin') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
