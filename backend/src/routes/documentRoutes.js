const express = require('express');
const multer = require('multer');
const protect = require('../middleware/authMiddleware');
const {
  explainDocument,
  getDocuments,
  getDocumentById,
} = require('../controllers/documentController');

const router = express.Router();

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error('INVALID_FILE_TYPE'));
  },
});

router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocumentById);

router.post('/explain', protect, (req, res) => {
  // req.userId is set by protect (JWT auth middleware)
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'Image is too large. Maximum size is 10 MB.',
        });
      }

      if (err.message === 'INVALID_FILE_TYPE') {
        return res.status(400).json({
          error: 'Invalid file type. Upload a JPG, JPEG, PNG or WebP image.',
        });
      }

      return res.status(400).json({
        error: 'Could not process the uploaded image.',
      });
    }

    return explainDocument(req, res);
  });
});

module.exports = router;
