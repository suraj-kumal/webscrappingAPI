const express = require("express");
const cors = require("cors");
const { scrapeMultipleSites } = require("./main");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

//routes
app.get("/api/v1/status", (req, res) => {
  res.json({
    status: "online",
    message: "Scraper API is running",
  });
});

app.get("/api/v1/laptop/:name", async (req, res) => {
  try {
    const laptopName = req.params.name;
    console.log(`API: Searching for laptop "${laptopName}"`);

    const results = await scrapeMultipleSites(laptopName);

    res.json(results);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested endpoint does not exist",
  });
});

app.listen(PORT, () => {
  console.log(`scraper API running on port ${PORT}`);
});
