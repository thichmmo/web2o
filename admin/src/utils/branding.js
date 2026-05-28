import { useEffect, useState } from 'react';
import { API_BASE_URL, settingsAPI } from '../services/api';

const DEFAULT_BRANDING = {
  site_name: 'Thich Cuu - Facebook Tool',
  site_description: 'Facebook carousel posting tool',
  site_logo: '',
  site_favicon: '',
  primary_color: '#2563eb',
  secondary_color: '#1e40af',
  custom_css: '',
};

const getApiOrigin = () => API_BASE_URL.replace(/\/api(?:\/v\d+)?\/?$/, '');

export const getAssetUrl = (value) => {
  if (!value) return '';
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;
  return `${getApiOrigin()}${value.startsWith('/') ? value : `/${value}`}`;
};

export const applyDocumentBranding = (branding, titlePrefix = '') => {
  const siteName = branding.site_name || DEFAULT_BRANDING.site_name;
  document.title = titlePrefix ? `${titlePrefix} - ${siteName}` : siteName;

  const faviconUrl = getAssetUrl(branding.site_favicon);
  if (faviconUrl) {
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = faviconUrl;
  }

  document.documentElement.style.setProperty('--brand-primary', branding.primary_color || DEFAULT_BRANDING.primary_color);
  document.documentElement.style.setProperty('--brand-secondary', branding.secondary_color || DEFAULT_BRANDING.secondary_color);

  let customStyle = document.getElementById('branding-custom-css');
  if (!customStyle) {
    customStyle = document.createElement('style');
    customStyle.id = 'branding-custom-css';
    document.head.appendChild(customStyle);
  }
  customStyle.textContent = branding.custom_css || '';
};

export const notifyBrandingUpdated = () => {
  window.dispatchEvent(new Event('branding-updated'));
};

export const usePublicBranding = (titlePrefix = '') => {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);

  useEffect(() => {
    let mounted = true;

    const loadBranding = async () => {
      try {
        const response = await settingsAPI.getPublicSettings();
        const nextBranding = { ...DEFAULT_BRANDING, ...(response.data?.branding || {}) };
        if (mounted) {
          setBranding(nextBranding);
          applyDocumentBranding(nextBranding, titlePrefix);
        }
      } catch {
        applyDocumentBranding(DEFAULT_BRANDING, titlePrefix);
      }
    };

    loadBranding();
    window.addEventListener('branding-updated', loadBranding);

    return () => {
      mounted = false;
      window.removeEventListener('branding-updated', loadBranding);
    };
  }, [titlePrefix]);

  return branding;
};
