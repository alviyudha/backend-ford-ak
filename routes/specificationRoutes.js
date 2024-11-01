import express from 'express'
import { createSpecification, deleteSpecification, getSpecification, getSpecificationByID, updateSpecification } from '../controller/specificationControllers.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { verifyUser } from '../middleware/verifyUser.js';

const router = express.Router();



router.get('/spec',getSpecification)
router.get('/spec/:id',getSpecificationByID)
router.post('/spec',verifyUser,createSpecification)
router.patch('/spec/:id',verifyUser,updateSpecification)
router.delete('/spec/:id',verifyUser,adminOnly,deleteSpecification)
export default router