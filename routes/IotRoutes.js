import express from "express";
import { getControlData, updateData } from "../controllers/IotController.js";

const router = express.Router();

router.post("/data", updateData);
router.get("/control", getControlData);


export default router;