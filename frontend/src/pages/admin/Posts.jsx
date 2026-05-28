import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/adminApi';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [filters, setFilters] = useState({ status: '', userId: '', caption: '', page: 1, limit: 20 });

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getPosts(filters);
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const openDetail = async (postId) => {
    const response = await adminAPI.getPost(postId);
    setSelectedPost(response.data);
  };

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return;
    await adminAPI.deletePost(postId);
    await fetchPosts();
  };

  const updateFilter = (field, value) => setFilters({ ...filters, [field]: value, page: 1 });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Posts Management</h1>
        <p className="text-gray-600 mt-1">View and manage all user posts.</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
            <input value={filters.caption} onChange={(event) => updateFilter('caption', event.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
            <input value={filters.userId} onChange={(event) => updateFilter('userId', event.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex items-end text-sm text-gray-600">
            Total: <span className="font-semibold ml-1">{pagination.total || 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Caption</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Error</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No posts found</td></tr>
              ) : posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{post.user?.fullName || 'N/A'}</div>
                    <div className="text-sm text-gray-500">{post.user?.email}</div>
                  </td>
                  <td className="px-6 py-4"><div className="text-sm text-gray-900 max-w-xs truncate">{post.caption || '(No caption)'}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{post.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div>{post.targetType}</div>
                    {post.fbPostUrl && (
                      <a href={post.fbPostUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800">
                        Open post
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-red-600 max-w-xs truncate">{post.errorMessage || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button onClick={() => openDetail(post.id)} className="text-blue-600 hover:text-blue-900">Detail</button>
                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <button disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="px-4 py-2 border rounded disabled:opacity-50">Previous</button>
          <span className="text-sm text-gray-700">{filters.page} / {pagination.totalPages}</span>
          <button disabled={filters.page === pagination.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="px-4 py-2 border rounded disabled:opacity-50">Next</button>
        </div>
      )}

      {selectedPost && (
        <div className="fixed inset-0 z-20 bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 space-y-4">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">Post detail</h2>
              <button onClick={() => setSelectedPost(null)} className="text-gray-500">Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">User:</span> {selectedPost.user?.email}</div>
              <div><span className="text-gray-500">Status:</span> {selectedPost.status}</div>
              <div><span className="text-gray-500">Target:</span> {selectedPost.targetType} / {selectedPost.targetId}</div>
              <div><span className="text-gray-500">Facebook:</span> {selectedPost.facebookAccount?.fbUserName || 'N/A'}</div>
              {selectedPost.fbPostUrl && (
                <div className="md:col-span-2">
                  <span className="text-gray-500">Post URL:</span>{' '}
                  <a href={selectedPost.fbPostUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 break-all">
                    {selectedPost.fbPostUrl}
                  </a>
                </div>
              )}
            </div>
            <div className="whitespace-pre-wrap text-sm">{selectedPost.caption}</div>
            {selectedPost.errorMessage && <div className="rounded bg-red-50 p-3 text-sm text-red-700">{selectedPost.errorMessage}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="border rounded p-3">
                <div className="font-medium">Card 1</div>
                <div>{selectedPost.card1Title}</div>
                <div className="text-gray-500">{selectedPost.card1Description}</div>
                <div className="text-blue-600 break-all">{selectedPost.card1LinkUrl}</div>
              </div>
              <div className="border rounded p-3">
                <div className="font-medium">Card 2 {selectedPost.card2ManagedByAdmin ? '(managed)' : ''}</div>
                <div>{selectedPost.card2Title}</div>
                <div className="text-gray-500">{selectedPost.card2Description}</div>
                <div className="text-blue-600 break-all">{selectedPost.card2LinkUrl}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Posts;
