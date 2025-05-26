require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const MONDAY_API_URL = "https://api.monday.com/v2";
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

const LEAD_BOARD_ID = 2019233221;
const CAMPAIGN_BOARD_ID = 2019233164;
const STATUS_COLUMN_ID = "color_mkraagvh"; // Column on lead board containing campaign name
const COUNTER_COLUMN_ID = "numeric_mkradsbn"; // Counter column ID on campaign board

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
    console.log('Response',response.data);
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

  // 1. Get the campaign name from the status column in the new lead item
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
  console.log("campaignQuery", campaignQuery);
  const campaignName = leadData?.data?.items?.[0]?.column_values?.[0]?.text;

  if (!campaignName) {
    return res.status(200).send("No campaign selected.");
  }
 
  console.log("Campaign from lead:", campaignName);


  // 2. Find the matching item in the Campaign board using name match
  const findQuery = `
    query ($boardId: ID!, $campaignName: [String]!) {
      items_page_by_column_values (
        limit: 100,
        board_id: $boardId,
        columns: [
          { column_id: "name", column_values: $campaignName }
        ]
      ) {
        items {
          id
          name
          column_values {
            id
            value
            column {
              title
            }
          }
        }
      }
    }
  `;

  const variables = {
    boardId: CAMPAIGN_BOARD_ID,
    campaignName: [campaignName],
  };

  const campaignData = await mondayAPI(findQuery, variables);
  const campaignItems =
    campaignData?.data?.items_page_by_column_values?.items || [];
    console.log(
      "📦 Raw campaign items returned:",
      JSON.stringify(campaignItems, null, 2)
    );


  if (campaignItems.length === 0) {
    console.log("No campaign item matched.");
    return res.status(200).send("Campaign item not found.");
  }

  const matchedItem = campaignItems[0];

  // 🔍 Debug column values
  console.log("Matched item column values:", matchedItem.column_values);

  // 3. Find the counter column in the matched item
  const counterColumn = matchedItem.column_values.find(
    (col) => col.id === COUNTER_COLUMN_ID
  );

  const currentValue = parseInt(
    JSON.parse(counterColumn?.value || "{}")?.number || "0"
  );
  const newValue = currentValue + 1;

  // 4. Update the counter column in the Campaign board
  const updateMutation = `
    mutation {
      change_column_value(
        item_id: ${matchedItem.id},
        board_id: ${CAMPAIGN_BOARD_ID},
        column_id: "${COUNTER_COLUMN_ID}",
        value: "{\"number\": ${newValue}}"
      ) {
        id
      }
    }
  `;
  console.log("updateMutation", updateMutation);
  const updateResult = await mondayAPI(updateMutation);

  if (!updateResult || updateResult.errors) {
    console.error(
      "Failed to update campaign counter:",
      updateResult?.errors
    );
    return res.status(500).send("Failed to update campaign counter.");
  }

  console.log(`Counter for '${campaignName}' updated to ${newValue}`);
  res.status(200).send("Campaign counter updated.");
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
