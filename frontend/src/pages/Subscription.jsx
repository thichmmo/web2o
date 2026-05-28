import { useEffect, useState } from 'react';
import { userAPI } from '../services/api';

const Subscription = () => {
  const [data, setData] = useState(null);
  const [plans, setPlans] = useState([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const [subscriptionRes, plansRes] = await Promise.all([
      userAPI.getSubscription(),
      userAPI.getPlans(),
    ]);
    setData(subscriptionRes.data);
    setPlans(plansRes.data.plans);
  };

  useEffect(() => {
    load();
  }, []);

  const upgrade = async (planId) => {
    await userAPI.upgradePlan(planId);
    setMessage('Nâng cấp gói thành công! (Chế độ thanh toán demo)');
    await load();
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const planColors = {
    Free: { gradient: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', icon: '🆓' },
    Basic: { gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', icon: '⭐' },
    Pro: { gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', icon: '💎' },
    Enterprise: { gradient: 'from-yellow-500 to-orange-600', bg: 'bg-yellow-50', icon: '👑' },
  };

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bảng giá</h1>
        <p className="mt-2 text-gray-600">Chọn gói phù hợp với nhu cầu của bạn</p>
      </div>

      {/* Success Message */}
      {message && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium text-green-800">{message}</span>
          </div>
        </div>
      )}

      {/* Current Plan Card */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl backdrop-blur-sm">
            {planColors[data.plan?.name]?.icon || '💎'}
          </div>
          <div>
            <h2 className="text-sm font-medium text-blue-100">Gói hiện tại</h2>
            <p className="text-2xl font-bold">{data.plan?.name || 'Miễn phí'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-white/20 pt-4">
          <div>
            <p className="text-xs text-blue-100">Giá</p>
            <p className="text-lg font-semibold">{Number(data.plan?.price || 0).toLocaleString('vi-VN')} đ</p>
          </div>
          <div>
            <p className="text-xs text-blue-100">Hạn sử dụng</p>
            <p className="text-lg font-semibold">
              {data.current?.endDate ? new Date(data.current.endDate).toLocaleDateString('vi-VN') : 'Không giới hạn'}
            </p>
          </div>
          <div>
            <p className="text-xs text-blue-100">Số bài đăng</p>
            <p className="text-lg font-semibold">{data.plan?.maxPosts === 0 ? 'Không giới hạn' : data.plan?.maxPosts || 0}</p>
          </div>
          <div>
            <p className="text-xs text-blue-100">Tài khoản FB</p>
            <p className="text-lg font-semibold">{data.plan?.maxFbAccounts || 1}</p>
          </div>
          <div>
            <p className="text-xs text-blue-100">Chỉnh sửa Ô 2</p>
            <p className="text-lg font-semibold">{data.permissions?.can_edit_card_2 ? 'Có' : 'Không'}</p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Các gói dịch vụ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const color = planColors[plan.name] || planColors.Free;
            const isCurrentPlan = data.plan?.id === plan.id;
            const features = plan.features || {};

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 bg-white p-6 shadow-sm transition-all hover:shadow-lg ${
                  isCurrentPlan ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Đang dùng
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="text-center">
                  <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl ${color.bg} text-3xl`}>
                    {color.icon}
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-600 min-h-[40px]">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="mt-6 text-center">
                  <div className="text-4xl font-bold text-gray-900">
                    {Number(plan.price || 0).toLocaleString('vi-VN')}
                    <span className="text-lg font-normal text-gray-600"> đ</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">/ tháng</p>
                </div>

                {/* Features */}
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">
                      <strong>{plan.maxPosts === 0 ? 'Không giới hạn' : plan.maxPosts}</strong> bài đăng
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">
                      <strong>{plan.maxFbAccounts}</strong> tài khoản FB
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {features.can_edit_card_2 ? (
                      <>
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Chỉnh sửa Ô 2</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-500">Không chỉnh sửa Ô 2</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    {features.can_schedule ? (
                      <>
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">Lên lịch đăng bài</span>
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-500">Không lên lịch</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={() => upgrade(plan.id)}
                  disabled={isCurrentPlan}
                  className={`mt-6 w-full rounded-lg py-3 text-sm font-semibold transition-all ${
                    isCurrentPlan
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${color.gradient} text-white shadow-lg hover:shadow-xl hover:scale-[1.02]`
                  }`}
                >
                  {isCurrentPlan ? 'Gói hiện tại' : 'Chọn gói này'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription History */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Lịch sử đăng ký</h2>
        {data.history?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Gói</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Ngày bắt đầu</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Ngày kết thúc</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.plan?.name || 'Gói'}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(item.startDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(item.endDate).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3">
                      {item.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                          Đã hết hạn
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
              📋
            </div>
            <p className="mt-4 text-sm text-gray-600">Chưa có lịch sử đăng ký</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscription;
