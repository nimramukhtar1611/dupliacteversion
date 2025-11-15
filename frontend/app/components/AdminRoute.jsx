"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const AdminRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const adminData = localStorage.getItem('admindata');
        
        if (!token || !adminData) {
          router.push('/admin');
          return;
        }
        
        // Additional verification
        const parsedData = JSON.parse(adminData);
        if (!parsedData || !parsedData.email) {
          localStorage.removeItem('token');
          localStorage.removeItem('admindata');
          router.push('/admin');
          return;
        }
        
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Admin auth check error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('admindata');
        router.push('/admin');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-gray-500 text-lg font-medium">Checking admin authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default AdminRoute;