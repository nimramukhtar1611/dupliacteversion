"use client"
import React from 'react'
import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance';

const AdminDashboard = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientOrders, setClientOrders] = useState([]);
  const [form, setForm] = useState({ 
    name: "", 
    password: "", 
    category: "", 
    kg: "", 
    price: "",
    currentRate: "",
    paid: "", // NEW: Amount paid by client
    due: ""   // NEW: Due amount (auto-calculated)
  });
  const [editingId, setEditingId] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Fetch all clients
  const getClients = async () => {
    try {
      const res = await axiosInstance.get("/clients");
      setClients(res.data);
      setFilteredClients(res.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  // Fetch specific client's orders - SORT BY LATEST FIRST
  const getClientOrders = async (clientName) => {
    try {
      const res = await axiosInstance.get(`/clients/orders/${clientName}`);
      const orders = Array.isArray(res.data.orders) ? res.data.orders : [];
      // SORT ORDERS - LATEST FIRST
      const sortedOrders = orders.sort((a, b) => new Date(b.date) - new Date(a.date));
      setClientOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching client orders:", error);
      setClientOrders([]);
    }
  };

  useEffect(() => { 
    getClients(); 
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchTerm) {
      setFilteredClients(clients);
    } else {
      const filtered = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClients(filtered);
    }
  }, [searchTerm, clients]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => {
      const updatedForm = { ...prevForm, [name]: value };

      // AUTO-CALCULATE PRICE - FIXED LOGIC
      if (name === 'kg' || name === 'currentRate') {
        const kgValue = name === 'kg' ? value : prevForm.kg;
        const rateValue = name === 'currentRate' ? value : prevForm.currentRate;
        
        if (kgValue && rateValue) {
          const calculatedPrice = parseFloat(kgValue) * parseFloat(rateValue);
          updatedForm.price = calculatedPrice.toFixed(2);
          
          // AUTO-CALCULATE DUE AMOUNT
          const paidValue = parseFloat(updatedForm.paid) || 0;
          updatedForm.due = (calculatedPrice - paidValue).toFixed(2);
        } else {
          updatedForm.price = "";
          updatedForm.due = "";
        }
      }
      
      // AUTO-CALCULATE DUE when paid amount changes
      if (name === 'paid') {
        const priceValue = parseFloat(updatedForm.price) || 0;
        const paidValue = parseFloat(value) || 0;
        updatedForm.due = (priceValue - paidValue).toFixed(2);
      }

      return updatedForm;
    });
  };

  const closeModal = (modalId) => { 
    const modal = document.getElementById(modalId); 
    if (modal) modal.close(); 
  };
  
  const showModal = (modalId) => { 
    const modal = document.getElementById(modalId); 
    if (modal) modal.showModal(); 
  };

  // Add or update client / orders
  const saveClient = async (e) => {
    e.preventDefault();

    if (currentView === "clientDetails" && selectedClient) {
      // Add new order
      try {
        const res = await axiosInstance.post("/clients/add", {
          name: selectedClient.name,
          password: selectedClient.password,
          category: form.category,
          kg: form.kg,
          price: form.price,
          currentRate: form.currentRate,
          paid: form.paid, // NEW: Include paid amount
          due: form.due    // NEW: Include due amount
        });
        if (res.status === 200) {
          alert("New order added successfully!");
          setForm({ name: "", password: "", category: "", kg: "", price: "", currentRate: "", paid: "", due: "" });
          getClients();
          closeModal("orderModal");
          getClientOrders(selectedClient.name);
        } else alert(res.data.message);
      } catch (err) { 
        console.error(err); 
        alert("Something went wrong!"); 
      }
    } else {
      // Add new client
      const endpoint = editingId ? `/clients/${editingId}` : "/clients/add";
      const method = editingId ? "put" : "post";
      try {
        const res = await axiosInstance[method](endpoint, form);
        if (res.status === 200) {
          alert(res.data.message);
          setForm({ name: "", password: "", category: "", kg: "", price: "", currentRate: "", paid: "", due: "" });
          setEditingId(null);
          getClients();
          closeModal("formBox");
        } else alert(res.data.message);
      } catch (err) { 
        console.error(err); 
        alert("Something went wrong!"); 
      }
    }
  };

  // Update order function - UPDATED WITH PAYMENT FIELDS
  const updateOrder = async (e) => {
    e.preventDefault();

    try {
      const res = await axiosInstance.put(`/clients/order/${editingId}`, {
        category: form.category,
        kg: form.kg,
        price: form.price,
        currentRate: form.currentRate,
        paid: form.paid, // NEW: Include paid amount
        due: form.due    // NEW: Include due amount
      });
      
      if (res.status === 200) {
        alert("Order updated successfully!");
        setForm({ name: "", password: "", category: "", kg: "", price: "", currentRate: "", paid: "", due: "" });
        setEditingId(null);
        closeModal("editOrderModal");
        getClients();
        if (selectedClient) getClientOrders(selectedClient.name);
      } else {
        alert(res.data.message);
      }
    } catch (err) { 
      console.error(err); 
      alert("Something went wrong!"); 
    }
  };

  const editOrder = (order) => {
    setForm({ 
      name: selectedClient.name, 
      password: selectedClient.password, 
      category: order.category, 
      kg: order.kg, 
      price: order.price,
      currentRate: order.currentRate || "",
      paid: order.paid || "", // NEW: Include paid amount
      due: order.due || ""    // NEW: Include due amount
    });
    setEditingId(order._id);
    showModal("editOrderModal");
  };

  // DELETE ORDER - FIXED ENDPOINT
  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await axiosInstance.delete(`/clients/order/${orderId}`);
      
      if (res.status === 200) {
        alert("Order deleted successfully!");
        getClients();
        if (selectedClient) getClientOrders(selectedClient.name);
      } else {
        alert("Error deleting order!");
      }
    } catch (error) { 
      console.error(error); 
      alert("Error deleting order!"); 
    }
  };

  const resetForm = () => setForm({ name: "", password: "", category: "", kg: "", price: "", currentRate: "", paid: "", due: "" });

  const viewClientDetails = async (client) => {
    setSelectedClient(client);
    setCurrentView("clientDetails");
    setIsSidebarOpen(false); // Close sidebar on mobile when navigating
    await getClientOrders(client.name);
  };

  const startNewClient = () => { 
    resetForm(); 
    showModal("formBox"); 
  };

  const addNewOrder = () => {
    if (!selectedClient) return alert("No client selected!");
    setForm({ 
      name: selectedClient.name, 
      password: selectedClient.password, 
      category: "", 
      kg: "", 
      price: "",
      currentRate: "", // Let admin enter current rate
      paid: "",        // NEW: Initialize paid amount
      due: ""          // NEW: Initialize due amount
    });
    showModal("orderModal");
  };

  // Calculate totals safely - UPDATED WITH PAYMENT TOTALS
  const { totalKG, totalPrice, totalPaid, totalDue } = clientOrders.reduce((acc, order) => {
    acc.totalKG += parseFloat(order.kg || 0);
    acc.totalPrice += parseFloat(order.price || 0);
    acc.totalPaid += parseFloat(order.paid || 0);
    acc.totalDue += parseFloat(order.due || 0);
    return acc;
  }, { totalKG: 0, totalPrice: 0, totalPaid: 0, totalDue: 0 });

  // Render Client Details View
  if (currentView === "clientDetails") {
    if (!selectedClient) {
      return (
        <div className="flex h-screen bg-gray-100">
          {/* Mobile Sidebar Toggle */}
          <div className="md:hidden fixed top-4 left-4 z-50">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="bg-black text-white p-2 rounded-md"
            >
              ☰
            </button>
          </div>
          
          {/* Sidebar */}
          <div className={`fixed md:relative z-40 w-64 bg-black text-white flex flex-col p-5 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
            <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "'Pacifico', cursive" }}>Noor Traders</h2>
            <button
              onClick={() => setCurrentView("dashboard")}
              className="bg-gray-600 hover:bg-gray-700 py-2 rounded transition mb-4"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          {/* Overlay for mobile sidebar */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}
          
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-500 mb-4">Client Not Found</h2>
              <button
                onClick={() => setCurrentView("dashboard")}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-screen bg-gray-100">
        {/* Mobile Sidebar Toggle */}
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-black text-white p-2 rounded-md"
          >
            ☰
          </button>
        </div>
        
        {/* Sidebar */}
        <div className={`fixed md:relative z-40 w-64 bg-black text-white flex flex-col p-5 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "'Pacifico', cursive" }}>Noor Traders</h2>
          <button
            onClick={() => setCurrentView("dashboard")}
            className="bg-gray-600 hover:bg-gray-700 py-2 rounded transition mb-4"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={addNewOrder}
            className="bg-green-500 hover:bg-green-600 py-2 rounded transition mb-4"
          >
            ➕ Add New Order
          </button>
        </div>
        
        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Client Details Content */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow p-4 md:p-6 mb-6">
            <h1 className="text-2xl md:text-3xl uppercase font-bold mb-2" style={{ fontFamily: "'Pacifico', cursive" }}>
              {selectedClient.name}
            </h1>
            <p className="text-gray-600">Complete Order History & Details</p>
          </div>

          {/* Client Information */}
          <div className="bg-white rounded-xl shadow p-4 md:p-5 mb-6">
            <h2 className="text-xl font-bold mb-4">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border p-3 rounded-lg">
                <strong>Username:</strong> {selectedClient.name}
              </div>
              <div className="border p-3 rounded-lg">
                <strong>Password:</strong> {selectedClient.password}
              </div>
            </div>
          </div>

          {/* Order Summary - UPDATED WITH PAYMENT SUMMARY */}
          <div className="bg-white rounded-xl shadow p-4 md:p-5 mb-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <div className="bg-green-50 border border-green-200 p-3 md:p-4 rounded-lg">
                <strong className="text-green-700 text-sm">Total KG:</strong>
                <div className="text-lg md:text-2xl font-bold text-green-700">{totalKG} KG</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 p-3 md:p-4 rounded-lg">
                <strong className="text-blue-700 text-sm">Total Amount:</strong>
                <div className="text-lg md:text-2xl font-bold text-blue-700">Rs {totalPrice}</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 p-3 md:p-4 rounded-lg">
                <strong className="text-purple-700 text-sm">Total Paid:</strong>
                <div className="text-lg md:text-2xl font-bold text-purple-700">Rs {totalPaid}</div>
              </div>
              <div className="bg-red-50 border border-red-200 p-3 md:p-4 rounded-lg">
                <strong className="text-red-700 text-sm">Total Due:</strong>
                <div className="text-lg md:text-2xl font-bold text-red-700">Rs {totalDue}</div>
              </div>
            </div>
          </div>

          {/* Complete Order History - LATEST ORDERS FIRST - UPDATED WITH PAYMENT COLUMNS */}
          <div className="bg-white rounded-xl shadow p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-2">
              <h2 className="text-xl font-bold">Complete Order History</h2>
              <div className="flex gap-2">
                <span className="bg-gray-100 px-3 py-1 rounded text-sm">
                  Total Orders: {clientOrders.length}
                </span>
                <button
                  onClick={addNewOrder}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition text-sm"
                >
                  ➕ Add Order
                </button>
              </div>
            </div>

            {clientOrders.length === 0 ? (
              <div className="text-center p-8 text-gray-500">
                <p className="text-lg mb-2">No orders found for this client.</p>
                <button
                  onClick={addNewOrder}
                  className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition"
                >
                  Add First Order
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm md:text-base">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-2 md:p-3 font-semibold">Date</th>
                      <th className="p-2 md:p-3 font-semibold">Category</th>
                      <th className="p-2 md:p-3 font-semibold">KG</th>
                      <th className="p-2 md:p-3 font-semibold hidden md:table-cell">Rate</th>
                      <th className="p-2 md:p-3 font-semibold">Price</th>
                      <th className="p-2 md:p-3 font-semibold hidden md:table-cell">Paid</th>
                      <th className="p-2 md:p-3 font-semibold hidden md:table-cell">Due</th>
                      <th className="p-2 md:p-3 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientOrders.map((order, index) => (
                      <tr key={order._id || index} className="border-b hover:bg-gray-50">
                        <td className="p-2 md:p-3">{order.date ? new Date(order.date).toLocaleDateString('en-GB') : 'N/A'}</td>
                        <td className="p-2 md:p-3">{order.category}</td>
                        <td className="p-2 md:p-3">{order.kg} KG</td>
                        <td className="p-2 md:p-3 hidden md:table-cell">Rs {order.currentRate || 'N/A'}</td>
                        <td className="p-2 md:p-3">Rs {order.price}</td>
                        <td className="p-2 md:p-3 hidden md:table-cell">Rs {order.paid || '0'}</td>
                        <td className="p-2 md:p-3 hidden md:table-cell">Rs {order.due || '0'}</td>
                        <td className="p-2 md:p-3 flex gap-1 md:gap-2 justify-center">
                          <button
                            className="bg-blue-500 text-white px-2 py-1 md:px-3 md:py-1 rounded hover:bg-blue-600 text-xs md:text-sm"
                            onClick={() => editOrder(order)}
                          >
                            Edit
                          </button>
                          <button
                            className="bg-red-500 text-white px-2 py-1 md:px-3 md:py-1 rounded hover:bg-red-600 text-xs md:text-sm"
                            onClick={() => deleteOrder(order._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add New Order Modal - UPDATED WITH PAYMENT FIELDS */}
        <dialog
          id="orderModal"
          className="rounded-xl p-0 w-11/12 md:w-96 max-w-md backdrop:bg-black/60 mx-auto my-auto"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            margin: 0,
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => closeModal("orderModal")}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl font-bold"
            >
              ✕
            </button>
            
            <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6 text-gray-800">
              ➕ Add New Order for {selectedClient?.name}
            </h2>

            <form onSubmit={saveClient} className="space-y-4">
              <input 
                type="text" 
                name="category" 
                placeholder="Chicken Category" 
                value={form.category} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
                required 
              />

              <input 
                type="number" 
                name="currentRate" 
                placeholder="Current Rate per KG (Rs)" 
                value={form.currentRate} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
                required 
              />

              <input 
                type="number" 
                name="kg" 
                placeholder="KG" 
                value={form.kg} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
                required 
              />

              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-sm text-gray-600">Calculated Price (Auto)</label>
                <input 
                  type="text" 
                  name="price" 
                  value={`Rs ${form.price || '0'}`} 
                  readOnly
                  className="w-full bg-transparent font-bold text-lg" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.kg || '0'} KG × Rs {form.currentRate || '0'} = Rs {form.price || '0'}
                </p>
              </div>

              {/* NEW: Paid Amount Input */}
              <input 
                type="number" 
                name="paid" 
                placeholder="Amount Paid by Client (Rs)" 
                value={form.paid} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
              />

              {/* NEW: Due Amount Display (Auto-calculated) */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-sm text-gray-600">Due Amount (Auto)</label>
                <input 
                  type="text" 
                  name="due" 
                  value={`Rs ${form.due || '0'}`} 
                  readOnly
                  className="w-full bg-transparent font-bold text-lg" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Rs {form.price || '0'} - Rs {form.paid || '0'} = Rs {form.due || '0'}
                </p>
              </div>

              <button 
                type="submit" 
                className="bg-black text-white w-full py-3 rounded-lg hover:bg-gray-800 transition font-semibold"
              >
                Add Order
              </button>
            </form>
          </div>
        </dialog>

        {/* Edit Order Modal - UPDATED WITH PAYMENT FIELDS */}
        <dialog
          id="editOrderModal"
          className="rounded-xl p-0 w-11/12 md:w-96 max-w-md backdrop:bg-black/60 mx-auto my-auto"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            margin: 0,
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => closeModal("editOrderModal")}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl font-bold"
            >
              ✕
            </button>
            
            <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6 text-gray-800">
              ✏️ Edit Order
            </h2>

            <form onSubmit={updateOrder} className="space-y-4">
              <input 
                type="text" 
                name="category" 
                placeholder="Chicken Category" 
                value={form.category} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
                required 
              />

              <input 
                type="number" 
                name="currentRate" 
                placeholder="Current Rate per KG (Rs)" 
                value={form.currentRate} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
                required 
              />

              <input 
                type="number" 
                name="kg" 
                placeholder="KG" 
                value={form.kg} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
                required 
              />

              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-sm text-gray-600">Calculated Price (Auto)</label>
                <input 
                  type="text" 
                  name="price" 
                  value={`Rs ${form.price || '0'}`} 
                  readOnly
                  className="w-full bg-transparent font-bold text-lg" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.kg || '0'} KG × Rs {form.currentRate || '0'} = Rs {form.price || '0'}
                </p>
              </div>

              {/* NEW: Paid Amount Input */}
              <input 
                type="number" 
                name="paid" 
                placeholder="Amount Paid by Client (Rs)" 
                value={form.paid} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
              />

              {/* NEW: Due Amount Display (Auto-calculated) */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-sm text-gray-600">Due Amount (Auto)</label>
                <input 
                  type="text" 
                  name="due" 
                  value={`Rs ${form.due || '0'}`} 
                  readOnly
                  className="w-full bg-transparent font-bold text-lg" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Rs {form.price || '0'} - Rs {form.paid || '0'} = Rs {form.due || '0'}
                </p>
              </div>

              <button 
                type="submit" 
                className="bg-black text-white w-full py-3 rounded-lg hover:bg-gray-800 transition font-semibold"
              >
                Update Order
              </button>
            </form>
          </div>
        </dialog>
      </div>
    );
  }

  // Main Dashboard View
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-black text-white p-2 rounded-md"
        >
          ☰
        </button>
      </div>
      
      {/* Sidebar */}
      <div className={`fixed md:relative z-40 w-64 bg-black text-white flex flex-col p-5 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "'Pacifico', cursive" }}>Noor Traders</h2>
        
        <button
          onClick={startNewClient}
          className="bg-green-500 hover:bg-green-600 py-2 rounded transition mb-4"
        >
          ➕ Add New Client
        </button>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <h1 className="text-2xl md:text-3xl uppercase font-bold mb-6" style={{ fontFamily: "'Pacifico', cursive" }}>Admin Dashboard</h1>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow p-4 md:p-5 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="🔍 Search client by username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border p-3 rounded-lg focus:ring-2 focus:ring-black"
            />
          </div>
        </div>

        {/* CLIENT LIST */}
        <div className="bg-white rounded-xl shadow p-4 md:p-5">
          <h2 className="text-xl font-bold mb-4">Client List</h2>

          {filteredClients.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              {searchTerm ? "No clients found matching your search." : "No clients found. Add your first client!"}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <div 
                  key={client._id}
                  onClick={() => viewClientDetails(client)}
                  className="border rounded-lg p-4 hover:shadow-md transition cursor-pointer hover:border-blue-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-blue-600">{client.name}</h3>
                      <p className="text-sm text-gray-500">Click to view complete history</p>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ADD CLIENT MODAL - UPDATED WITH PAYMENT FIELDS */}
        <dialog
          id="formBox"
          className="rounded-xl p-0 w-11/12 md:w-96 max-w-md backdrop:bg-black/60 mx-auto my-auto"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            margin: 0,
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-4 md:p-6 w-full relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => closeModal("formBox")}
              className="absolute top-3 right-3 text-gray-600 hover:text-black text-xl font-bold"
            >
              ✕
            </button>
            
            <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-6 text-gray-800">
              {editingId ? "✏️ Edit Client" : "➕ Add New Client"}
            </h2>

            <form onSubmit={saveClient} className="space-y-4">
              <input 
                type="text" 
                name="name" 
                placeholder="Client Username" 
                value={form.name} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
                required 
              />

              <input 
                type="password" 
                name="password" 
                placeholder="Client Password" 
                value={form.password} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
                required 
              />

              <input 
                type="text" 
                name="category" 
                placeholder="Chicken Category" 
                value={form.category} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
                required 
              />

              <input 
                type="number" 
                name="currentRate" 
                placeholder="Current Rate per KG (Rs)" 
                value={form.currentRate} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
                required 
              />

              <input 
                type="number" 
                name="kg" 
                placeholder="KG" 
                value={form.kg} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
                required 
              />

              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-sm text-gray-600">Calculated Price (Auto)</label>
                <input 
                  type="text" 
                  name="price" 
                  value={`Rs ${form.price || '0'}`} 
                  readOnly
                  className="w-full bg-transparent font-bold text-lg" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  {form.kg || '0'} KG × Rs {form.currentRate || '0'} = Rs {form.price || '0'}
                </p>
              </div>

              {/* NEW: Paid Amount Input */}
              <input 
                type="number" 
                name="paid" 
                placeholder="Amount Paid by Client (Rs)" 
                value={form.paid} 
                onChange={handleChange}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-black" 
              />

              {/* NEW: Due Amount Display (Auto-calculated) */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <label className="text-sm text-gray-600">Due Amount (Auto)</label>
                <input 
                  type="text" 
                  name="due" 
                  value={`Rs ${form.due || '0'}`} 
                  readOnly
                  className="w-full bg-transparent font-bold text-lg" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  Rs {form.price || '0'} - Rs {form.paid || '0'} = Rs {form.due || '0'}
                </p>
              </div>

              <button 
                type="submit" 
                className="bg-black text-white w-full py-3 rounded-lg hover:bg-gray-800 transition font-semibold"
              >
                {editingId ? "Update Client" : "Add Client"}
              </button>
            </form>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;