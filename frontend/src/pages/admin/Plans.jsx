import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminApi';

const FEATURE_OPTIONS = [
  {
    key: 'can_edit_card_2',
    label: 'Cho sua Card 2',
    description: 'User duoc tu chinh media, title, description va link cua Card 2.',
  },
  {
    key: 'scheduled_posts',
    label: 'Len lich bai viet',
    description: 'Cho phep user dat thoi gian dang bai.',
  },
  {
    key: 'priority_support',
    label: 'Ho tro uu tien',
    description: 'Danh dau plan co kenh ho tro uu tien.',
  },
  {
    key: 'analytics',
    label: 'Thong ke nang cao',
    description: 'Bat cac tinh nang thong ke/bao cao nang cao.',
  },
  {
    key: 'api_access',
    label: 'API access',
    description: 'Cho phep tich hop qua API.',
  },
];

const createFeatureState = () => FEATURE_OPTIONS.reduce((features, option) => {
  features[option.key] = false;
  return features;
}, {});

const parseFeatures = (features) => {
  if (!features) return {};
  if (typeof features === 'object') return features;
  try {
    return JSON.parse(features);
  } catch {
    return {};
  }
};

const normalizeFeatures = (features) => {
  const source = parseFeatures(features);
  const selected = createFeatureState();

  FEATURE_OPTIONS.forEach((option) => {
    const value = option.key === 'can_edit_card_2'
      ? source.can_edit_card_2 ?? source.card2_enabled
      : source[option.key];
    selected[option.key] = Boolean(value);
  });

  const knownKeys = new Set([...FEATURE_OPTIONS.map((option) => option.key), 'card2_enabled']);
  const extra = Object.fromEntries(
    Object.entries(source).filter(([key]) => !knownKeys.has(key))
  );

  return { selected, extra };
};

const enabledFeatureLabels = (features) => {
  const normalized = normalizeFeatures(features).selected;
  return FEATURE_OPTIONS
    .filter((option) => normalized[option.key])
    .map((option) => option.label);
};

const createEmptyForm = () => ({
  name: '',
  description: '',
  price: 0,
  durationDays: 30,
  maxPosts: 0,
  maxFbAccounts: 1,
  features: createFeatureState(),
  extraFeatures: {},
  isActive: true,
});

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState(createEmptyForm);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPlans();
      setPlans(response.data || []);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách plans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (plan = null) => {
    if (plan) {
      const normalizedFeatures = normalizeFeatures(plan.features);
      setEditingPlan(plan);
      setFormData({
        name: plan.name,
        description: plan.description || '',
        price: plan.price,
        durationDays: plan.durationDays,
        maxPosts: plan.maxPosts,
        maxFbAccounts: plan.maxFbAccounts,
        features: normalizedFeatures.selected,
        extraFeatures: normalizedFeatures.extra,
        isActive: plan.isActive,
      });
    } else {
      setEditingPlan(null);
      setFormData(createEmptyForm());
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        features: {
          ...formData.extraFeatures,
          ...formData.features,
        },
      };
      delete data.extraFeatures;

      if (editingPlan) {
        await adminAPI.updatePlan(editingPlan.id, data);
      } else {
        await adminAPI.createPlan(data);
      }

      await fetchPlans();
      handleCloseModal();
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra');
      console.error(err);
    }
  };

  const handleFeatureChange = (featureKey, checked) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [featureKey]: checked,
      },
    });
  };

  const handleDelete = async (planId) => {
    if (!confirm('Bạn có chắc muốn xóa plan này?')) return;

    try {
      await adminAPI.deletePlan(planId);
      await fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Không thể xóa plan');
      console.error(err);
    }
  };

  const handleToggleStatus = async (planId) => {
    try {
      await adminAPI.togglePlanStatus(planId);
      await fetchPlans();
    } catch (err) {
      alert('Không thể thay đổi trạng thái');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Plans</h1>
          <p className="text-gray-600 mt-1">Quản lý các gói dịch vụ Free và Premium</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Tạo Plan Mới
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Giá:</span>
                <span className="font-semibold">{Number(plan.price).toLocaleString('vi-VN')} VNĐ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Thời hạn:</span>
                <span className="font-semibold">{plan.durationDays} ngày</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Max Posts:</span>
                <span className="font-semibold">{plan.maxPosts === 0 ? 'Unlimited' : plan.maxPosts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Max FB Accounts:</span>
                <span className="font-semibold">{plan.maxFbAccounts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subscribers:</span>
                <span className="font-semibold">{plan.subscriberCount || 0}</span>
              </div>
            </div>

            <div className="mb-4 rounded-md bg-gray-50 p-3">
              <div className="text-xs font-medium text-gray-500 mb-2">Features</div>
              <div className="flex flex-wrap gap-2">
                {enabledFeatureLabels(plan.features).length > 0 ? (
                  enabledFeatureLabels(plan.features).map((label) => (
                    <span key={label} className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
                      {label}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-500">Chua bat feature nao</span>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => handleOpenModal(plan)}
                className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                Sửa
              </button>
              <button
                onClick={() => handleToggleStatus(plan.id)}
                className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
              >
                {plan.isActive ? 'Tắt' : 'Bật'}
              </button>
              <button
                onClick={() => handleDelete(plan.id)}
                className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                disabled={plan.subscriberCount > 0}
              >
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingPlan ? 'Sửa Plan' : 'Tạo Plan Mới'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Plan *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá (VNĐ) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời hạn (ngày) *
                    </label>
                    <input
                      type="number"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max Posts (0 = unlimited)
                    </label>
                    <input
                      type="number"
                      value={formData.maxPosts}
                      onChange={(e) => setFormData({ ...formData, maxPosts: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max FB Accounts
                    </label>
                    <input
                      type="number"
                      value={formData.maxFbAccounts}
                      onChange={(e) => setFormData({ ...formData, maxFbAccounts: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">
                    Tinh nang cua plan
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {FEATURE_OPTIONS.map((feature) => (
                      <label
                        key={feature.key}
                        className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50"
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(formData.features[feature.key])}
                          onChange={(e) => handleFeatureChange(feature.key, e.target.checked)}
                          className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span>
                          <span className="block text-sm font-medium text-gray-900">
                            {feature.label}
                          </span>
                          <span className="block text-xs text-gray-500 mt-0.5">
                            {feature.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>

                  {Object.keys(formData.extraFeatures || {}).length > 0 && (
                    <div className="mt-3 rounded-md bg-amber-50 border border-amber-200 p-3">
                      <div className="text-xs font-medium text-amber-800">
                        Feature tuy chinh dang duoc giu nguyen
                      </div>
                      <div className="mt-1 text-xs text-amber-700">
                        {Object.keys(formData.extraFeatures).join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Active (cho phép user đăng ký)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingPlan ? 'Cập nhật' : 'Tạo Plan'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
