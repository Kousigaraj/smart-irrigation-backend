import Settings from "../models/Settings.js";
import History from "../models/HistoryData.js";

// POST Sensor Data (from ESP32)
export const updateData = async (req, res) => {
  try {
    const { temperature, humidity, soil1, soil2 } = req.body;

    // Validate data
    if (temperature == null || humidity == null || soil1 == null || soil2 == null)
      return res.status(400).json({ error: "Missing sensor data" });

    // Get system settings
    const settings = await Settings.findOne();
    if (!settings) return res.status(404).json({ error: "Settings not found" });

    // ✅ Soil values already in percentage (0–100)
    const soilPercent1 = Math.min(Math.max(soil1, 0), 100);
    const soilPercent2 = Math.min(Math.max(soil2, 0), 100);

    // ✅ Update environment
    settings.temperature = temperature;
    settings.humidity = humidity;
    settings.updatedAt = new Date();

    // ✅ Update latest soil moisture for each zone
    if (settings.zones.length > 0) settings.zones[0].lastSoilMoisture = soilPercent1;
    if (settings.zones.length > 1) settings.zones[1].lastSoilMoisture = soilPercent2;

    // ===== AUTO MODE LOGIC =====
    if (settings.irrigationMode === "auto" && settings.pop === false) {
      let anyDry = false;
      settings.zones.forEach((zone) => {
        if (zone.lastSoilMoisture < zone.threshold) {
          zone.valveStatus = true;
          anyDry = true;
        } else {
          zone.valveStatus = false;
        }
      });
      settings.motorStatus = anyDry;
    } else if (settings.irrigationMode === "manual") {
      // Manual mode → keep user control
    } else {
      settings.zones.forEach((zone) => (zone.valveStatus = false));
      settings.motorStatus = false;
    }

    await settings.save();

    // ✅ Create new history record
    const newHistory = new History({
      temperature,
      humidity,
      zones: [
        { name: settings.zones[0]?.name || "Zone 1", soilMoisture: soilPercent1 },
        { name: settings.zones[1]?.name || "Zone 2", soilMoisture: soilPercent2 },
      ],
      updatedAt: new Date(),
    });

    await newHistory.save();

    // ✅ Keep only last 10 history entries
    const count = await History.countDocuments();
    if (count > 10) {
      const oldRecords = await History.find().sort({ updatedAt: 1 }).limit(count - 10);
      const idsToDelete = oldRecords.map((doc) => doc._id);
      await History.deleteMany({ _id: { $in: idsToDelete } });
    }

    console.log("Data received and stored from ESP32:", req.body);
    res.json({ message: "Sensor data and history updated successfully" });
  } catch (err) {
    console.error("POST /api/iot/data error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// GET Motor & Valve Control
export const getControlData = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings) return res.status(404).json({ error: "Settings not found" });

    const control = {
      motor: settings.motorStatus || false,
      valve1: settings.zones[0]?.valveStatus || false,
      valve2: settings.zones[1]?.valveStatus || false,
    };

    res.json(control);
  } catch (err) {
    console.error("GET /api/control error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
