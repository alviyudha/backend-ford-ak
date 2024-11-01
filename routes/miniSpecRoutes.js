import express from 'express'
import multer from 'multer';
import path from 'path'
import { createMiniSpec, deleteMiniSpec, getMiniSpec, getMiniSpecById, getMiniSpecByTrimId, updateMiniSpec } from '../controller/miniSpecController.js';
import { verifyUser } from '../middleware/verifyUser.js';
import { adminOnly } from '../middleware/adminOnly.js';


const router = express.Router();

const sanitizeFileName = (name) => name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\.]/g, '');

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img-minispec');
  },
  filename: function (req, file, cb) {
    const baseName = sanitizeFileName(path.basename(file.originalname, path.extname(file.originalname)));
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFilename = `${baseName}-${uniqueSuffix}${path.extname(file.originalname)}`;
    cb(null, newFilename);
  }
});

const fileFilter = function (req, file, cb) {
  
  if (file.mimetype.startsWith('image/') && file.fieldname === 'imgMiniSpec') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({
  storage: fileStorage,
  fileFilter: fileFilter
}).single('imgMiniSpec');

router.get('/minispec',getMiniSpec)
router.get('/minispec/:id',getMiniSpecById)
router.get('/minispec/trimid/:trimid',getMiniSpecByTrimId)
router.post('/minispec',verifyUser,upload,createMiniSpec)
router.patch('/minispec/:id',verifyUser,upload,updateMiniSpec)
router.delete('/minispec/:id',verifyUser,adminOnly,deleteMiniSpec)

export default router