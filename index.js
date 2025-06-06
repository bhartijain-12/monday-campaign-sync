const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Optional: Parse JSON bodies, in case you ever switch to sending data in the body
app.use(express.json());

// app.post('/webhook', (req, res) => {
//   console.log("Query",req.query);
//   // Extract parameters from the query string
//   const { boardId, itemId, userId, columnId } = req.body;

//   console.log('✅ Webhook received with query parameters:',JSON.stringify(req.body));
//   console.log('Board ID:', boardId);
//   console.log('Item ID:', itemId);
//   console.log('User ID:', userId);
//   console.log('Column ID:', columnId);

//   // Optional: Add your logic here to process these values

//   res.status(200).send('Webhook received');
// });
app.post('/webhook', (req, res) => {
  console.log("🔍 Full body:", JSON.stringify(req.body, null, 2));

  // Safely extract values from nested structure
  const inputFields = req.body?.payload?.inputFields || {};
  const { boardId, itemId, userId, columnId } = inputFields;

  console.log('✅ Webhook received with inputFields:');
  console.log('Board ID:', boardId);
  console.log('Item ID:', itemId);
  console.log('User ID:', userId);
  console.log('Column ID:', columnId);

  // Your processing logic here

  res.status(200).send('Webhook received');
});


// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on port ${PORT}`);
});


// require("dotenv").config();
// const express = require("express");
// const axios = require("axios");

// const app = express();
// app.use(express.json());

// const MONDAY_API_URL = "https://api.monday.com/v2";
// const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
// console.log("Using MONDAY_API_TOKEN:", MONDAY_API_TOKEN);

// // Helper for Monday API
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
//     return null;
//   }
// }

// // Webhook route
// app.post("/webhook", async (req, res) => {
//   console.log("📬 Webhook received");
//   console.log("Headers:", JSON.stringify(req.headers, null, 2));
//   console.log("Body:", JSON.stringify(req.body, null, 2));

//   // ✅ Print all query parameters
//   console.log("🔍 Query Parameters Received:");
//   for (const [key, value] of Object.entries(req.query)) {
//     console.log(`🔹 ${key}: ${value}`);
//   }

//   const challenge = req.body?.challenge;
//   if (challenge) return res.status(200).send(req.body);

//   const itemId = req.body?.event?.pulseId || req.query.itemId;
//   if (!itemId) return res.status(400).send("Missing pulse ID.");

//   const userIdFromQuery = req.query.userId;
//   const userEmailFromQuery = req.query.useremail;
//   const boardIdFromQuery = req.query.boardId;

//   if (!userIdFromQuery) return res.status(400).send("Missing userId in query.");
//   if (!userEmailFromQuery) return res.status(400).send("Missing useremail in query.");

//   // Step 1: Get item info
//   const getItemQuery = `
//     query {
//       items(ids: ${itemId}) {
//         name
//         creator {
//           id
//         }
//         board {
//           id
//         }
//       }
//     }
//   `;

//   const data = await mondayAPI(getItemQuery);
//   const item = data?.data?.items?.[0];
//   if (!item) return res.status(404).send("Item not found.");

//   const creatorId = String(item.creator?.id);
//   const requesterId = String(userIdFromQuery);
//   const currentName = item.name || "Unnamed";
//   const boardId = item.board.id;

//   // Step 2: Update item name
//   const safeNewName = `${currentName} - Updated via Webhook`.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
//   const updateNameMutation = `
//     mutation {
//       change_simple_column_value(
//         item_id: ${itemId},
//         board_id: ${boardId},
//         column_id: "name",
//         value: "${safeNewName}"
//       ) {
//         id
//       }
//     }
//   `;

//   const nameResult = await mondayAPI(updateNameMutation);
//   if (nameResult?.errors) {
//     console.error("❌ Failed to update item name:", nameResult.errors);
//     return res.status(500).send("Failed to update item name.");
//   }

//   // Step 3: Update owner email
//   const safeEmail = userEmailFromQuery.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
//   const updateEmailMutation = `
//     mutation {
//       change_simple_column_value(
//         item_id: ${itemId},
//         board_id: ${boardId},
//         column_id: "text_mkrb48t8",
//         value: "${safeEmail}"
//       ) {
//         id
//       }
//     }
//   `;

//   const emailResult = await mondayAPI(updateEmailMutation);
//   if (emailResult?.errors) {
//     console.error("❌ Failed to update owneremail:", emailResult.errors);
//     return res.status(500).send("Failed to update owneremail.");
//   }

//   // Step 4: Add static comment
//   const rawCommentText = `We had a successful kickoff call with Acme Corp on May 27.
// Key takeaways:
// - Project timeline approved (Start: June 3, End: Aug 15)
// - Main POC: Sarah Johnson (sjohnson@acme.com)
// - Requested weekly status reports on Mondays

// Next Steps:
// - Finalize project plan by May 30
// - Assign internal team roles by May 28`;

//   const safeComment = rawCommentText.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");

//   const commentMutation = `
//     mutation {
//       create_update(item_id: ${itemId}, body: "${safeComment}") {
//         id
//       }
//     }
//   `;

//   const commentResult = await mondayAPI(commentMutation);
//   if (commentResult?.errors) {
//     console.error("❌ Failed to add comment:", commentResult.errors);
//     return res.status(500).send("Failed to add comment.");
//   }

//   console.log(`✅ Item ${itemId} updated by user ${requesterId}.`);
//   res.status(200).send("Item updated, owneremail set, and comment added.");
// });

// // Health check
// app.get("/", (req, res) => {
//   res.send("✅ Server is running.");
// });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server listening on port ${PORT}`);
// });
