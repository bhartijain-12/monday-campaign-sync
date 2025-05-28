require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const MONDAY_API_URL = "https://api.monday.com/v2";
const MONDAY_API_TOKEN = process.env.MONDAY_API_TOKEN;
console.log("Using MONDAY_API_TOKEN:", MONDAY_API_TOKEN);

// Helper for Monday API
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
  console.log("📬 Webhook received");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  console.log("Body:", JSON.stringify(req.body, null, 2));
  for (const [key, value) of Object.entries(req.query)) {
  console.log(${key}; $(value}');

}

  const challenge = req.body?.challenge;
  if (challenge) return res.status(200).send(req.body);

  const itemId = req.body?.event?.pulseId;
  if (!itemId) return res.status(400).send("Missing pulse ID.");

  const userIdFromQuery = req.query.userId;
  const userEmailFromQuery = req.query.useremail;

  if (!userIdFromQuery) return res.status(400).send("Missing userId in query.");
  if (!userEmailFromQuery) return res.status(400).send("Missing useremail in query.");

  // Step 1: Get item info
  const getItemQuery = `
    query {
      items(ids: ${itemId}) {
        name
        creator {
          id
        }
        board {
          id
        }
      }
    }
  `;

  const data = await mondayAPI(getItemQuery);
  const item = data?.data?.items?.[0];
  if (!item) return res.status(404).send("Item not found.");

  const creatorId = String(item.creator?.id);
  const requesterId = String(userIdFromQuery);
  const currentName = item.name || "Unnamed";
  const boardId = item.board.id;

  // Step 2: Update item name
  const safeNewName = `${currentName} - Updated via Webhook`.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const updateNameMutation = `
    mutation {
      change_simple_column_value(
        item_id: ${itemId},
        board_id: ${boardId},
        column_id: "name",
        value: "${safeNewName}"
      ) {
        id
      }
    }
  `;

  const nameResult = await mondayAPI(updateNameMutation);
  if (nameResult?.errors) {
    console.error("❌ Failed to update item name:", nameResult.errors);
    return res.status(500).send("Failed to update item name.");
  }

  // Step 3: Update owner email
  const safeEmail = userEmailFromQuery.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const updateEmailMutation = `
    mutation {
      change_simple_column_value(
        item_id: ${itemId},
        board_id: ${boardId},
        column_id: "text_mkrb48t8",
        value: "${safeEmail}"
      ) {
        id
      }
    }
  `;

  const emailResult = await mondayAPI(updateEmailMutation);
  if (emailResult?.errors) {
    console.error("❌ Failed to update owneremail:", emailResult.errors);
    return res.status(500).send("Failed to update owneremail.");
  }

  // Step 4: Add static comment
  const rawCommentText = `We had a successful kickoff call with Acme Corp on May 27.
Key takeaways:
- Project timeline approved (Start: June 3, End: Aug 15)
- Main POC: Sarah Johnson (sjohnson@acme.com)
- Requested weekly status reports on Mondays

Next Steps:
- Finalize project plan by May 30
- Assign internal team roles by May 28`;

  const safeComment = rawCommentText.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");

  const commentMutation = `
    mutation {
      create_update(item_id: ${itemId}, body: "${safeComment}") {
        id
      }
    }
  `;

  const commentResult = await mondayAPI(commentMutation);
  if (commentResult?.errors) {
    console.error("❌ Failed to add comment:", commentResult.errors);
    return res.status(500).send("Failed to add comment.");
  }

  console.log(`✅ Item ${itemId} updated by user ${requesterId}.`);
  res.status(200).send("Item updated, owneremail set, and comment added.");
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ Server is running.");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
