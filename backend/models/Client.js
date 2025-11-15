import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  category: String,
  kg: Number,
  price: Number,
  currentRate: Number,
  paid: Number, // NEW: Amount paid by client
  due: Number,  // NEW: Due amount (auto-calculated)
  date: { type: Date, default: Date.now }
});

const clientSchema = new mongoose.Schema({
  name: String,
  password: String,
  phone: String,
  category: String,
  kg: Number,
  price: Number,
  currentRate: Number,
  paid: Number, // NEW
  due: Number,  // NEW
  orders: [orderSchema]
});

export default mongoose.model("Client", clientSchema);