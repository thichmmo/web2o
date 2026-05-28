import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { getAssetUrl, usePublicBranding } from '../utils/branding';

const DashboardLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const branding = usePublicBranding();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const isActive = (path) => (
    location.pathname === path || location.pathname.startsWith(`${path}/`) ? 'bg-blue-700' : ''
  );

  const navItems = [
    ['/dashboard', 'Dashboard'],
    ['/dashboard/facebook', 'Facebook'],
    ['/dashboard/posts/create', 'Tạo bài viết'],
    ['/dashboard/posts', 'Bài viết'],
    ['/dashboard/subscription', 'Bảng giá'],
    ['/dashboard/profile', 'Hồ sơ'],
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between min-h-16 gap-4">
            <div className="flex flex-wrap items-center gap-x-4 py-2">
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-xl font-bold whitespace-nowrap">
                {branding.site_logo && (
                  <img
                    src={getAssetUrl(branding.site_logo)}
                    alt=""
                    className="h-8 w-auto max-w-[120px] object-contain rounded-sm bg-white/10"
                  />
                )}
                <span className="truncate max-w-[220px]">{branding.site_name || 'Thich Cuu'}</span>
              </Link>
              <div className="hidden sm:flex sm:flex-wrap sm:gap-2">
                {navItems.map(([path, label]) => (
                  <Link
                    key={path}
                    to={path}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive(path)}`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center shrink-0 gap-3">
              <span className="hidden md:inline text-sm mr-1">Hi, {user?.fullName}</span>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-md text-sm font-medium text-white transition-all flex items-center gap-2"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <span>Admin</span>
                </Link>
              )}
              <button onClick={handleLogout} className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
