const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// This will come from Render later
const GHL_ACCOUNT_B_API_KEY = process.env.GHL_ACCOUNT_B_API_KEY;

// Health check
app.get("/", (req, res) => {
  res.send("GHL Contact Mover is running ✅");
});

// GoHighLevel will send new contacts here
app.post("/ghl-webhook", async (req, res) => {
  try {
    const contact = req.body;

    console.log("Incoming contact:", contact);

    if (!contact || (!contact.email && !contact.phone)) {
      return res.status(400).json({
        error: "Contact must have at least email or phone"
      });
    }

    const payloadForB = {
      firstName: contact.firstName || contact.name || "",
      email: contact.email || "",
      phone: contact.phone || ""
    };

    await axios.post(
      "https://rest.gohighlevel.com/v1/contacts/",
      payloadForB,
      {
        headers: {
          Authorization: `Bearer ${GHL_ACCOUNT_B_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return res.status(200).json({
      message: "Contact sent to Account B successfully"
    });
  } catch (err) {
    console.error("Error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Something went wrong"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
