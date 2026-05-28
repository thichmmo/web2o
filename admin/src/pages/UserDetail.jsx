import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [featureOverrides, setFeatureOverrides] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [durationDays, setDurationDays] = useState('');
  const [resetPasswordForm, setResetPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [overrideForm, setOverrideForm] = useState({
    featureKey: '',
    featureValue: '',
    expiresAt: '',
  });

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, subsRes, plansRes, overridesRes, statsRes] = await Promise.all([
        adminAPI.getUser(userId),
        adminAPI.getUserSubscriptions(userId),
        adminAPI.getPlans(),
        adminAPI.getUserFeatureOverrides(userId),
        adminAPI.getUserStats(userId),
      ]);

      setUser(userRes.data.user);
      setSubscriptions(subsRes.data || []);
      setPlans(plansRes.data || []);
      setFeatureOverrides(overridesRes.data || []);
      setUserStats(statsRes.data);
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPlan = async (e) => {
    e.preventDefault();

    if (!selectedPlanId) {
      alert('Vui lòng chọn plan');
      return;
    }

    try {
      await adminAPI.assignPlanToUser(userId, {
        planId: selectedPlanId,
        durationDays: durationDays ? parseInt(durationDays) : undefined,
      });

      await fetchData();
      setShowAssignModal(false);
      setSelectedPlanId('');
      setDurationDays('');
    } catch (error) {
      console.error('Assign plan error:', error);
      alert(error.response?.data?.message || 'Không thể gán plan');
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    if (!confirm('Bạn có chắc muốn hủy subscription này?')) return;

    try {
      await adminAPI.cancelSubscription(subscriptionId);
      await fetchData();
    } catch (error) {
      console.error('Cancel subscription error:', error);
      alert('Không thể hủy subscription');
    }
  };

  const handleAddOverride = async (e) => {
    e.preventDefault();

    if (!overrideForm.featureKey) {
      alert('Vui lòng nhập feature key');
      return;
    }

    try {
      await adminAPI.addFeatureOverride(userId, {
        featureKey: overrideForm.featureKey,
        featureValue: overrideForm.featureValue ? JSON.parse(overrideForm.featureValue) : null,
        expiresAt: overrideForm.expiresAt || null,
      });

      await fetchData();
      setShowOverrideModal(false);
      setOverrideForm({ featureKey: '', featureValue: '', expiresAt: '' });
    } catch (error) {
      console.error('Add override error:', error);
      alert(error.response?.data?.message || 'Không thể thêm override');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (resetPasswordForm.newPassword.length < 8) {
      alert('Mat khau moi phai co it nhat 8 ky tu');
      return;
    }

    if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
      alert('Xac nhan mat khau khong khop');
      return;
    }

    try {
      await adminAPI.resetUserPassword(userId, {
        newPassword: resetPasswordForm.newPassword,
      });
      setShowResetPasswordModal(false);
      setResetPasswordForm({ newPassword: '', confirmPassword: '' });
      alert('Da reset mat khau user');
    } catch (error) {
      console.error('Reset password error:', error);
      alert(error.response?.data?.message || error.message || 'Khong the reset mat khau');
    }
  };

  const handleDeleteOverride = async (overrideId) => {
    if (!confirm('Bạn có chắc muốn xóa override này?')) return;

    try {
      await adminAPI.deleteFeatureOverride(overrideId);
      await fetchData();
    } catch (error) {
      console.error('Delete override error:', error);
      alert('Không thể xóa override');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-red-600">Không tìm thấy user</div>
      </div>
    );
  }

  const activeSub = subscriptions.find(s => s.isActive);

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/dashboard/users')}
          className="text-blue-600 hover:text-blue-700 flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Thông tin User</h2>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Tên:</span>
                <p className="font-semibold">{user.fullName}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Email:</span>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <span className="text-sm text-gray-600">Vai trò:</span>
                <span className={`inline-block px-2 py-1 text-xs rounded ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Trạng thái:</span>
                <span className={`inline-block px-2 py-1 text-xs rounded ${
                  user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Ngày tạo:</span>
                <p className="text-sm">{new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            {/* Current Plan */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-2">Plan hiện tại</h3>
              {activeSub ? (
                <div className="bg-blue-50 rounded p-3">
                  <p className="font-bold text-blue-900">{activeSub.plan.name}</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Hết hạn: {new Date(activeSub.endDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">Chưa có plan</p>
              )}
            </div>

            <button
              onClick={() => setShowAssignModal(true)}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Gán Plan Mới
            </button>

            <button
              onClick={() => setShowResetPasswordModal(true)}
              className="w-full mt-3 px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            >
              Reset mat khau
            </button>

            {/* User Stats */}
            {userStats && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-semibold mb-3">Thống kê</h3>

                <div className="space-y-3">
                  {/* Posts Stats */}
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-600 mb-1">Posts</p>
                    <p className="text-2xl font-bold text-gray-900">{userStats.posts.total}</p>
                    <div className="mt-2 text-xs space-y-1">
                      {userStats.posts.byStatus.draft && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Nháp:</span>
                          <span className="font-semibold">{userStats.posts.byStatus.draft}</span>
                        </div>
                      )}
                      {userStats.posts.byStatus.published && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Đã đăng:</span>
                          <span className="font-semibold">{userStats.posts.byStatus.published}</span>
                        </div>
                      )}
                      {userStats.posts.byStatus.scheduled && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Đã lên lịch:</span>
                          <span className="font-semibold">{userStats.posts.byStatus.scheduled}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subscriptions Stats */}
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-600 mb-1">Subscriptions</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Tổng:</span>
                      <span className="text-lg font-bold">{userStats.subscriptions.total}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-gray-700">Active:</span>
                      <span className="text-lg font-bold text-green-600">{userStats.subscriptions.active}</span>
                    </div>
                  </div>

                  {/* Feature Overrides Stats */}
                  {userStats.featureOverrides.total > 0 && (
                    <div className="bg-purple-50 rounded p-3">
                      <p className="text-xs text-purple-600 mb-1">Feature Overrides</p>
                      <p className="text-2xl font-bold text-purple-900">{userStats.featureOverrides.total}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subscriptions History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Lịch sử Subscriptions</h2>

            {subscriptions.length === 0 ? (
              <p className="text-gray-500">Chưa có subscription nào</p>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className={`border rounded-lg p-4 ${
                      sub.isActive ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{sub.plan.name}</h3>
                          {sub.isActive && (
                            <span className="px-2 py-1 text-xs bg-green-600 text-white rounded">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {sub.plan.description}
                        </p>
                        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-gray-600">Bắt đầu:</span>
                            <p className="font-semibold">
                              {new Date(sub.startDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Kết thúc:</span>
                            <p className="font-semibold">
                              {new Date(sub.endDate).toLocaleDateString('vi-VN')}
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Giá:</span>
                            <p className="font-semibold">
                              {Number(sub.plan.price).toLocaleString('vi-VN')} VNĐ
                            </p>
                          </div>
                          <div>
                            <span className="text-gray-600">Thời hạn:</span>
                            <p className="font-semibold">{sub.plan.durationDays} ngày</p>
                          </div>
                        </div>
                      </div>
                      {sub.isActive && (
                        <button
                          onClick={() => handleCancelSubscription(sub.id)}
                          className="ml-4 px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feature Overrides */}
          <div className="bg-white rounded-lg shadow p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Feature Overrides</h2>
              <button
                onClick={() => setShowOverrideModal(true)}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                + Thêm Override
              </button>
            </div>

            {featureOverrides.length === 0 ? (
              <p className="text-gray-500">Chưa có override nào</p>
            ) : (
              <div className="space-y-3">
                {featureOverrides.map((override) => (
                  <div
                    key={override.id}
                    className="border rounded-lg p-3 flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-purple-900">{override.featureKey}</span>
                        {override.expiresAt && new Date(override.expiresAt) > new Date() && (
                          <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                            Expires: {new Date(override.expiresAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                        {override.expiresAt && new Date(override.expiresAt) <= new Date() && (
                          <span className="px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded">
                            Expired
                          </span>
                        )}
                      </div>
                      {override.featureValue && (
                        <pre className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(override.featureValue, null, 2)}
                        </pre>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteOverride(override.id)}
                      className="ml-3 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assign Plan Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Gán Plan cho User</h2>

            <form onSubmit={handleAssignPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chọn Plan *
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => {
                    setSelectedPlanId(e.target.value);
                    const plan = plans.find(p => p.id === e.target.value);
                    if (plan) setDurationDays(plan.durationDays.toString());
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Chọn plan --</option>
                  {plans.filter(p => p.isActive).map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {Number(plan.price).toLocaleString('vi-VN')} VNĐ
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thời hạn (ngày)
                </label>
                <input
                  type="number"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Để trống = dùng mặc định của plan"
                  min="1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Gán Plan
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedPlanId('');
                    setDurationDays('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-2">Reset mat khau user</h2>
            <p className="text-sm text-gray-600 mb-4">
              Email: <span className="font-semibold">{user.email}</span>
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mat khau moi *
                </label>
                <input
                  type="password"
                  value={resetPasswordForm.newPassword}
                  onChange={(e) => setResetPasswordForm({
                    ...resetPasswordForm,
                    newPassword: e.target.value,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  minLength="8"
                  autoComplete="new-password"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Toi thieu 8 ky tu.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhap lai mat khau *
                </label>
                <input
                  type="password"
                  value={resetPasswordForm.confirmPassword}
                  onChange={(e) => setResetPasswordForm({
                    ...resetPasswordForm,
                    confirmPassword: e.target.value,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  minLength="8"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="rounded bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                Mat khau se duoc hash o backend. Response khong tra ve mat khau hoac hash.
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                >
                  Reset mat khau
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setResetPasswordForm({ newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Huy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Thêm Feature Override</h2>

            <form onSubmit={handleAddOverride} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feature Key *
                </label>
                <input
                  type="text"
                  value={overrideForm.featureKey}
                  onChange={(e) => setOverrideForm({ ...overrideForm, featureKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., card2_enabled, max_posts"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ví dụ: card2_enabled, max_posts, priority_support
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feature Value (JSON)
                </label>
                <textarea
                  value={overrideForm.featureValue}
                  onChange={(e) => setOverrideForm({ ...overrideForm, featureValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                  rows="4"
                  placeholder='true hoặc {"enabled": true, "limit": 100}'
                />
                <p className="text-xs text-gray-500 mt-1">
                  Để trống hoặc nhập JSON. Ví dụ: true, 100, {"{"}...{"}"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày hết hạn (tùy chọn)
                </label>
                <input
                  type="datetime-local"
                  value={overrideForm.expiresAt}
                  onChange={(e) => setOverrideForm({ ...overrideForm, expiresAt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Để trống = không hết hạn
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Thêm Override
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowOverrideModal(false);
                    setOverrideForm({ featureKey: '', featureValue: '', expiresAt: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetail;
