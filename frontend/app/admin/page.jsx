"use client";
import React, { useState } from "react";
import axiosInstance from "../libs/axios";
import { useRouter } from "next/navigation"; 
import { useAuth } from "../contexts/AuthContext";

const AdminLogin = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data } = await axiosInstance.post("/admin/login", formData);

      // Backend me token nahi, admin data "user" me hai
      login(null, data.user);

      console.log("Login successful:", data.user);
      setSuccess("Login successful!");

      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Something went wrong! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 py-6 px-8">
            <h2 className="text-2xl font-bold text-white text-center" style={{ fontFamily: "'Pacifico', cursive" }}>
              ADMIN PORTAL
            </h2>
            <p className="text-gray-300 text-center text-sm mt-2">Secure Access Only</p>
          </div>
          
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Admin Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="admin@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
                onChange={handleChange}
                required
                value={formData.email}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-700"
                onChange={handleChange}
                required
                value={formData.password}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white ${
                isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
              }`}
            >
              {isLoading ? "Authenticating..." : "Access Dashboard"}
            </button>

            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-600 text-sm mt-2">{success}</p>}
          </form>

          <div className="bg-gray-50 py-4 px-8 border-t border-gray-200 text-center text-xs text-gray-500">
            Restricted access. Authorized personnel only.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
