import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { UserPlus, Search, Phone, MapPin, Mail, Loader2, Globe } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

export default function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');

  // Predefined comprehensive country list
  const allCountries = [
    'India', 'China', 'Japan', 'South Korea', 'North Korea', 'Thailand', 'Vietnam', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Afghanistan', 'Iran', 'Iraq', 'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Oman', 'Yemen', 'Israel', 'Jordan', 'Turkey', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan', 'Mongolia', 'United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Greece', 'Ireland', 'Romania', 'Bulgaria', 'Croatia', 'Serbia', 'Ukraine', 'Russia', 'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Ethiopia', 'Morocco', 'Ghana', 'Algeria', 'Tunisia', 'Uganda', 'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela', 'Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'
  ];

  const filterCountries = ['All', ...allCountries];

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers`);
      setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm);
    const matchesCountry = selectedCountry === 'All' || customer.country === selectedCountry;

    return matchesSearch && matchesCountry;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">Directory of all salon clients and history</p>
        </div>
        <button
          onClick={() => navigate('/customers/add')}
          className="bg-[#003366] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#004080] transition-all shadow-lg active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm"
              />
            </div>

            <div className="w-64">
              <CustomSelect 
                options={filterCountries.map(c => ({ id: c, name: c === 'All' ? 'All Countries' : c }))}
                value={selectedCountry}
                onChange={(val) => setSelectedCountry(val)}
                placeholder="All Countries"
              />
            </div>
          </div>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {filteredCustomers.length} Total Results
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-8 py-4 font-semibold">Client Name</th>
                <th className="px-8 py-4 font-semibold">Contact Info</th>
                <th className="px-8 py-4 font-semibold">Location</th>
                <th className="px-8 py-4 font-semibold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
                      <span className="text-gray-400 font-medium">Loading customers...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-10 h-10 text-gray-200" />
                      <span className="text-gray-400 font-medium">No customers found matching "{searchTerm}"</span>
                    </div>
                  </td>
                </tr>
              ) : filteredCustomers.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#003366] font-bold text-sm border border-blue-100">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{client.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-0.5 font-semibold">ID: DCS-{client.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-blue-500/70" />
                        <span className="font-medium">{client.phone || '—'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-blue-500/70" />
                        <span className="font-medium">{client.email || '—'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">{client.city ? `${client.city}, ${client.state}` : 'Not Specified'}</span>
                      </div>
                      {client.country && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-gray-400 opacity-0" /> {/* Spacer for alignment */}
                          <span className="text-[10px] bg-blue-50 px-1.5 py-0.5 rounded text-blue-600 font-bold uppercase tracking-wider">{client.country}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                    {new Date(client.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
