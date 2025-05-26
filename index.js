require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const MONDAY_API_URL = "https://api.monday.com/v2";
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

// Helper function for monday.com API
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

// Webhook route
app.post("/webhook", async (req, res) => {
  console.log("📬 Webhook received Monday Romil" + req.body);

  const itemId = req.body?.event?.pulseId;
  if (!itemId) return res.status(400).send("Missing pulse ID.");

  // 1. Fetch item name and board_id
  const getItemQuery = `
    query {
      items(ids: ${itemId}) {
        name
        board {
          id
        }
      }
    }
  `;

  const data = await mondayAPI(getItemQuery);
  const item = data?.data?.items?.[0];

  if (!item) return res.status(404).send("Item not found.");

  const currentName = item.name || "Unnamed";
  const boardId = item.board.id;

  // 2. Update item name
  const newName = `${currentName} - Updated via Webhook`;

  const updateMutation = `
    mutation {
      change_simple_column_value(
        item_id: ${itemId},
        board_id: ${boardId},
        column_id: "name",
        value: "${newName.replace(/"/g, '\\"')}"
      ) {
        id
      }
    }
  `;

  const updateResult = await mondayAPI(updateMutation);

  if (updateResult?.errors) {
    console.error("❌ Failed to update item name:", updateResult.errors);
    return res.status(500).send("Failed to update item name.");
  }

  console.log(`✅ Item ${itemId} updated to: ${newName}`);
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
