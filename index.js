// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");

// const app = express();
// app.use(express.json());

// const MONDAY_API_URL = "https://api.monday.com/v2";
// const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

// // Helper to call Monday API
// async function mondayAPI(query, variables = {}) {
//   try {
//     const response = await axios.post(
//       MONDAY_API_URL,
//       { query, variables },
//       {
//         headers: {
//           Authorization: MONDAY_API_TOKEN,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("Monday API error:", error.response?.data || error.message);
//   }
// }

// // Helper: Add label to status column if it doesn't already exist
// async function addCampaignAsLabel(campaignName) {
//   const leadBoardId = 1991449947;
//   const statusColumnId = "color_mkr326nz";

//   // Step 1: Get current labels
//   const query = `
//     query {
//       boards(ids: ${leadBoardId}) {
//         columns(ids: ["${statusColumnId}"]) {
//           settings_str
//         }
//       }
//     }
//   `;

//   const response = await mondayAPI(query);
//   const settingsStr = response?.data?.boards?.[0]?.columns?.[0]?.settings_str;

//   if (!settingsStr) {
//     console.error("Could not fetch column settings");
//     return;
//   }

//   const settings = JSON.parse(settingsStr);
//   const labels = settings.labels || {};

//   // Check if campaignName already exists
//   const labelExists = Object.values(labels).includes(campaignName);
//   if (labelExists) {
//     console.log("Label already exists:", campaignName);
//     return;
//   }

//   // Step 2: Add new label
//   const newKey = Object.keys(labels).length.toString(); // next index
//   labels[newKey] = campaignName;

//   const newSettingsStr = JSON.stringify({ labels });

//   const mutation = `
//     mutation {
//        change_column_metadata(
//         board_id: ${leadBoardId},
//         column_id: "${statusColumnId}",
//         settings_str: "${newSettingsStr.replace(/"/g, '\\"')}"
//       ) {
//         id
//       }
//     }
//   `;

//   await mondayAPI(mutation);
//   console.log("✅ Added new label:", campaignName);
// }

// // Simple GET route for testing server is alive
// app.get("/", (req, res) => {
//   res.send("Server is up and running!");
// });

// Webhook endpoint — Monday will POST here when a new campaign is added
// app.post("/webhook", async (req, res) => {
//   console.log("Webhook payload:", JSON.stringify(req.body));

//   const itemName = req.body?.event?.value?.name;

//   if (!itemName) {
//     return res.status(400).send("No item name found in webhook");
//   }

//   console.log("📬 New campaign created:", itemName);

//   await addCampaignAsLabel(itemName);

//   res.status(200).send("Label synced");
// });

// // Start server with dynamic port for Render
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log("🚀 Server running on port", PORT);
// });




// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");

// const app = express();
// app.use(express.json());

// const MONDAY_API_URL = "https://api.monday.com/v2";
// const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

// // Helper to call Monday API
// async function mondayAPI(query, variables = {}) {
//   try {
//     const response = await axios.post(
//       MONDAY_API_URL,
//       { query, variables },
//       {
//         headers: {
//           Authorization: MONDAY_API_TOKEN,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error(
//       "❌ Monday API error:",
//       error.response?.data || error.message
//     );
//   }
// }

// // Helper: Add label to status column if it doesn't already exist
// async function addCampaignAsLabel(campaignName) {
//   const leadBoardId = 2019233221;
//   const statusColumnId = "color_mkra9se9";

//   const query = `
//     query {
//       boards(ids: ${leadBoardId}) {
//         columns(ids: ["${statusColumnId}"]) {

//           settings_str
//         }
//       }
//     }
//   `;

//   const response = await mondayAPI(query);
//   const settingsStr = response?.data?.boards?.[0]?.columns?.[0]?.settings_str;

//   if (!settingsStr) {
//     console.error("❌ Could not fetch column settings");
//     return;
//   }

//   const settings = JSON.parse(settingsStr);
//   const labels = settings.labels || {};

//   const labelExists = Object.values(labels).includes(campaignName);
//   if (labelExists) {
//     console.log("⚠️ Label already exists:", campaignName);
//     return;
//   }

//   const newKey = Object.keys(labels).length.toString();
//   labels[newKey] = campaignName;

//   const newSettingsStr = JSON.stringify({ labels });

//   // const mutation = `
//   //   mutation {
//   //     change_column_metadata(
//   //       board_id: ${leadBoardId},
//   //       column_id: "${statusColumnId}",
//   //        settings_str: "${newSettingsStr.replace(/"/g, '\\"')}"
         
//   //     ) {
//   //       id
//   //     }
//   //   }
//   // `;



//   const mutation = `
//   mutation {
//     change_column_metadata(
//       board_id: ${leadBoardId},
//       column_id: "${statusColumnId}",
//       column_metadata: {
//         labels: ${JSON.stringify(labels).replace(/"([^"]+)":/g, "$1:")}
//       }
//     ) {
//       id
//     }
//   }
// `;


//   //   await mondayAPI(mutation);
//   //   console.log("✅ Added new label:", campaignName);
//   // }

//   const mutationResponse = await mondayAPI(mutation);
//   console.log(
//     "🟢 Mutation response:",
//     JSON.stringify(mutationResponse, null, 2)
//   );
//   console.log("✅ Added new label:", campaignName);
// }

// // Root route (test)
// app.get("/", (req, res) => {
//   res.send("✅ Server is running on Render!");
// });

// // Webhook endpoint for Monday automation
// // app.post("/webhook", async (req, res) => {
// //   console.log("📬 Webhook received:", JSON.stringify(req.body));

// //   const itemName = req.body?.event?.value?.name || "Unnamed";

// //   if (!itemName || itemName === "Unnamed") {
// //     return res.status(200).send("⚠️ Test webhook received. No item name.");
// //   }

// //   console.log("📢 New campaign detected:", itemName);
// //   await addCampaignAsLabel(itemName);

// //   res.status(200).send("✅ Label synced");
// // });

// app.post("/webhook", async (req, res) => {
//   console.log("📬 Webhook received:", JSON.stringify(req.body));

//   // ✅ Respond to Monday's webhook verification challenge
//   if (req.body.challenge) {
//     console.log("🔐 Responding to challenge:", req.body.challenge);
//     return res.status(200).send(req.body);
//   }

//   // ✅ Process real event data
//   const itemName = req.body?.event?.pulseName || "Unnamed";


//   if (!itemName || itemName === "Unnamed") {
//     return res.status(200).send("⚠️ No item name found.");
//   }

//   console.log("📢 New campaign detected:", itemName);
//   await addCampaignAsLabel(itemName);

//   res.status(200).send("✅ Label synced");
// });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });



require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const MONDAY_API_URL = "https://api.monday.com/v2";
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

const LEAD_BOARD_ID = 2019233221;
const CAMPAIGN_BOARD_ID = 2019233164;
const STATUS_COLUMN_ID = "color_mkra9se9"; // column on lead board containing campaign name
const COUNTER_COLUMN_ID = "numeric_mkradsbn"; // counter column ID on campaign board (replace if needed)

// Helper to call Monday API
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
    console.error(
      "❌ Monday API error:",
      error.response?.data || error.message
    );
    return null;
  }
}

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  console.log("📬 Webhook received:", JSON.stringify(req.body));

  const leadItemId = req.body?.event?.pulseId;
  if (!leadItemId) return res.status(400).send("❌ Missing pulse ID.");

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
  const campaignName = leadData?.data?.items?.[0]?.column_values?.[0]?.text;

  if (!campaignName) {
    return res.status(200).send("⚠️ No campaign selected.");
  }

  console.log("🎯 Campaign from lead:", campaignName);

  // 2. Find the matching item in the Campaign board
  const findQuery = `
    query {
      boards(ids: ${CAMPAIGN_BOARD_ID}) {
        items {
          id
          name
          column_values(ids: ["${COUNTER_COLUMN_ID}"]) {
            id
            value
          }
        }
      }
    }
  `;
  const campaignData = await mondayAPI(findQuery);
  const campaignItems = campaignData?.data?.boards?.[0]?.items || [];

  const matchedItem = campaignItems.find((item) => item.name === campaignName);

  if (!matchedItem) {
    console.log("❌ No campaign item matched.");
    return res.status(200).send("⚠️ Campaign item not found.");
  }

  const currentValue = parseInt(
    JSON.parse(matchedItem.column_values[0]?.value || "{}")?.text || "0"
  );
  const newValue = currentValue + 1;

  // 3. Update the counter column in the Campaign board
  const updateMutation = `
    mutation {
      change_column_value(
        item_id: ${matchedItem.id},
        board_id: ${CAMPAIGN_BOARD_ID},
        column_id: "${COUNTER_COLUMN_ID}",
        value: "${newValue}"
      ) {
        id
      }
    }
  `;
  await mondayAPI(updateMutation);

  console.log(`✅ Counter for '${campaignName}' updated to ${newValue}`);
  res.status(200).send("✅ Campaign counter updated.");
});

// Test route
app.get("/", (req, res) => {
  res.send("✅ Node app is running.");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

