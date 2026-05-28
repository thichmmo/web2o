import { useEffect, useState } from 'react';
import { adminSettingsAPI } from '../../services/adminApi';
import { getAssetUrl, notifyBrandingUpdated } from '../../utils/branding';

const getErrorMessage = (error, fallback) => {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  return error.message || error.error?.message || fallback;
};

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [localError, setLocalError] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await adminSettingsAPI.getSettings();
      setSettings(response.data);

      // Initialize form data
      const initialData = {};
      Object.keys(response.data).forEach(key => {
        initialData[key] = response.data[key].value;
      });
      setFormData(initialData);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load settings'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setFormData({
      ...formData,
      [key]: value,
    });
    setSuccessMessage('');
    setLocalError('');
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('type', type);
    setLocalError('');
    setSuccessMessage('');

    try {
      if (type === 'logo') {
        setUploadingLogo(true);
      } else {
        setUploadingFavicon(true);
      }

      const response = await adminSettingsAPI.uploadAsset(formDataUpload);

      const key = type === 'logo' ? 'site_logo' : 'site_favicon';
      setFormData((current) => ({
        ...current,
        [key]: response.data.filePath,
      }));
      setSuccessMessage(`${type === 'logo' ? 'Logo' : 'Favicon'} đã được tải lên thành công!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      loadSettings();
      notifyBrandingUpdated();
    } catch (error) {
      setLocalError(getErrorMessage(error, 'Khong the upload file branding'));
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else {
        setUploadingFavicon(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    try {
      await adminSettingsAPI.updateSettings(formData);
      setSuccessMessage('Cài đặt đã được cập nhật thành công!');
      loadSettings();
      notifyBrandingUpdated();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setLocalError(getErrorMessage(err, 'Khong the luu cai dat'));
    }
  };

  if (loading && !settings) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500">Đang tải cài đặt...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cài đặt hệ thống</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {successMessage && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-800">{successMessage}</div>
          </div>
        )}

        {(error || localError) && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{error || localError}</div>
          </div>
        )}

        {/* General Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Cài đặt chung</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên website
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.site_name || ''}
                onChange={(e) => handleChange('site_name', e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                {settings?.site_name?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả website
              </label>
              <textarea
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.site_description || ''}
                onChange={(e) => handleChange('site_description', e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                {settings?.site_description?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email liên hệ
              </label>
              <input
                type="email"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                {settings?.contact_email?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Chế độ bảo trì</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Bật chế độ bảo trì</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Khi bật, người dùng sẽ không thể truy cập website (trừ admin)
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.maintenance_mode || false}
                  onChange={(e) => handleChange('maintenance_mode', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thông báo bảo trì
              </label>
              <textarea
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.maintenance_message || ''}
                onChange={(e) => handleChange('maintenance_message', e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Thông báo hiển thị khi website đang bảo trì
              </p>
            </div>
          </div>
        </div>

        {/* User Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Cài đặt người dùng</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Cho phép đăng ký</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Cho phép người dùng mới đăng ký tài khoản
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.allow_registration || false}
                  onChange={(e) => handleChange('allow_registration', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Upload Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Cài đặt upload</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kích thước video tối đa (MB)
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.max_video_size_mb || 100}
                onChange={(e) => handleChange('max_video_size_mb', parseInt(e.target.value))}
              />
              <p className="mt-1 text-xs text-gray-500">
                {settings?.max_video_size_mb?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Độ dài caption tối đa
              </label>
              <input
                type="number"
                min="100"
                max="10000"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.max_caption_length || 5000}
                onChange={(e) => handleChange('max_caption_length', parseInt(e.target.value))}
              />
              <p className="mt-1 text-xs text-gray-500">
                {settings?.max_caption_length?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Facebook Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Cài đặt Facebook</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook App ID
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.facebook_app_id || ''}
                onChange={(e) => handleChange('facebook_app_id', e.target.value)}
                placeholder="123456789012345"
              />
              <p className="mt-1 text-xs text-gray-500">
                {settings?.facebook_app_id?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Cài đặt phân tích</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Bật Google Analytics</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Theo dõi lượt truy cập và hành vi người dùng
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.enable_analytics || false}
                  onChange={(e) => handleChange('enable_analytics', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Cài đặt Email</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg mb-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900">Bật gửi email</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Cho phép hệ thống gửi email thông báo
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-4">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.email_enabled || false}
                  onChange={(e) => handleChange('email_enabled', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.smtp_host || ''}
                  onChange={(e) => handleChange('smtp_host', e.target.value)}
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Port
                </label>
                <input
                  type="number"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.smtp_port || 587}
                  onChange={(e) => handleChange('smtp_port', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  checked={formData.smtp_secure || false}
                  onChange={(e) => handleChange('smtp_secure', e.target.checked)}
                />
                <span className="ml-2 text-sm text-gray-700">Sử dụng SSL/TLS</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Username
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.smtp_user || ''}
                  onChange={(e) => handleChange('smtp_user', e.target.value)}
                  placeholder="your-email@gmail.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SMTP Password
                </label>
                <input
                  type="password"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.smtp_password === '********' ? '' : (formData.smtp_password || '')}
                onChange={(e) => handleChange('smtp_password', e.target.value)}
                placeholder={formData.smtp_password === '********' ? 'Đã lưu mật khẩu SMTP' : '••••••••'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên người gửi
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.email_from_name || ''}
                  onChange={(e) => handleChange('email_from_name', e.target.value)}
                  placeholder="Thích Cừu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email người gửi
                </label>
                <input
                  type="email"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={formData.email_from_address || ''}
                  onChange={(e) => handleChange('email_from_address', e.target.value)}
                  placeholder="noreply@thichcuu.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Branding Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Cài đặt Branding</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo Website
              </label>
              <div className="flex items-center space-x-4">
                {formData.site_logo && (
                  <img
                    src={getAssetUrl(formData.site_logo)}
                    alt="Logo"
                    className="h-16 w-auto object-contain border border-gray-300 rounded p-2"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={uploadingLogo}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, SVG tối đa 5MB
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon Website
              </label>
              <div className="flex items-center space-x-4">
                {formData.site_favicon && (
                  <img
                    src={getAssetUrl(formData.site_favicon)}
                    alt="Favicon"
                    className="h-8 w-8 object-contain border border-gray-300 rounded"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*,.ico"
                    onChange={(e) => handleFileUpload(e, 'favicon')}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={uploadingFavicon}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    ICO, PNG tối đa 5MB (khuyến nghị 32x32px)
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Màu chủ đạo
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    value={formData.primary_color || '#2563eb'}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.primary_color || '#2563eb'}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    placeholder="#2563eb"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Màu phụ
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    value={formData.secondary_color || '#1e40af'}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                  />
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={formData.secondary_color || '#1e40af'}
                    onChange={(e) => handleChange('secondary_color', e.target.value)}
                    placeholder="#1e40af"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom CSS
              </label>
              <textarea
                rows={6}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-xs"
                value={formData.custom_css || ''}
                onChange={(e) => handleChange('custom_css', e.target.value)}
                placeholder="/* Custom CSS code */"
              />
              <p className="mt-1 text-xs text-gray-500">
                CSS tùy chỉnh sẽ được áp dụng cho toàn bộ website
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom JavaScript
              </label>
              <textarea
                rows={6}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-xs"
                value={formData.custom_js || ''}
                onChange={(e) => handleChange('custom_js', e.target.value)}
                placeholder="// Custom JavaScript code"
              />
              <p className="mt-1 text-xs text-gray-500">
                JavaScript tùy chỉnh (cẩn thận với security)
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
