import Client from "../models/Client.js";
// Get all clients
export const getAllClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) { 
    res.status(500).json({ message: "Server error" }); 
  }
};

// Get client orders
export const getClientOrders = async (req, res) => {
  try {
    const { name } = req.params;
    const client = await Client.findOne({ name });
    if (!client) return res.status(404).json({ message: "Client not found" });

    res.json({ orders: client.orders || [] });
  } catch (err) { 
    res.status(500).json({ message: "Server error" }); 
  }
};

// Delete specific order
export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Find client that has this order and remove it
    const client = await Client.findOneAndUpdate(
      { "orders._id": orderId },
      { $pull: { orders: { _id: orderId } } },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete entire client
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await Client.findByIdAndDelete(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json({ message: "Client deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
// Add Client / Order - UPDATED WITH PAYMENT FIELDS
export const addClient = async (req, res) => {
  try {
    const { name, category, kg, price, password, currentRate, paid, due } = req.body;
    let client = await Client.findOne({ name });
    
    // Calculate price automatically if not provided
    const finalPrice = price || (kg * currentRate);
    // Calculate due amount if not provided
    const finalDue = due || (finalPrice - (paid || 0));
    
    const newOrder = { 
      category, 
      kg, 
      price: finalPrice,
      currentRate,
      paid: paid || 0, // NEW: Store paid amount
      due: finalDue    // NEW: Store due amount
    };

    if (client) {
      client.orders.push(newOrder);
      await client.save();
    } else {
      client = await Client.create({
        name,
        password,
        currentRate,
        paid: paid || 0, // NEW
        due: finalDue,   // NEW
        orders: [newOrder]
      });
    }

    res.status(201).json({ message: "Order added", client });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update specific order - UPDATED WITH PAYMENT FIELDS
export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { category, kg, price, currentRate, paid, due } = req.body;

    // Calculate due amount if not provided
    const finalDue = due || (price - (paid || 0));

    // Find client and update the specific order
    const client = await Client.findOneAndUpdate(
      { "orders._id": orderId },
      { 
        $set: { 
          "orders.$.category": category,
          "orders.$.kg": kg,
          "orders.$.price": price,
          "orders.$.currentRate": currentRate,
          "orders.$.paid": paid || 0, // NEW: Update paid amount
          "orders.$.due": finalDue,   // NEW: Update due amount
          "orders.$.date": new Date() // Update date to current time
        } 
      },
      { new: true }
    );

    if (!client) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated successfully", client });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};