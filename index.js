require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const MONDAY_API_URL = "https://api.monday.com/v2";
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

// Helper to call monday.com API
async function mondayAPI(query, variables = {}) {
  try {
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
    return response.data;
  } catch (error) {
    console.error("Monday API error:", error.response?.data || error.message);
    return null;
  }
}

// Webhook handler: update item name
app.post("/webhook", async (req, res) => {
  console.log("📬 Webhook received");

  const itemId = req.body?.event?.pulseId;
  if (!itemId) return res.status(400).send("Missing pulse ID.");

  // Step 1: Get current name
  const getNameQuery = `
    query {
      items(ids: ${itemId}) {
        name
      }
    }
  `;
  const data = await mondayAPI(getNameQuery);
  const currentName = data?.data?.items?.[0]?.name || "Unnamed";

  // Step 2: Update name column with static string
  const newName = `${currentName} - Updated via Webhook`;
  const updateNameMutation = `
    mutation {
      change_simple_column_value(
        item_id: ${itemId},
        column_id: "name",
        value: "${newName.replace(/"/g, '\\"')}"
      ) {
        id
      }
    }
  `;
  const updateResult = await mondayAPI(updateNameMutation);

  if (updateResult?.errors) {
    console.error("❌ Failed to update item name:", updateResult.errors);
    return res.status(500).send("Error updating item name.");
  }

  console.log(`✅ Updated item ${itemId} name to: ${newName}`);
  res.status(200).send("Item name updated.");
});

// Health check
app.get("/", (req, res) => {
  res.send("Server is running.");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
