import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getActivityLogs } from '../store/slices/userSlice';

const ActivityLogs = () => {
  const dispatch = useDispatch();
  const { activityLogs, logsPagination, loading } = useSelector((state) => state.user);
  const [filters, setFilters] = useState({ userEmail: '', action: '', resource: '' });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(getActivityLogs({ ...filters, page: currentPage, limit: 50 }));
  }, [dispatch, filters, currentPage]);

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
    setCurrentPage(1);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Activity Logs</h1>

      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User email</label>
            <input name="userEmail" value={filters.userEmail} onChange={handleFilterChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
            <select name="action" value={filters.action} onChange={handleFilterChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All</option>
              <option value="login">login</option>
              <option value="register">register</option>
              <option value="create_post">create_post</option>
              <option value="update_post">update_post</option>
              <option value="delete_post">delete_post</option>
              <option value="create_plan">create_plan</option>
              <option value="update_plan">update_plan</option>
              <option value="assign_plan">assign_plan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
            <select name="resource" value={filters.resource} onChange={handleFilterChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="">All</option>
              <option value="user">user</option>
              <option value="post">post</option>
              <option value="plan">plan</option>
              <option value="subscription">subscription</option>
              <option value="facebook_account">facebook_account</option>
              <option value="settings">settings</option>
            </select>
          </div>
        </div>
      </div>

      {loading && activityLogs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : activityLogs.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center text-gray-500">No logs found</div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Agent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activityLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(log.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="font-medium text-gray-900">{log.user?.fullName || 'N/A'}</div>
                      <div className="text-gray-500">{log.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{log.resource}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{log.ipAddress || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{log.userAgent || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {logsPagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-4 py-2 border rounded disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-700">{currentPage} / {logsPagination.totalPages}</span>
          <button disabled={currentPage === logsPagination.totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="px-4 py-2 border rounded disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
