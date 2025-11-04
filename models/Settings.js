import mongoose from "mongoose";

const zoneSchema = new mongoose.Schema({
  name: String,
  soilType: String,
  cropType: String,
  threshold: { type: Number, default: 30 },
  valveStatus: { type: Boolean, default: false },
  lastSoilMoisture: { type: Number, default: 0 },
});

const settingsSchema = new mongoose.Schema({
  city: String,
  openWeatherApiKey: String,

  // System configuration
  irrigationMode: { 
    type: String, 
    enum: ["auto", "manual"], 
    default: "auto" 
  },

  // Real-time environment data
  temperature: { type: Number, default: 0 },
  humidity: { type: Number, default: 0 },

  // Global motor status
  motorStatus: { type: Boolean, default: false },
  pop: {type: Boolean, default: false },

  zones: [zoneSchema],

  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Settings", settingsSchema);
