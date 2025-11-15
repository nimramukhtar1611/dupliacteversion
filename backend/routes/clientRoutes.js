import express from "express";
import { 
  addClient, 
  getAllClients, 
  getClientOrders,
  deleteOrder,
  deleteClient,
  updateOrder
} from "../controllers/clientcontroller.js";

const clientrouter = express.Router();

clientrouter.post("/add", addClient);
clientrouter.get("/", getAllClients);
clientrouter.get("/orders/:name", getClientOrders);
clientrouter.delete("/order/:orderId", deleteOrder);
clientrouter.delete("/:id", deleteClient);
clientrouter.put("/order/:orderId", updateOrder); // Added this line


export default clientrouter;