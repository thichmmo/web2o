import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../store/slices/postSlice';
import {
  getAccounts,
  getPages,
  getAdAccounts,
  getGroups,
  clearPages,
  clearAdAccounts,
  clearGroups,
} from '../store/slices/facebookSlice';
import { userAPI } from '../services/api';

const emptyCard = {
  title: '',
  description: '',
  linkUrl: '',
  media: null,
  preview: null,
};

const getAccept = (cardSettings) => {
  const types = cardSettings?.allowedMediaTypes || ['image', 'video'];
  const accepts = [];
  if (types.includes('image')) accepts.push('image/*');
  if (types.includes('video')) accepts.push('video/*');
  return accepts.join(',');
};

const isUsableAdAccount = (account) => {
  const status = String(account.accountStatus || '').toUpperCase();
  return account.isActive !== false && (!status || status === '1' || status === 'ACTIVE');
};

const CreatePost = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: postLoading, error: postError } = useSelector((state) => state.post);
  const { accounts, pages, adAccounts, groups, loading: fbLoading } = useSelector((state) => state.facebook);

  const [formData, setFormData] = useState({
    fbAccountId: '',
    targetType: 'profile',
    targetId: '',
    adAccountId: '',
    caption: '',
    scheduledAt: '',
    publishNow: false,
  });
  const [card1, setCard1] = useState(emptyCard);
  const [card2, setCard2] = useState(emptyCard);
  const [cardConfig, setCardConfig] = useState({ cards: [], card2: { canEdit: false } });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    dispatch(getAccounts());
    userAPI.getCardSettings()
      .then((response) => setCardConfig(response.data))
      .catch(() => setValidationError('Cannot load card permissions'));
  }, [dispatch]);

  useEffect(() => {
    if (formData.fbAccountId && formData.targetType !== 'profile') {
      if (formData.targetType === 'page') {
        dispatch(getPages(formData.fbAccountId));
        dispatch(getAdAccounts(formData.fbAccountId));
      }
      if (formData.targetType === 'group') dispatch(getGroups(formData.fbAccountId));
    } else {
      dispatch(clearPages());
      dispatch(clearAdAccounts());
      dispatch(clearGroups());
    }
  }, [formData.fbAccountId, formData.targetType, dispatch]);

  const card1Settings = cardConfig.cards?.find((card) => card.cardIndex === 1);
  const card2Settings = cardConfig.cards?.find((card) => card.cardIndex === 2);
  const card1Access = cardConfig.cardAccess?.['1'] || cardConfig.cardAccess?.[1];
  const canUseCard1 = card1Access ? Boolean(card1Access.canUse) : card1Settings?.isEnabled !== false;
  const canEditCard2 = Boolean(cardConfig.card2?.canEdit);

  const setSelectedAccountProfileTarget = (accountId, nextTargetType = formData.targetType) => {
    if (nextTargetType !== 'profile') return '';
    const account = accounts.find((item) => item.id === accountId);
    return account?.fbUserId || '';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValidationError('');
    setFormData((prev) => {
      const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'fbAccountId') {
        next.targetId = setSelectedAccountProfileTarget(value, next.targetType);
        next.adAccountId = '';
      }
      if (name === 'targetType') {
        next.targetId = value === 'profile' ? setSelectedAccountProfileTarget(next.fbAccountId, value) : '';
        next.adAccountId = '';
      }
      return next;
    });
  };

  const handleCardChange = (cardNumber, field, value) => {
    const setter = cardNumber === 1 ? setCard1 : setCard2;
    setter((prev) => ({ ...prev, [field]: value }));
    setValidationError('');
  };

  const handleMediaChange = (cardNumber, file) => {
    if (!file) return;
    const settings = cardNumber === 1 ? card1Settings : card2Settings;
    const allowed = settings?.allowedMediaTypes || ['image', 'video'];
    const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : '';

    if (!type || !allowed.includes(type)) {
      setValidationError(`Card ${cardNumber} media type is not allowed`);
      return;
    }

    const maxMb = settings?.maxFileSizeMb || 500;
    if (file.size > maxMb * 1024 * 1024) {
      setValidationError(`Card ${cardNumber} media exceeds ${maxMb}MB`);
      return;
    }

    handleCardChange(cardNumber, 'media', file);
    handleCardChange(cardNumber, 'preview', URL.createObjectURL(file));
  };

  const validate = () => {
    if (!formData.fbAccountId) return 'Please select a Facebook account';
    if (!canUseCard1) return card1Access?.reason || 'Card 1 is not available for your account';
    if (!formData.targetId) return 'Please select a target';
    if (formData.targetType === 'page' && !formData.adAccountId) return 'Please select an ad account';
    if (!formData.caption.trim()) return 'Caption is required';
    if (!card1.media) return 'Card 1 media is required';
    if (card1.linkUrl && !/^https?:\/\//i.test(card1.linkUrl)) return 'Card 1 link URL is invalid';
    if (canEditCard2 && card2.linkUrl && !/^https?:\/\//i.test(card2.linkUrl)) return 'Card 2 link URL is invalid';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }

    const data = new FormData();
    data.append('fbAccountId', formData.fbAccountId);
    data.append('targetType', formData.targetType);
    data.append('targetId', formData.targetId);
    if (formData.adAccountId) data.append('adAccountId', formData.adAccountId);
    data.append('caption', formData.caption);
    data.append('card1Title', card1.title);
    data.append('card1Description', card1.description);
    data.append('card1LinkUrl', card1.linkUrl);
    data.append('card1Media', card1.media);
    if (formData.scheduledAt) data.append('scheduledAt', formData.scheduledAt);
    if (formData.publishNow) data.append('publishNow', 'true');

    if (canEditCard2) {
      if (card2.media) data.append('card2Media', card2.media);
      data.append('card2Title', card2.title);
      data.append('card2Description', card2.description);
      data.append('card2LinkUrl', card2.linkUrl);
    }

    const result = await dispatch(createPost(data));
    if (createPost.fulfilled.match(result)) {
      navigate('/dashboard/posts');
    }
  };

  const renderMediaPreview = (card) => {
    if (!card.preview) return null;
    if (card.media?.type?.startsWith('video/')) {
      return <video src={card.preview} controls className="h-40 w-full object-contain rounded border bg-black" />;
    }
    return <img src={card.preview} alt="" className="h-40 w-full object-contain rounded border bg-gray-50" />;
  };

  const renderCardEditor = (cardNumber, card, disabled = false, disabledReason = 'Managed by admin for your current plan.') => {
    const settings = cardNumber === 1 ? card1Settings : card2Settings;
    return (
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Card {cardNumber}</h2>
          {disabled && (
            <p className="text-sm text-gray-500 mt-1">
              {disabledReason}
            </p>
          )}
        </div>

        {disabled && (
          <div className="rounded border bg-gray-50 p-4 text-sm text-gray-700">
            <div className="font-medium">{settings?.defaultTitle || 'Default Card 2'}</div>
            <div className="mt-1">{settings?.defaultDescription || 'No default description configured'}</div>
            <div className="mt-1 text-blue-600 break-all">{settings?.defaultLinkUrl || 'No default link configured'}</div>
          </div>
        )}

        {!disabled && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Media {cardNumber === 1 && <span className="text-red-500">*</span>}
              </label>
              {renderMediaPreview(card)}
              <input
                type="file"
                accept={getAccept(settings)}
                onChange={(event) => handleMediaChange(cardNumber, event.target.files[0])}
                className="mt-2 block w-full text-sm text-gray-600"
              />
              <p className="mt-1 text-xs text-gray-500">
                Allowed: {(settings?.allowedMediaTypes || ['image', 'video']).join(', ')}. Max {settings?.maxFileSizeMb || 500}MB.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={card.title}
                onChange={(event) => handleCardChange(cardNumber, 'title', event.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={card.description}
                onChange={(event) => handleCardChange(cardNumber, 'description', event.target.value)}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <input
                type="url"
                value={card.linkUrl}
                onChange={(event) => handleCardChange(cardNumber, 'linkUrl', event.target.value)}
                placeholder="https://example.com"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {(postError || validationError) && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-800">{postError || validationError}</div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook account</label>
            <select
              name="fbAccountId"
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={formData.fbAccountId}
              onChange={handleChange}
            >
              <option value="">Select account</option>
              {accounts.filter((account) => account.isActive).map((account) => (
                <option key={account.id} value={account.id}>
                  {account.fbUserName}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target type</label>
              <select
                name="targetType"
                required
                value={formData.targetType}
                onChange={handleChange}
                disabled={!formData.fbAccountId}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="profile">Profile</option>
                <option value="page">Page</option>
                <option value="group">Group</option>
              </select>
            </div>

            {formData.targetType !== 'profile' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <select
                  name="targetId"
                  required
                  value={formData.targetId}
                  onChange={handleChange}
                  disabled={fbLoading}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select target</option>
                  {(formData.targetType === 'page' ? pages : groups).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.targetType === 'page' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad account</label>
                <select
                  name="adAccountId"
                  required
                  value={formData.adAccountId}
                  onChange={handleChange}
                  disabled={fbLoading}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select ad account</option>
                  {adAccounts.filter(isUsableAdAccount).map((account) => (
                    <option key={account.adAccountId} value={account.adAccountId}>
                      {account.adAccountName} ({account.adAccountId})
                    </option>
                  ))}
                </select>
                {!fbLoading && adAccounts.filter(isUsableAdAccount).length === 0 && (
                  <p className="mt-1 text-xs text-red-600">
                    No active ad accounts found. Connect a token with ads_management/ads_read permission and an active ad account.
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
            <textarea
              name="caption"
              rows={4}
              required
              value={formData.caption}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Schedule time</label>
              <input
                name="scheduledAt"
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <label className="flex items-end gap-2 pb-2 text-sm text-gray-700">
              <input
                name="publishNow"
                type="checkbox"
                checked={formData.publishNow}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600"
              />
              Publish immediately
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderCardEditor(1, card1, !canUseCard1, card1Access?.reason || 'Card 1 is not available for your account.')}
        {renderCardEditor(2, card2, !canEditCard2, cardConfig.card2?.reason || 'Managed by admin for your current plan.')}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/posts')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={postLoading}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {postLoading ? 'Saving...' : 'Save post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
