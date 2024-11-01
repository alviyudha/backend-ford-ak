import express from 'express';
import multer from 'multer';
import path from 'path';
import { createTrims, deleteTrims, getTrims, getTrimsByID, updateTrims } from '../controller/trimControllers.js';
import { verifyUser } from '../middleware/verifyUser.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = express.Router();

const sanitizeFileName = (name) => name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\.]/g, '');

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'imgView') {
      cb(null, 'public/img-view');
    } else if (file.fieldname === 'brochure') {
      cb(null, 'public/brochure');
    } else if (file.fieldname === 'backgroundImg') {
      cb(null, 'public/bg-img-car');
    }
  },
  filename: function (req, file, cb) {
    const baseName = sanitizeFileName(path.basename(file.originalname, path.extname(file.originalname)));
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFilename = `${baseName}-${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, newFilename);
  }
});

const fileFilter = function (req, file, cb) {
  if (file.mimetype === 'application/pdf' && file.fieldname === 'brochure') {
    cb(null, true);
  } else if (file.mimetype.startsWith('image/')) {
    if (file.fieldname === 'backgroundImg' || file.fieldname === 'imgView') {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter
}).fields([{ name: 'backgroundImg', maxCount: 1 }, { name: 'brochure', maxCount: 1 }, { name: 'imgView', maxCount: 1 }]);

router.get('/trims', getTrims);
router.get('/trims/:id', getTrimsByID);
router.post('/trims',verifyUser, upload, createTrims);
router.patch('/trims/:id', upload, updateTrims);
router.delete('/trims/:id',verifyUser,adminOnly, deleteTrims);

export default router;
