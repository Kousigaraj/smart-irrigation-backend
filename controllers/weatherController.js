import Settings from "../models/Settings.js";

export const getWeatherForecast = async (req, res) => {
  try {
    // 1️⃣ Get settings from DB
    const settings = await Settings.findOne();
    if (!settings) {
      return res.status(404).json({ error: "Weather settings not configured" });
    }

    const { city, openWeatherApiKey } = settings;

    // 2️⃣ Get coordinates using Geocoding API
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${city.toLowerCase()}&limit=1&appid=${openWeatherApiKey}`
    );
    const geoData = await geoRes.json();
    if (!geoData.length)
      return res.status(404).json({ error: "City not found" });

    const { lat, lon } = geoData[0];

    // 3️⃣ Fetch 5-day forecast data
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${openWeatherApiKey}`
    );
    const forecastData = await forecastRes.json();

    if (!forecastData.list) {
      return res.status(500).json({ error: "Invalid forecast data received" });
    }

    // 4️⃣ Check for rain (pop > 0.3) in tomorrow’s forecasts
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    const tomorrowForecasts = forecastData.list.filter((item) => {
      const forecastDate = new Date(item.dt_txt);
      return forecastDate.getDate() === tomorrow.getDate();
    });

    // If any forecast has rain probability > 0.3, mark pop = true
    const rainTomorrow = tomorrowForecasts.some(
      (item) => item.pop && item.pop > 0.3
    );

    // 5️⃣ Update Settings DB
    settings.pop = rainTomorrow; // true if rain expected, else false
    await settings.save();

    // 6️⃣ Return forecast and update status
    res.json({
      city,
      coordinates: { lat, lon },
      rainTomorrow,
      forecast: forecastData.list,
    });
  } catch (error) {
    console.error("Weather API error:", error);
    res.status(500).json({ error: error.message });
  }
};
