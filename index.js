import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import connectDB from "./config/db.js";

// Routes
import settingsRoutes from "./routes/settingsRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import iotRoutes from "./routes/IotRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Database
connectDB();

// Routes
app.use("/api/settings", settingsRoutes);
app.use("/api/weather", weatherRoutes);  
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/history", historyRoutes)
app.use("/api/iot", iotRoutes);


// Default route
app.get("/", (req, res) => {
  res.send("IoT Irrigation Backend Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server started at http://localhost:" + PORT);
});
