"use client";
import ClientDashboard from "./ClientDashboard";
import ProtectedRoute from "../components/ProtectedRoute";
export default function ClientDashboardPage() {
  return (
    <ProtectedRoute>
      <ClientDashboard />
    </ProtectedRoute>
  );
}