import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getPost, publishPost, retryPost } from '../store/slices/postSlice';

const renderMedia = (url, type) => {
  if (!url) return <div className="h-40 rounded bg-gray-100 flex items-center justify-center text-gray-500">No media</div>;
  if (type === 'video' || /\.(mp4|mov|avi|webm|ogg)$/i.test(url)) {
    return <video src={url} controls className="h-48 w-full object-contain bg-black rounded" />;
  }
  return <img src={url} alt="" className="h-48 w-full object-contain bg-gray-50 rounded" />;
};

const PostDetail = () => {
  const { postId } = useParams();
  const dispatch = useDispatch();
  const { currentPost: post, loading, error } = useSelector((state) => state.post);

  useEffect(() => {
    dispatch(getPost(postId));
  }, [dispatch, postId]);

  if (loading || !post) return <div className="p-6 text-gray-600">Loading post...</div>;

  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Post detail</h1>
        <Link to="/dashboard/posts" className="text-sm text-blue-600">Back</Link>
      </div>
      {error && <div className="rounded bg-red-50 p-4 text-sm text-red-800">{error}</div>}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Status:</span> {post.status}</div>
          <div><span className="text-gray-500">Target:</span> {post.targetType} / {post.targetId}</div>
          {post.adAccountId && <div><span className="text-gray-500">Ad account:</span> {post.adAccountId}</div>}
          {post.fbPostUrl && (
            <div>
              <span className="text-gray-500">Facebook post:</span>{' '}
              <a href={post.fbPostUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 break-all">
                {post.fbPostUrl}
              </a>
            </div>
          )}
          {post.facebookCreativeId && <div><span className="text-gray-500">Creative:</span> {post.facebookCreativeId}</div>}
          <div><span className="text-gray-500">Facebook account:</span> {post.facebookAccount?.fbUserName || 'N/A'}</div>
          <div><span className="text-gray-500">Created:</span> {new Date(post.createdAt).toLocaleString('vi-VN')}</div>
        </div>
        <div className="mt-4 whitespace-pre-wrap">{post.caption}</div>
        {post.errorMessage && <div className="mt-4 rounded bg-red-50 p-3 text-sm text-red-700">{post.errorMessage}</div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Card 1</h2>
          {renderMedia(post.video1Path, post.card1MediaType)}
          <div className="mt-3 font-medium">{post.card1Title}</div>
          <div className="text-sm text-gray-600">{post.card1Description}</div>
          <div className="text-sm text-blue-600 break-all">{post.card1LinkUrl}</div>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3">Card 2 {post.card2ManagedByAdmin ? '(managed by admin)' : ''}</h2>
          {renderMedia(post.video2Path, post.card2MediaType)}
          <div className="mt-3 font-medium">{post.card2Title}</div>
          <div className="text-sm text-gray-600">{post.card2Description}</div>
          <div className="text-sm text-blue-600 break-all">{post.card2LinkUrl}</div>
        </div>
      </div>

      <div className="flex gap-3">
        {post.status === 'draft' && <button onClick={() => dispatch(publishPost(post.id))} className="px-4 py-2 rounded bg-green-600 text-white text-sm">Publish</button>}
        {post.status === 'failed' && <button onClick={() => dispatch(retryPost(post.id))} className="px-4 py-2 rounded bg-yellow-600 text-white text-sm">Retry</button>}
      </div>
    </div>
  );
};

export default PostDetail;
