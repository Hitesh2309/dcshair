import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../components/AuthContext';
import { LogOut } from 'lucide-react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  console.log(user?.role);
  const isAdmin = user?.role === 'Admin';
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen">
        {/* Modern Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Management Portal</h2>
            <div className="h-1 w-8 bg-[#003366] rounded-full mt-1"></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{user?.userName}</p>
                <p className="text-xs text-gray-500">{isAdmin ? 'Admin' : 'User'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#003366] flex items-center justify-center text-white font-bold shadow-lg">
                {user?.userName?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-2">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

