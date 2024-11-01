import express from 'express'
import { createVehicles, deleteVehicle, getVehicle, getVehiclebyId, updateVehicle } from '../controller/vehicleControllers.js';
import { verifyUser } from '../middleware/verifyUser.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = express.Router();

router.get('/vehicle',getVehicle)
router.get('/vehicle/:id',getVehiclebyId)
router.post('/vehicle',verifyUser,createVehicles)
router.patch('/vehicle/:id',updateVehicle)
router.delete('/vehicle/:id',verifyUser,adminOnly,deleteVehicle)
router.get('/test', (req, res) => {
    res.status(200).json({
        message: 'api berhasil',
    });
});





export default router;