import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
dotenv.config();
connectDB();
const app = express();
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], 
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/clients", clientRoutes);

app.get("/", (req, res) => {
  res.send("Server is running...");
});
