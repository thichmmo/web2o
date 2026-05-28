import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getLoginUrl,
  getAccounts,
  disconnectAccount,
  connectMock,
  connectToken,
} from '../store/slices/facebookSlice';

const FacebookAccounts = () => {
  const dispatch = useDispatch();
  const { accounts, loading } = useSelector((state) => state.facebook);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenForm, setTokenForm] = useState({
    accessToken: '',
    tokenExpiresAt: '',
  });

  useEffect(() => {
    dispatch(getAccounts());
  }, [dispatch]);

  const handleConnectOAuth = async () => {
    const result = await dispatch(getLoginUrl());
    if (getLoginUrl.fulfilled.match(result)) {
      if (result.payload.mockMode) {
        await dispatch(connectMock());
        dispatch(getAccounts());
        return;
      }
      window.location.href = result.payload.loginUrl;
    }
  };

  const handleConnectToken = async (event) => {
    event.preventDefault();

    if (!tokenForm.accessToken.trim()) {
      alert('Vui long nhap access token');
      return;
    }

    const result = await dispatch(connectToken({
      accessToken: tokenForm.accessToken.trim(),
      tokenExpiresAt: tokenForm.tokenExpiresAt || undefined,
    }));

    if (connectToken.fulfilled.match(result)) {
      setShowTokenModal(false);
      setTokenForm({ accessToken: '', tokenExpiresAt: '' });
      dispatch(getAccounts());
    } else {
      alert(result.payload || 'Khong the ket noi bang token');
    }
  };

  const handleDisconnect = async (accountId) => {
    if (window.confirm('Ban co chac muon ngat ket noi tai khoan nay?')) {
      await dispatch(disconnectAccount(accountId));
      dispatch(getAccounts());
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tai khoan Facebook</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleConnectOAuth}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ket noi OAuth
          </button>
          <button
            onClick={() => setShowTokenModal(true)}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50"
          >
            Ket noi bang token
          </button>
        </div>
      </div>

      {loading && accounts.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-500">Dang tai...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chua co tai khoan Facebook</h3>
          <p className="mt-1 text-sm text-gray-500">
            Ket noi tai khoan Facebook de bat dau dang bai.
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={handleConnectOAuth}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ket noi OAuth
            </button>
            <button
              onClick={() => setShowTokenModal(true)}
              className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
            >
              Ket noi bang token
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {accounts.map((account) => (
              <li key={account.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-10 w-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{account.fbUserName}</p>
                        <p className="text-xs text-gray-500">Facebook ID: {account.fbUserId}</p>
                        <p className="text-sm text-gray-500">
                          Ket noi: {new Date(account.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Token het han: {new Date(account.tokenExpiresAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {account.isActive ? 'Hoat dong' : 'Khong hoat dong'}
                      </span>
                      {account.isActive && (
                        <button
                          onClick={() => handleDisconnect(account.id)}
                          className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                        >
                          Ngat ket noi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Luu y</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>OAuth can Facebook App ID/Secret de dang nhap theo luong chuan.</li>
                <li>Token thu cong phu hop khi ban da co user/page access token tu Facebook.</li>
                <li>Token chi gui len backend va khong hien lai tren giao dien.</li>
                <li>Token can quyen phu hop de lay pages/groups va dang bai live.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {showTokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h2 className="text-xl font-bold mb-2">Ket noi Facebook bang token</h2>
            <p className="text-sm text-gray-600 mb-4">
              Nhap user/page access token cua Facebook. Token se duoc luu o backend va khong tra ve frontend.
            </p>

            <form onSubmit={handleConnectToken} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access token *
                </label>
                <textarea
                  value={tokenForm.accessToken}
                  onChange={(event) => setTokenForm({ ...tokenForm, accessToken: event.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  rows="5"
                  placeholder="EAAB..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngay het han token (tuy chon)
                </label>
                <input
                  type="datetime-local"
                  value={tokenForm.tokenExpiresAt}
                  onChange={(event) => setTokenForm({ ...tokenForm, tokenExpiresAt: event.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Neu de trong, he thong tam dat han 60 ngay.
                </p>
              </div>

              <div className="rounded bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                Token that se duoc backend goi Facebook Graph API de xac thuc profile truoc khi luu.
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Ket noi token
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTokenModal(false);
                    setTokenForm({ accessToken: '', tokenExpiresAt: '' });
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
    </div>
  );
};

export default FacebookAccounts;
