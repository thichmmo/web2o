const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const createStorage = (subdir) => multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads', subdir);
    ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const safeField = file.fieldname.replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'file';
    const name = safeField === 'logo' ? 'logo' : safeField === 'favicon' ? 'favicon' : safeField;
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|svg|ico/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, svg, ico)'));
  }
};

// Error handler for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds upload limit',
        },
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message,
      },
    });
  }
  next();
};

const mediaFilter = (req, file, cb) => {
  const allowedExt = /\.(jpe?g|png|gif|webp|mp4|mov|avi|webm|ogg)$/i;
  const allowedMime = /^(image\/(jpeg|png|gif|webp)|video\/(mp4|quicktime|x-msvideo|webm|ogg))$/i;
  const extname = allowedExt.test(path.extname(file.originalname));
  const mimetype = allowedMime.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image/video files are allowed'));
};

const uploadBranding = multer({
  storage: createStorage('branding'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter,
});

const uploadPostMedia = multer({
  storage: createStorage('posts'),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: mediaFilter,
});

const uploadCardDefaultMedia = multer({
  storage: createStorage('card-defaults'),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: mediaFilter,
});

module.exports = {
  upload: uploadBranding,
  uploadBranding,
  uploadPostMedia,
  uploadCardDefaultMedia,
  handleUploadError,
};
