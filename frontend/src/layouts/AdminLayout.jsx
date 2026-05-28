import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAssetUrl, usePublicBranding } from '../utils/branding';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const branding = usePublicBranding('Admin');
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load admin user from localStorage
    const adminUser = localStorage.getItem('admin_user');
    if (adminUser) {
      setUser(JSON.parse(adminUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-800' : '';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {branding.site_logo ? (
                  <img
                    src={getAssetUrl(branding.site_logo)}
                    alt=""
                    className="h-9 w-auto max-w-[120px] object-contain mr-3 rounded-sm bg-white/10"
                  />
                ) : (
                  <svg className="h-8 w-8 text-blue-300 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                )}
                <h1 className="text-xl font-bold truncate max-w-[220px]">{branding.site_name || 'Admin Panel'}</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <Link
                  to="/admin"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 ${isActive('/admin')}`}
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Thống kê
                </Link>
                <Link
                  to="/admin/users"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 ${isActive('/admin/users')}`}
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Người dùng
                </Link>
                <Link
                  to="/admin/activity-logs"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 ${isActive('/admin/activity-logs')}`}
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Nhật ký
                </Link>
                <Link
                  to="/admin/card-settings"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 ${isActive('/admin/card-settings')}`}
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Card
                </Link>
                <Link
                  to="/admin/plans"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 ${isActive('/admin/plans')}`}
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Plans
                </Link>
                <Link
                  to="/admin/posts"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 ${isActive('/admin/posts')}`}
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Posts
                </Link>
                <Link
                  to="/admin/settings"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-800 ${isActive('/admin/settings')}`}
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Cài đặt
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-sm mr-4">
                  <span className="text-blue-300">Admin:</span> {user?.fullName}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-blue-800 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
