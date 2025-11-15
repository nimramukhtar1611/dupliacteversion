"use client";
import AdminDashboard from "../components/AdminDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboard />
    </ProtectedRoute>
  );
}