import express from "express";

const adminrouter = express.Router();

// Hardcoded admin credentials
const ADMIN = {
  email: "muhammadumerraja1@gmail.com",
  password: "Rajaumer@123",
};

adminrouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email !== ADMIN.email) {
      return res.status(404).json({ message: "Admin not found ❌" });
    }

    if (password !== ADMIN.password) {
      return res.status(401).json({ message: "Wrong password ❌" });
    }

    

    res.json({ 
      message: "Login successful ✅",
      user: { email: ADMIN.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default adminrouter;
