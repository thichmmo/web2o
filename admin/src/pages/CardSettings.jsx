import { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const CardSettings = () => {
  const [cardSettings, setCardSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchCardSettings();
  }, []);

  const fetchCardSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getCardSettings();
      setCardSettings(response.data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể tải cài đặt card' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCard = async (cardIndex, data) => {
    try {
      setSaving(true);
      await adminAPI.updateCardSettings(cardIndex, data);
      setMessage({ type: 'success', text: `Đã lưu cài đặt Card ${cardIndex}` });
      fetchCardSettings();
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể lưu cài đặt' });
    } finally {
      setSaving(false);
    }
  };

  const handleResetCard = async (cardIndex) => {
    if (!confirm(`Bạn có chắc muốn reset Card ${cardIndex} về mặc định?`)) return;

    try {
      setSaving(true);
      await adminAPI.resetCardSettings(cardIndex);
      setMessage({ type: 'success', text: `Đã reset Card ${cardIndex} về mặc định` });
      fetchCardSettings();
    } catch (error) {
      setMessage({ type: 'error', text: 'Không thể reset cài đặt' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-500">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt Card</h1>
        <p className="mt-2 text-sm text-gray-600">
          Quản lý cài đặt cho Card 1 và Card 2 trong giao diện người dùng
        </p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {cardSettings.map((card) => (
          <CardSettingsForm
            key={card.id}
            card={card}
            onSave={handleUpdateCard}
            onReset={handleResetCard}
            saving={saving}
          />
        ))}
      </div>
    </div>
  );
};

const getAccept = (allowedMediaTypes) => {
  const accepts = [];
  if (allowedMediaTypes.includes('image')) accepts.push('image/*');
  if (allowedMediaTypes.includes('video')) accepts.push('video/*');
  return accepts.join(',');
};

const CardSettingsForm = ({ card, onSave, onReset, saving }) => {
  const [formData, setFormData] = useState({
    isEnabled: card.isEnabled,
    isLockedForFree: card.isLockedForFree,
    isLockedForPremium: card.isLockedForPremium,
    allowedMediaTypes: card.allowedMediaTypes || [],
    maxFileSizeMb: card.maxFileSizeMb,
    defaultMediaUrl: card.defaultMediaUrl || '',
    defaultTitle: card.defaultTitle || '',
    defaultDescription: card.defaultDescription || '',
    defaultLinkUrl: card.defaultLinkUrl || '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMediaTypeToggle = (type) => {
    const current = formData.allowedMediaTypes;
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    handleChange('allowedMediaTypes', updated);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      alert('Vui lòng chọn file hình ảnh hoặc video');
      return;
    }

    const mediaType = isVideo ? 'video' : 'image';
    if (!formData.allowedMediaTypes.includes(mediaType)) {
      alert(`Loáº¡i media ${mediaType} khÃ´ng Ä‘Æ°á»£c phÃ©p cho Card ${card.cardIndex}`);
      return;
    }

    // Validate file size
    const maxSize = formData.maxFileSizeMb * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File quá lớn. Kích thước tối đa: ${formData.maxFileSizeMb}MB`);
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadPreview({
          url: e.target.result,
          type: isImage ? 'image' : 'video',
        });
      };
      reader.readAsDataURL(file);

      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await adminAPI.uploadCardDefaultMedia(card.cardIndex, formDataUpload);
      handleChange('defaultMediaUrl', response.data.filePath);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Không thể upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(card.cardIndex, formData);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Card {card.cardIndex}
        </h2>
        <button
          type="button"
          onClick={() => onReset(card.cardIndex)}
          disabled={saving}
          className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          Reset về mặc định
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enable/Disable Card */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Bật Card {card.cardIndex}</label>
            <p className="text-sm text-gray-500">Cho phép người dùng sử dụng card này</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isEnabled}
              onChange={(e) => handleChange('isEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Lock for Free Users */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Khóa cho user Free</label>
            <p className="text-sm text-gray-500">User free không thể sử dụng card này</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isLockedForFree}
              onChange={(e) => handleChange('isLockedForFree', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Lock for Premium Users */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Khóa cho user Premium</label>
            <p className="text-sm text-gray-500">User premium không thể sử dụng card này</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isLockedForPremium}
              onChange={(e) => handleChange('isLockedForPremium', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Allowed Media Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại media cho phép
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allowedMediaTypes.includes('image')}
                onChange={() => handleMediaTypeToggle('image')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Hình ảnh</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allowedMediaTypes.includes('video')}
                onChange={() => handleMediaTypeToggle('video')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Video</span>
            </label>
          </div>
        </div>

        {/* Max File Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kích thước file tối đa (MB)
          </label>
          <input
            type="number"
            value={formData.maxFileSizeMb}
            onChange={(e) => handleChange('maxFileSizeMb', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            max="5000"
          />
        </div>

        {/* Default Values */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Giá trị mặc định</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Media mặc định
              </label>
              <div className="space-y-3">
                {/* Preview */}
                {(uploadPreview || formData.defaultMediaUrl) && (
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                    {uploadPreview?.type === 'video' || formData.defaultMediaUrl?.match(/\.(mp4|webm|ogg)$/i) ? (
                      <video
                        src={uploadPreview?.url || formData.defaultMediaUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={uploadPreview?.url || formData.defaultMediaUrl}
                        alt="Preview"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                )}

                {/* Upload button */}
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm text-gray-700">
                        {uploading ? 'Đang upload...' : 'Upload từ máy'}
                      </span>
                    </div>
                    <input
                      type="file"
                      accept={getAccept(formData.allowedMediaTypes)}
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>

                  {(uploadPreview || formData.defaultMediaUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadPreview(null);
                        handleChange('defaultMediaUrl', '');
                      }}
                      className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50"
                    >
                      Xóa
                    </button>
                  )}
                </div>

                {/* URL input */}
                <div className="relative">
                  <span className="text-xs text-gray-500 mb-1 block">Hoặc nhập URL:</span>
                  <input
                    type="url"
                    value={formData.defaultMediaUrl}
                    onChange={(e) => {
                      handleChange('defaultMediaUrl', e.target.value);
                      setUploadPreview(null);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề mặc định
              </label>
              <input
                type="text"
                value={formData.defaultTitle}
                onChange={(e) => handleChange('defaultTitle', e.target.value)}
                placeholder="Nhập tiêu đề mặc định"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả mặc định
              </label>
              <textarea
                value={formData.defaultDescription}
                onChange={(e) => handleChange('defaultDescription', e.target.value)}
                placeholder="Nhập mô tả mặc định"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link URL mặc định
              </label>
              <input
                type="url"
                value={formData.defaultLinkUrl}
                onChange={(e) => handleChange('defaultLinkUrl', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CardSettings;
