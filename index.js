require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const MONDAY_API_URL = "https://api.monday.com/v2";
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

const LEAD_BOARD_ID = 2019398172;

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  console.log("📬 Webhook received:", JSON.stringify(req.body));
});

// Test route
app.get("/", (req, res) => {
  res.send("Node app is running.");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
