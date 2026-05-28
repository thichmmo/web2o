import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getPosts, publishPost, deletePost, retryPost } from '../store/slices/postSlice';

const PostHistory = () => {
  const dispatch = useDispatch();
  const { posts, pagination, loading, error } = useSelector((state) => state.post);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const load = () => dispatch(getPosts({ status: statusFilter, page: currentPage, limit: 20 }));

  useEffect(() => {
    load();
  }, [dispatch, statusFilter, currentPage]);

  const handlePublish = async (postId) => {
    await dispatch(publishPost(postId));
    load();
  };

  const handleRetry = async (postId) => {
    await dispatch(retryPost(postId));
    load();
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Delete this post?')) {
      await dispatch(deletePost(postId));
      load();
    }
  };

  const badgeClass = (status) => ({
    draft: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-blue-100 text-blue-800',
    publishing: 'bg-purple-100 text-purple-800',
    published: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800');

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
        <Link to="/dashboard/posts/create" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          Create post
        </Link>
      </div>

      {error && <div className="mb-4 rounded bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      <div className="mb-6 bg-white shadow rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
        <select
          className="block w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {loading && posts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <h2 className="text-lg font-medium text-gray-900">No posts found</h2>
          <p className="mt-1 text-sm text-gray-500">Create a post to see it here.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {posts.map((post) => (
              <li key={post.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">{post.caption || '(No caption)'}</p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badgeClass(post.status)}`}>{post.status}</span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {post.facebookAccount?.fbUserName || 'N/A'} | {post.targetType}
                    </div>
                    <div className="mt-1 text-xs text-gray-400">
                      Created: {new Date(post.createdAt).toLocaleString('vi-VN')}
                      {post.scheduledAt && <span className="ml-4">Scheduled: {new Date(post.scheduledAt).toLocaleString('vi-VN')}</span>}
                    </div>
                    {post.errorMessage && <div className="mt-2 text-sm text-red-600">{post.errorMessage}</div>}
                    {post.fbPostUrl && (
                      <a
                        href={post.fbPostUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Open Facebook post
                      </a>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link to={`/dashboard/posts/${post.id}`} className="px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 bg-white">
                      Detail
                    </Link>
                    {post.status === 'draft' && (
                      <button onClick={() => handlePublish(post.id)} className="px-3 py-1 text-sm rounded-md text-white bg-green-600">
                        Publish
                      </button>
                    )}
                    {post.status === 'failed' && (
                      <button onClick={() => handleRetry(post.id)} className="px-3 py-1 text-sm rounded-md text-white bg-yellow-600">
                        Retry
                      </button>
                    )}
                    {post.status !== 'publishing' && (
                      <button onClick={() => handleDelete(post.id)} className="px-3 py-1 border border-red-300 text-sm rounded-md text-red-700 bg-white">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="px-4 py-2 border rounded disabled:opacity-50">
            Previous
          </button>
          <span className="text-sm text-gray-700">{currentPage} / {pagination.totalPages}</span>
          <button disabled={currentPage === pagination.totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="px-4 py-2 border rounded disabled:opacity-50">
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PostHistory;
