import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "../frontend")));

// Get geo-coding
app.get("/api/geocoding", async (req, res) => {
  const city = req.query.city;
  const country = req.query.country;

  try {
    const response = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=5&appid=${process.env.API_KEY}`,
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Cant't connect to server" });
  }
});

// Get weather by lat & lon
app.get("/api/weather", async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}`,
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Cant't connect to server" });
  }
});

// Get forecast

app.get("/api/forecast", async (req, res) => {
  const lat = req.query.lat;
  const lon = req.query.lon;

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${process.env.API_KEY}`,
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
    console.log(data);
  } catch (error) {
    res.status(500).json({ error: "Cant't connect to server" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is Running on http://localhost:${PORT}`);
});
