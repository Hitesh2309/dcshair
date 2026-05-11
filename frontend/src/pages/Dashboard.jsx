import React from 'react';
import { 
  Users, 
  UserCircle, 
  Calendar, 
  TrendingUp 
} from 'lucide-react';

const stats = [
  { label: 'Total Customers', value: '1,284', icon: UserCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Total Staff', value: '24', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { label: 'Today\'s Appointments', value: '12', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-100' },
  { label: 'Monthly Growth', value: '+14.5%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.bg} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">New customer registered</p>
                  <p className="text-xs text-gray-500">Sarah Jenkins joined the salon management system</p>
                  <p className="text-[10px] text-gray-400 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#003366] p-8 rounded-2xl shadow-xl text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Welcome Back!</h3>
            <p className="text-white/70 text-sm mb-6">You have 12 appointments scheduled for today. Check your schedule to manage them.</p>
            <button className="bg-white text-[#003366] px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg">
              View Schedule
            </button>
          </div>
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -left-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>
      </div>
    </div>
  );
}
