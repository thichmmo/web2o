import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { userAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getDashboard()
      .then((response) => setDashboard(response.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !dashboard) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const stats = dashboard.posts || {};
  const plan = dashboard.plan;
  const subscription = dashboard.subscription;

  const statCards = [
    {
      label: 'Tổng bài viết',
      value: stats.total || 0,
      icon: '📝',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Đã đăng',
      value: stats.published || 0,
      icon: '✅',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Đã lên lịch',
      value: stats.scheduled || 0,
      icon: '⏰',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Thất bại',
      value: stats.failed || 0,
      icon: '❌',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ];

  const quickActions = [
    {
      title: 'Tạo bài viết',
      description: 'Tạo bài đăng 2 ô mới',
      icon: '✍️',
      link: '/dashboard/posts/create',
      color: 'from-blue-600 to-indigo-600',
      primary: true,
    },
    {
      title: 'Tài khoản Facebook',
      description: 'Quản lý tài khoản FB',
      icon: '👥',
      link: '/dashboard/facebook',
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Lịch sử bài viết',
      description: 'Xem tất cả bài đăng',
      icon: '📋',
      link: '/dashboard/posts',
      color: 'from-green-600 to-teal-600',
    },
    {
      title: 'Bảng giá',
      description: 'Nâng cấp tài khoản',
      icon: '💎',
      link: '/dashboard/subscription',
      color: 'from-yellow-600 to-orange-600',
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Xin chào, {user?.fullName}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          Chào mừng bạn quay trở lại. Đây là tổng quan về hoạt động của bạn.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="mt-2 text-4xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${stat.bgColor} text-3xl`}>
                {stat.icon}
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${stat.color}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Current Plan Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur-sm">
                💎
              </div>
              <div>
                <h2 className="text-sm font-medium text-blue-100">Bảng giá hiện tại</h2>
                <p className="text-2xl font-bold">{plan?.name || 'Miễn phí'}</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-white/20 pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-100">Hạn sử dụng:</span>
                <span className="font-semibold">
                  {subscription?.endDate
                    ? new Date(subscription.endDate).toLocaleDateString('vi-VN')
                    : 'Không giới hạn'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-100">Số bài đăng:</span>
                <span className="font-semibold">
                  {plan?.maxPosts === 0 ? 'Không giới hạn' : plan?.maxPosts || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-100">Tài khoản FB:</span>
                <span className="font-semibold">
                  {dashboard.facebookAccounts?.active || 0}/{plan?.maxFbAccounts ?? 1}
                </span>
              </div>
            </div>

            <Link
              to="/dashboard/subscription"
              className="mt-4 block w-full rounded-lg bg-white py-2.5 text-center text-sm font-semibold text-blue-600 transition-all hover:bg-blue-50"
            >
              Nâng cấp bảng giá
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className={`group relative overflow-hidden rounded-2xl p-6 shadow-sm transition-all hover:shadow-lg ${
                  action.primary
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                    : 'bg-white border border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-2xl ${
                      action.primary ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-50'
                    }`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-base font-semibold ${
                        action.primary ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      {action.title}
                    </h3>
                    <p
                      className={`mt-1 text-sm ${
                        action.primary ? 'text-blue-100' : 'text-gray-600'
                      }`}
                    >
                      {action.description}
                    </p>
                  </div>
                  <svg
                    className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${
                      action.primary ? 'text-white' : 'text-gray-400'
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {(stats.total || 0) === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-4xl">
            📝
          </div>
          <h2 className="mt-6 text-xl font-bold text-gray-900">Chưa có bài viết nào</h2>
          <p className="mt-2 text-gray-600">
            Bắt đầu tạo bài đăng 2 ô đầu tiên của bạn sau khi kết nối tài khoản Facebook.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/dashboard/facebook"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
            >
              <span>Kết nối Facebook</span>
            </Link>
            <Link
              to="/dashboard/posts/create"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Tạo bài viết</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
