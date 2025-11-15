"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../libs/axios";

const page = () => {
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const clientData = localStorage.getItem("clientData") || 
                        localStorage.getItem("client") ||
                        localStorage.getItem("currentClient");
      
      console.log("LocalStorage data:", clientData);

      if (clientData) {
        const parsedClient = JSON.parse(clientData);
        
        // Data validation - check karo ke required fields hain
        if (parsedClient && parsedClient.name) {
          setClient(parsedClient);
          
          // Optional: Server se latest data fetch karo
          try {
            const serverResponse = await axiosInstance.get(`/clients/orders/${parsedClient.name}`);
            if (serverResponse.data && serverResponse.data.orders) {
              // Server data ke saath client data update karo
              setClient(prev => ({
                ...prev,
                orders: serverResponse.data.orders
              }));
            }
          } catch (serverError) {
            console.log("Server data fetch failed, using localStorage data");
          }
          
        } else {
          setError("Invalid client data format");
          router.push("/login");
        }
      } else {
        // Agar local storage mein data nahi hai, to login page pe redirect karo
        setError("No client data found");
        router.push("/login");
      }
    } catch (error) {
      console.error("Error fetching client data:", error);
      setError("Failed to load client data");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // All possible client keys clear karo
    localStorage.removeItem("clientData");
    localStorage.removeItem("client");
    localStorage.removeItem("currentClient");
    // Login page pe redirect karo
    router.push("/login");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 text-lg font-medium">Loading client data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Agar client data nahi hai
  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-yellow-500 text-6xl mb-4">❓</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Client Data</h2>
          <p className="text-gray-600 mb-4">Please login to access your dashboard</p>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Data formatting and processing
  const currentOrder = client.orders && client.orders.length > 0 
    ? client.orders[client.orders.length - 1] 
    : null;

  const ordersHistory = client.orders && client.orders.length > 1 
    ? client.orders.slice(0, -1).reverse() 
    : [];

  // Debug information (remove in production)
  console.log("Client data:", client);
  console.log("Current order:", currentOrder);
  console.log("Orders history:", ordersHistory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {client.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {client.name}! 👋</h1>
          <p className="text-gray-600">Here's your order summary and history</p>
        </div>

        {/* Current Order */}
        {currentOrder ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">📦 Current Order</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium mb-2">Category</p>
                <p className="text-2xl font-bold text-blue-900">{currentOrder.category || "N/A"}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium mb-2">Weight</p>
                <p className="text-2xl font-bold text-green-900">{currentOrder.kg || "0"} kg</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium mb-2">Price</p>
                <p className="text-2xl font-bold text-purple-900">Rs {currentOrder.price || "0"}</p>
              </div>
            </div>
            {currentOrder.date && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Ordered on: {new Date(currentOrder.date).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-center">
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">No Active Orders</h2>
            <p className="text-yellow-700">You don't have any current orders. Place a new order to get started!</p>
          </div>
        )}

        {/* Orders History */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">📋 Orders History</h2>
            <p className="text-gray-600 text-sm mt-1">Total orders: {client.orders ? client.orders.length : 0}</p>
          </div>
          
          {ordersHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {ordersHistory.map((order, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.date ? new Date(order.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }) : "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.date ? new Date(order.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }) : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {order.category || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.kg || "0"} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        Rs {order.price || "0"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📭</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No order history</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {client.orders && client.orders.length === 1 
                  ? "You have only one current order. No previous orders found." 
                  : "You haven't placed any orders yet."}
              </p>
            </div>
          )}
        </div>

        {/* Stats Summary */}
        {client.orders && client.orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{client.orders.length}</p>
              <p className="text-sm text-gray-600">Total Orders</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {client.orders.reduce((total, order) => total + parseFloat(order.kg || 0), 0)} kg
              </p>
              <p className="text-sm text-gray-600">Total Weight</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                Rs {client.orders.reduce((total, order) => total + parseFloat(order.price || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {client.orders.length > 0 && client.orders[client.orders.length - 1].date
                  ? new Date(client.orders[client.orders.length - 1].date).toLocaleDateString()
                  : "N/A"
                }
              </p>
              <p className="text-sm text-gray-600">Last Order</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default page;