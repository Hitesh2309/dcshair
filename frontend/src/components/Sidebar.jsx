import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  LayoutDashboard,
  Users,
  UserCircle,
  Settings,
  LogOut,
  Scissors,
  Package
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Customers', path: '/customers', icon: UserCircle },
  { name: 'Products', path: '/products', icon: Package },
  { name: 'Users', path: '/users', icon: Users },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-[#003366] text-white flex flex-col h-screen fixed left-0 top-0 shadow-xl">
      <div className="px-6 py-4 flex items-center gap-3 border-b border-white/10">
        <div className="bg-white/10 p-2 rounded-lg">
          <Scissors className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">DCS Hair</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-white/10 text-white shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/60 hover:text-white hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}

