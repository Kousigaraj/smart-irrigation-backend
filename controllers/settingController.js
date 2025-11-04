import Settings from "../models/Settings.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { city, openWeatherApiKey, zones } = req.body;

    const settings = await Settings.findOneAndUpdate(
      {},
      { city, openWeatherApiKey, zones },
      { upsert: true, new: true }
    );

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
