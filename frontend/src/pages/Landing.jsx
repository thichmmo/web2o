import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { publicAPI } from '../services/api';
import { getAssetUrl, usePublicBranding } from '../utils/branding';

const fallbackPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Bắt đầu với Card 2 do admin quản lý.',
    price: 0,
    durationDays: 30,
    maxPosts: 10,
    maxFbAccounts: 1,
    features: { can_edit_card_2: false, scheduled_posts: false },
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Mở khóa Card 2 và quy trình đăng bài đầy đủ.',
    price: 0,
    durationDays: 30,
    maxPosts: 0,
    maxFbAccounts: 3,
    features: { can_edit_card_2: true, scheduled_posts: true },
  },
];

const parseFeatures = (features) => {
  if (!features) return {};
  if (typeof features === 'object') return features;
  try {
    return JSON.parse(features);
  } catch {
    return {};
  }
};

const formatPrice = (price) => {
  const value = Number(price || 0);
  if (value === 0) return 'Miễn phí';
  return `${value.toLocaleString('vi-VN')}đ`;
};

const featureText = (plan) => {
  const features = parseFeatures(plan.features);
  return [
    plan.maxPosts === 0 ? 'Không giới hạn bài đăng' : `${plan.maxPosts} bài đăng/tháng`,
    `${plan.maxFbAccounts || 1} tài khoản Facebook`,
    features.can_edit_card_2 || features.card2_enabled ? 'Tùy chỉnh Card 2' : 'Card 2 mặc định',
    features.scheduled_posts ? 'Lên lịch đăng bài' : 'Đăng thủ công',
  ];
};

const Landing = () => {
  const branding = usePublicBranding();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    publicAPI.getPlans()
      .then((response) => setPlans(response.data?.plans || []))
      .catch(() => setPlans([]));
  }, []);

  const visiblePlans = useMemo(() => (plans.length > 0 ? plans : fallbackPlans), [plans]);
  const siteName = branding.site_name || 'Thich Cuu - Facebook Tool';
  const logoUrl = getAssetUrl(branding.site_logo);
  const primaryColor = branding.primary_color || '#2563eb';
  const secondaryColor = branding.secondary_color || '#1e40af';

  const ctaTarget = isAuthenticated ? '/dashboard' : '/register';
  const ctaLabel = isAuthenticated ? 'Vao dashboard' : 'Dang ky dung thu';

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnpNNiAzNGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTM2IDM0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Navigation */}
          <nav className="flex items-center justify-between py-6">
            <Link to="/" className="flex items-center gap-3 group">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-lg font-bold text-blue-600 shadow-lg">
                    TC
                  </div>
                  <span className="text-xl font-bold text-white">{siteName}</span>
                </div>
              )}
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to={ctaTarget}
                className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-105"
                style={{ color: primaryColor }}
              >
                {ctaLabel}
              </Link>
            </div>
          </nav>

          {/* Hero Content */}
          <div className="py-20 lg:py-28">
            <div className="max-w-4xl">
              <h1 className="text-5xl font-extrabold leading-tight text-white sm:text-6xl lg:text-7xl">
                Đăng bài Facebook
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  2 ô tự động
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-blue-100 sm:text-xl">
                Tạo và đăng bài 2 ô lên Facebook Profile, Page, Group.
                Lên lịch đăng bài, quản lý nhiều tài khoản, theo dõi kết quả chi tiết.
              </p>

              {/* Stats */}
              <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/20 pt-8">
                {[
                  ['2 Ô', '2 cards đầy đủ'],
                  ['3 Targets', 'Profile, Page, Group'],
                  ['Lên lịch', 'Đăng tự động'],
                ].map(([stat, label]) => (
                  <div key={stat}>
                    <div className="text-3xl font-bold text-white">{stat}</div>
                    <div className="mt-1 text-sm text-blue-200">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section className="border-b border-gray-200 bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ['🎨', 'Card 2 linh hoạt', 'Tùy chỉnh theo plan'],
              ['🔒', 'Bảo mật token', 'Không lộ access token'],
              ['📱', 'Đăng Page', 'Tích hợp Ad Account'],
              ['🔗', 'Link bài đăng', 'Nhận link Facebook ngay'],
            ].map(([icon, title, text]) => (
              <div key={title} className="flex items-start gap-3">
                <div className="text-2xl">{icon}</div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{title}</div>
                  <div className="mt-0.5 text-xs text-gray-600">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Tính năng mạnh mẽ</h2>
            <p className="mt-4 text-lg text-gray-600">
              Mọi công cụ bạn cần để quản lý và tối ưu bài đăng Facebook trong một nền tảng
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: '⏰',
                title: 'Tiết kiệm thời gian',
                description: 'Lên lịch đăng tự động, không cần ngồi đăng thủ công',
              },
              {
                icon: '📈',
                title: 'Tăng hiệu quả',
                description: 'Quản lý nhiều tài khoản, đăng nhiều nơi cùng lúc',
              },
              {
                icon: '✨',
                title: 'Chuyên nghiệp',
                description: 'Bài 2 ô đẹp mắt, thu hút hơn bài thường',
              },
              {
                icon: '📊',
                title: 'Dễ quản lý',
                description: 'Dashboard rõ ràng, theo dõi mọi bài đăng',
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="group rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm transition-all hover:shadow-lg hover:border-blue-300"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-4xl transition-all group-hover:bg-blue-100">
                  {benefit.icon}
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Quy trình đăng bài đơn giản
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Chỉ 4 bước để đăng bài carousel lên Facebook
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: '01',
                icon: '🔗',
                title: 'Kết nối Facebook',
                text: 'Đăng nhập bằng OAuth hoặc token. Hệ thống lưu token an toàn, không lộ ra ngoài.',
              },
              {
                step: '02',
                icon: '🎯',
                title: 'Chọn target',
                text: 'Đăng lên Profile, Page hoặc Group. Page yêu cầu Ad Account hợp lệ.',
              },
              {
                step: '03',
                icon: '🎨',
                title: 'Tạo bài 2 ô',
                text: 'Ô 1 bắt buộc, Ô 2 tùy theo plan. Upload ảnh/video, thêm tiêu đề và link.',
              },
              {
                step: '04',
                icon: '🚀',
                title: 'Đăng & theo dõi',
                text: 'Đăng ngay hoặc lên lịch. Nhận link bài đăng và theo dõi trạng thái.',
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-6 shadow-sm transition-all hover:shadow-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-4xl">{item.icon}</span>
                    <span className="text-sm font-bold text-blue-600">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* FAQ Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Câu hỏi thường gặp</h2>
            <p className="mt-4 text-lg text-gray-600">
              Giải đáp những thắc mắc phổ biến
            </p>
          </div>

          <div className="mt-12 space-y-6">
            {[
              {
                question: 'Tôi có thể đăng bài lên đâu?',
                answer: 'Bạn có thể đăng bài 2 ô lên Facebook Profile (trang cá nhân), Page (fanpage) và Group (nhóm). Chỉ cần kết nối tài khoản Facebook và chọn nơi muốn đăng.',
              },
              {
                question: 'Có thể lên lịch đăng bài tự động không?',
                answer: 'Có! Bạn có thể chọn ngày giờ cụ thể để hệ thống tự động đăng bài. Hoặc đăng ngay lập tức nếu muốn.',
              },
              {
                question: 'Tôi có thể quản lý nhiều tài khoản Facebook không?',
                answer: 'Có! Bạn có thể kết nối và quản lý nhiều tài khoản Facebook cùng lúc, dễ dàng chuyển đổi giữa các tài khoản khi đăng bài.',
              },
              {
                question: 'Sau khi đăng bài, tôi có nhận được link bài đăng không?',
                answer: 'Có! Sau khi đăng bài thành công, hệ thống sẽ trả về link bài đăng trên Facebook để bạn dễ dàng theo dõi và chia sẻ.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <h3 className="text-lg font-bold text-gray-900">{faq.question}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3">
                {logoUrl ? (
                  <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain" />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-lg font-bold text-blue-600">
                    TC
                  </div>
                )}
                <span className="text-xl font-bold">{siteName}</span>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                {branding.site_description || 'Công cụ đăng bài Facebook 2 ô chuyên nghiệp'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Liên kết</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Đăng nhập
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm text-gray-400 hover:text-white transition-colors">
                    Đăng ký
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider">Liên hệ</h3>
              <p className="mt-4 text-sm text-gray-400">
                Email: support@thichcuu.com
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
