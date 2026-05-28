const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticate = require('../middleware/authenticate');
const { uploadPostMedia, handleUploadError } = require('../middleware/upload');

// All routes require authentication
router.use(authenticate);

router.post(
  '/',
  uploadPostMedia.fields([
    { name: 'card1Media', maxCount: 1 },
    { name: 'card2Media', maxCount: 1 },
    { name: 'video1', maxCount: 1 },
    { name: 'video2', maxCount: 1 },
  ]),
  handleUploadError,
  postController.createPost
);

router.get('/', postController.getPosts);
router.get('/:postId', postController.getPost);
router.put(
  '/:postId',
  uploadPostMedia.fields([
    { name: 'card1Media', maxCount: 1 },
    { name: 'card2Media', maxCount: 1 },
    { name: 'video1', maxCount: 1 },
    { name: 'video2', maxCount: 1 },
  ]),
  handleUploadError,
  postController.updatePost
);
router.post('/:postId/publish', postController.publishPost);
router.post('/:postId/retry', postController.retryPost);
router.delete('/:postId', postController.deletePost);

module.exports = router;
