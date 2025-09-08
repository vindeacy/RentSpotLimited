import multer from 'multer';
import path from 'path';

// Set storage engine for tenant docs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Set storage engine for property images
const propertyImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'PropertyImages'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter (optional, e.g., only images)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Export multer upload middlewares
export const upload = multer({ storage, fileFilter }); // for tenant docs
export const uploadPropertyImage = multer({ storage: propertyImageStorage, fileFilter }); // for property images