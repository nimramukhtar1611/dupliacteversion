"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const clientData = localStorage.getItem('clientData');
        
        if (!clientData) {
          router.push('/login');
          return;
        }
        
        // Additional verification - check if data is valid JSON
        const parsedData = JSON.parse(clientData);
        if (!parsedData || !parsedData.name) {
          localStorage.removeItem('clientData');
          router.push('/login');
          return;
        }
        
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('clientData');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="text-gray-500 text-lg font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default ProtectedRoute;