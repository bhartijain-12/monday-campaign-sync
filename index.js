require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const MONDAY_API_URL = "https://api.monday.com/v2";
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

const STATUS_COLUMN_ID = "color_mkraf5e"; // Status column on the Lead board with campaign name

// Helper to call Monday API
async function mondayAPI(query, variables = {}) {
  try {
    console.log("query", { query, variables });
    const response = await axios.post(
      MONDAY_API_URL,
      { query, variables },
      {
        headers: {
          Authorization: MONDAY_API_TOKEN,
          "Content-Type": "application/json",
        },
      }
    );
    console.log('Response', response.data);
    return response.data;
  } catch (error) {
    console.error("Monday API error:", error.response?.data || error.message);
    return null;
  }
}

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  console.log("📬 Webhook received:", JSON.stringify(req.body));

  const leadItemId = req.body?.event?.pulseId;
  if (!leadItemId) return res.status(400).send("Missing pulse ID.");

  // ✅ 1. Get the campaign name from the status column
  const campaignQuery = `
    query {
      items(ids: ${leadItemId}) {
        column_values(ids: ["${STATUS_COLUMN_ID}"]) {
          text
        }
      }
    }
  `;
  const leadData = await mondayAPI(campaignQuery);
  const campaignName = leadData?.data?.items?.[0]?.column_values?.[0]?.text;

  if (!campaignName) {
    return res.status(200).send("No campaign selected.");
  }

  console.log("Campaign from lead:", campaignName);
  res.status(200).send(Campaign name retrieved: ${campaignName});
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
