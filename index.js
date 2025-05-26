require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const MONDAY_API_URL = "https://api.monday.com/v2";
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

const STATUS_COLUMN_ID = "color_mkraf5e"; // Status column on the Lead board with campaign name

// Webhook endpoint
app.post("/webhook", async (req, res) => {
});

// Test route
app.get("/", (req, res) => {
  res.send("Node app is running.");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Server is running on port ${PORT});
});
