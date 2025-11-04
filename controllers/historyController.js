import History from "../models/HistoryData.js";

export const getHistory = async (req, res) => {
  try {
    // Get the last 10 readings (latest first)
    const historyData = await History.find()
      .sort({ createdAt: -1 }) // Newest first
      .limit(10);

    if (!historyData || historyData.length === 0) {
      return res.status(404).json({ message: "No history data found" });
    }

    res.status(200).json(historyData);
  } catch (error) {
    console.error("Error fetching history data:", error);
    res.status(500).json({ error: "Server error while fetching history data" });
  }
};




