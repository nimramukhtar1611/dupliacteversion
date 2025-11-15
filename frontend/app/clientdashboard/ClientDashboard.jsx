"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ClientDashboard = () => {
  const [client, setClient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem("token");
      const clientData = localStorage.getItem("clientData");

      // Authentication check - agar token ya client data nahi hai toh login page par redirect
      if (!token || !clientData) {
        router.push("/login");
        return;
      }

      try {
        const parsedClientData = JSON.parse(clientData);
        const response = await fetch(
          `http://localhost:5000/api/clients/orders/${parsedClientData.name}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 401) {
          // Token expired ya invalid hai
          localStorage.removeItem("token");
          localStorage.removeItem("clientData");
          router.push("/login");
          return;
        }

        const data = await response.json();
        setClient(data);
      } catch (err) {
        console.error("Error fetching data:", err);
        // Error case mein bhi login par redirect karo
        localStorage.removeItem("token");
        localStorage.removeItem("clientData");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("clientData");
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

  // Agar client data nahi hai (redirect ho chuka hoga)
  if (!client) {
    return null;
  }

  // Current order find karo (latest order)
  const currentOrder = client.orders && client.orders.length > 0 
    ? client.orders[client.orders.length - 1] 
    : null;

  // Orders history (current order ko chod kar sab)
  const ordersHistory = client.orders && client.orders.length > 1 
    ? client.orders.slice(0, -1).reverse() 
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
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
        {currentOrder && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">📦 Current Order</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium mb-2">Category</p>
                <p className="text-2xl font-bold text-blue-900">{currentOrder.category}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium mb-2">Weight</p>
                <p className="text-2xl font-bold text-green-900">{currentOrder.kg} kg</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium mb-2">Price</p>
                <p className="text-2xl font-bold text-purple-900">Rs {currentOrder.price}</p>
              </div>
            </div>
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
          </div>
        )}

        {/* No Current Order Message */}
        {!currentOrder && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-center">
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">No Active Orders</h2>
            <p className="text-yellow-700">You don't have any current orders. Place a new order to get started!</p>
          </div>
        )}

        {/* Orders History */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">📋 Orders History</h2>
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
                          {new Date(order.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.date).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {order.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.kg} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        Rs {order.price}
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
                You haven't placed more than 1 order. .
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
                {client.orders.reduce((total, order) => total + parseFloat(order.kg), 0)} kg
              </p>
              <p className="text-sm text-gray-600">Total Weight</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                Rs {client.orders.reduce((total, order) => total + parseFloat(order.price), 0)}
              </p>
              <p className="text-sm text-gray-600">Total Spent</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {new Date(Math.max(...client.orders.map(o => new Date(o.date)))).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">Last Order</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;