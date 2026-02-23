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

app.get("/api/weather", async (req, res) => {
  const city = req.query.city;

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.API_KEY}`,
    );
    const data = await response.json();

    res.json(data);
    console.log("data:", data);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is Running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Server Running");
});
