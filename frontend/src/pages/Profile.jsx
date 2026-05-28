import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../store/slices/authSlice';
import { authAPI, userAPI } from '../services/api';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    userAPI.getProfileStats().then((response) => setStats(response.data));
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    await dispatch(updateProfile({ fullName }));
    setMessage('Profile updated.');
  };

  const changePassword = async (event) => {
    event.preventDefault();
    await authAPI.changePassword(passwords);
    setPasswords({ currentPassword: '', newPassword: '' });
    setMessage('Password changed.');
  };

  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      {message && <div className="rounded bg-green-50 p-4 text-sm text-green-800">{message}</div>}

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Email:</span> {user?.email}</div>
          <div><span className="text-gray-500">Role:</span> {user?.role}</div>
          <div><span className="text-gray-500">Created:</span> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</div>
          <div><span className="text-gray-500">Monthly posts:</span> {stats?.monthlyPosts ?? 0}</div>
          <div><span className="text-gray-500">Posts remaining:</span> {stats?.postsRemaining ?? 0}</div>
          <div><span className="text-gray-500">Facebook accounts:</span> {stats?.facebookAccounts ?? 0}/{stats?.maxFbAccounts ?? 1}</div>
        </div>
      </div>

      <form onSubmit={saveProfile} className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Edit name</h2>
        <input value={fullName} onChange={(event) => setFullName(event.target.value)} className="block w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md" required />
        <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm">Save</button>
      </form>

      <form onSubmit={changePassword} className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Change password</h2>
        <input type="password" placeholder="Current password" value={passwords.currentPassword} onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })} className="block w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md" required />
        <input type="password" placeholder="New password" value={passwords.newPassword} onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })} className="block w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md" required minLength={8} />
        <button className="px-4 py-2 rounded bg-blue-600 text-white text-sm">Change password</button>
      </form>
    </div>
  );
};

export default Profile;
