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



require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const MONDAY_API_URL = "https://api.monday.com/v2";
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;

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
  }
}

// Helper: Add label to status column if it doesn't already exist
async function addCampaignAsLabel(campaignName) {
  const leadBoardId = 1991449947;
  const statusColumnId = "color_mkr326nz";

  const query = `
    query {
      boards(ids: ${leadBoardId}) {
        columns(ids: ["${statusColumnId}"]) {

          settings_str
        }
      }
    }
  `;

  const response = await mondayAPI(query);
  const settingsStr = response?.data?.boards?.[0]?.columns?.[0]?.settings_str;

  if (!settingsStr) {
    console.error("❌ Could not fetch column settings");
    return;
  }

  const settings = JSON.parse(settingsStr);
  const labels = settings.labels || {};

  const labelExists = Object.values(labels).includes(campaignName);
  if (labelExists) {
    console.log("⚠️ Label already exists:", campaignName);
    return;
  }

  const newKey = Object.keys(labels).length.toString();
  labels[newKey] = campaignName;

  const newSettingsStr = JSON.stringify({ labels });

  const mutation = `
    mutation {
      change_column_metadata(
        board_id: ${leadBoardId},
        column_id: "${statusColumnId}",
         
      ) {
        id
      }
    }
  `;

  await mondayAPI(mutation);
  console.log("✅ Added new label:", campaignName);
}

// Root route (test)
app.get("/", (req, res) => {
  res.send("✅ Server is running on Render!");
});

// Webhook endpoint for Monday automation
// app.post("/webhook", async (req, res) => {
//   console.log("📬 Webhook received:", JSON.stringify(req.body));

//   const itemName = req.body?.event?.value?.name || "Unnamed";

//   if (!itemName || itemName === "Unnamed") {
//     return res.status(200).send("⚠️ Test webhook received. No item name.");
//   }

//   console.log("📢 New campaign detected:", itemName);
//   await addCampaignAsLabel(itemName);

//   res.status(200).send("✅ Label synced");
// });

app.post("/webhook", async (req, res) => {
  console.log("📬 Webhook received:", JSON.stringify(req.body));

  // ✅ Respond to Monday's webhook verification challenge
  if (req.body.challenge) {
    console.log("🔐 Responding to challenge:", req.body.challenge);
    return res.status(200).send(req.body);
  }

  // ✅ Process real event data
  const itemName = req.body?.event?.value?.name || "Unnamed";

  if (!itemName || itemName === "Unnamed") {
    return res.status(200).send("⚠️ No item name found.");
  }

  console.log("📢 New campaign detected:", itemName);
  await addCampaignAsLabel(itemName);

  res.status(200).send("✅ Label synced");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



// settings_str: "${newSettingsStr.replace(/"/g, '\\"')}"