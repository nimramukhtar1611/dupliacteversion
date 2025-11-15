"use client";
import AdminDashboard from "./AdminDashboard";
import AdminRoute from "../components/AdminRoute";
export default function DashboardPage() {
  return (
    <AdminRoute>
      <AdminDashboard />
    </AdminRoute>
  );
}