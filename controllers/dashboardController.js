import Settings from "../models/Settings.js";

export const getDashboardData = async (req, res) => {
  try {
    const settings = await Settings.findOne();

    if (!settings)
      return res.status(404).json({ error: "Settings not found" });

    res.json({
      irrigationMode: settings.irrigationMode,
      motorStatus: settings.motorStatus,
      temperature: settings.temperature,
      humidity: settings.humidity,
      zones: settings.zones.map((z) => ({
        id: z._id,
        name: z.name,
        soilType: z.soilType,
        cropType: z.cropType,
        threshold: z.threshold,
        valveStatus: z.valveStatus,
        lastSoilMoisture: z.lastSoilMoisture,
      })),
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: error.message });
  }
};



export const switchIrrigationMode = async (req, res) => {
  try {
    const { mode } = req.body;

    if (!["manual", "auto"].includes(mode)) {
      return res.status(400).json({ error: "Mode must be 'manual' or 'auto'" });
    }

    // Find the global settings document
    const settings = await Settings.findOne();
    if (!settings) return res.status(404).json({ error: "Settings not found" });

    // Update irrigation mode
    settings.irrigationMode = mode;

    // Reset all valve & motor status if switching to manual
    // if (mode === "manual") {
    //   settings.motorStatus = false;
    //   settings.zones.forEach((zone) => (zone.valveStatus = false));
    // }

    await settings.save();

    res.json({
      message: `Irrigation mode switched to ${mode.toUpperCase()}`,
      irrigationMode: settings.irrigationMode,
    });
  } catch (err) {
    console.error("Error switching irrigation mode:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const controlValve = async (req, res) => {
  try {
    const { zoneId } = req.params;
    const { status } = req.body; // true or false

    const settings = await Settings.findOne();
    if (!settings) return res.status(404).json({ error: "Settings not found" });

    if (settings.irrigationMode !== "manual") {
      return res.status(403).json({ error: "Manual control is disabled in AUTO mode" });
    }

    const zone = settings.zones.id(zoneId);
    if (!zone) return res.status(404).json({ error: "Zone not found" });

    zone.valveStatus = status;

    // 💡 Motor logic: if any valve ON, motor ON; else motor OFF
    settings.motorStatus = settings.zones.some((z) => z.valveStatus === true);

    await settings.save();

    res.json({
      message: `Valve ${zone.name || zoneId} turned ${status ? "ON" : "OFF"}`,
      motorStatus: settings.motorStatus,
      zones: settings.zones.map((z) => ({
        id: z._id,
        name: z.name,
        valveStatus: z.valveStatus,
      })),
    });
  } catch (err) {
    console.error("Error controlling valve:", err);
    res.status(500).json({ error: "Server error" });
  }
};