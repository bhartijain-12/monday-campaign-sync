require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const MONDAY_API_URL = "https://api.monday.com/v2";
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

const LEAD_BOARD_ID = 2019398172;
const STATUS_COLUMN_ID = "color_mkraagvh"; // Column on lead board containing campaign name
const COUNTER_COLUMN_ID = "numeric_mkradsbn"; // Counter column ID on campaign board

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  console.log("📬 Webhook received:", JSON.stringify(req.body));
});
