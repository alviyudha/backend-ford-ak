import express from 'express'
import {  getColorTrim, getDataDetailByLink, getDataModel, getDropdownData, getMiniSpecTrim, getSpecTrim, getTrimGroupVehicle } from '../controller/joinData.js';


const router = express.Router();

router.get('/allmodel',getDataModel)
router.get('/datadetail/:linkpage',getDataDetailByLink)
router.get('/trimgroup/',getTrimGroupVehicle)
router.get('/dropdownData/',getDropdownData)
router.get('/colortrim/',getColorTrim)
router.get('/minispectrim/',getMiniSpecTrim)
router.get('/spectrim/',getSpecTrim)
export default router