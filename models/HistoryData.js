import mongoose from "mongoose";

const historyZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  soilMoisture: { type: Number, default: 0, min: 0, max: 100 },
});

const historySchema = new mongoose.Schema({
  temperature: { 
    type: Number, 
    default: 0 
  },
  humidity: { 
    type: Number, 
    default: 0 
  },
  zones: { 
    type: [historyZoneSchema], 
    default: [] 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
  },
});

historySchema.statics.trimHistory = async function() {
  const count = await this.countDocuments();
  if (count > 10) {
    const oldest = await this.find().sort({ createdAt: 1 }).limit(count - 10);
    const idsToDelete = oldest.map(doc => doc._id);
    await this.deleteMany({ _id: { $in: idsToDelete } });
  }
};

export default mongoose.model("History", historySchema);