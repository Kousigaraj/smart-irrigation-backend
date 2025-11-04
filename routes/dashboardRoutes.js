import express from "express";
import { controlValve, getDashboardData, switchIrrigationMode } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/data", getDashboardData);

router.post("/mode-control", switchIrrigationMode);

router.post("/valve/:zoneId", controlValve);

export default router;