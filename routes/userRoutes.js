import express from 'express'
import { createUser, deleteUser, getUser, getUserByCUID, updateUser } from '../controller/UserControllers.js';
import { verifyUser } from '../middleware/verifyUser.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = express.Router();


router.get('/user',verifyUser,adminOnly,getUser)
router.get('/user/:cuid',verifyUser,adminOnly,getUserByCUID)
router.post('/user',verifyUser,adminOnly,createUser)
router.patch('/user/:cuid',verifyUser,adminOnly,updateUser)
router.delete('/user/:cuid',verifyUser,adminOnly,deleteUser)




export default router;