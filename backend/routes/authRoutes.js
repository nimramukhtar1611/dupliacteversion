// routes/auth.js
import express from "express";
import dotenv from "dotenv";
import Client from "../models/Client.js";

dotenv.config();
const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;

    // check client
    const client = await Client.findOne({ name });
    if (!client) return res.status(400).json({ message: "Client not found" });

    if (client.password !== password)
      return res.status(400).json({ message: "Invalid password" });

    // Remove token generation and send success response
    res.json({ 
      message: "Login success", 
      client: {
        id: client._id,
        name: client.name,
        category: client.category,
        kg: client.kg,
        price: client.price,
        password: client.password 
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;