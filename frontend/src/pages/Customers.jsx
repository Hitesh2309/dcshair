import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { UserPlus, Search, Phone, MapPin, Mail, X, Loader2, Plus, Globe, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isModalCountryDropdownOpen, setIsModalCountryDropdownOpen] = useState(false);
  const [countrySearchTerm, setCountrySearchTerm] = useState('');
  const [modalCountrySearchTerm, setModalCountrySearchTerm] = useState('');
  const [error, setError] = useState('');

  // Predefined comprehensive country list
  const allCountries = [
    'India', 'China', 'Japan', 'South Korea', 'North Korea', 'Thailand', 'Vietnam', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Afghanistan', 'Iran', 'Iraq', 'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Oman', 'Yemen', 'Israel', 'Jordan', 'Turkey', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan', 'Mongolia', 'United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Greece', 'Ireland', 'Romania', 'Bulgaria', 'Croatia', 'Serbia', 'Ukraine', 'Russia', 'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Ethiopia', 'Morocco', 'Ghana', 'Algeria', 'Tunisia', 'Uganda', 'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela', 'Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'
  ];

  const filterCountries = ['All', ...allCountries];

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    altPhone: '',
    address: '',
    city: '',
    state: '',
    country: 'India'
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.post('/customers', formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        altPhone: '',
        address: '',
        city: '',
        state: '',
        country: 'India'
      });
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          onClick={() => setIsModalOpen(true)}
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

      {/* Add Customer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden relative z-10 border border-gray-100"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add New Customer</h2>
                  <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new client profile</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-gray-600 transition-all border border-transparent hover:border-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8">
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <UserPlus className="w-3 h-3" /> Basic Information
                    </h3>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 ml-1">Full Name *</label>
                      <input
                        required
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                        placeholder="e.g. Parag Aggarwal"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 ml-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                        placeholder="parag@example.com"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 ml-1">Phone *</label>
                        <input
                          required
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                          placeholder="9876543210"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 ml-1">Alt Phone</label>
                        <input
                          name="altPhone"
                          value={formData.altPhone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address Info */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <Home className="w-3 h-3" /> Address Details
                    </h3>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 ml-1">Street Address</label>
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                        placeholder="Apartment, Street, Area"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 ml-1">City</label>
                        <input
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                          placeholder="e.g. Mumbai"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 ml-1">State</label>
                        <input
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                          placeholder="e.g. Maharashtra"
                        />
                      </div>
                    </div>
                    <CustomSelect 
                      label="Country"
                      options={allCountries.map(c => ({ id: c, name: c }))}
                      value={formData.country}
                      onChange={(val) => setFormData(p => ({ ...p, country: val }))}
                    />
                  </div>
                </div>

                <div className="mt-10 flex gap-4 pt-6 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="flex-[2] bg-[#003366] text-white px-4 py-3.5 rounded-xl font-bold text-sm hover:bg-[#004080] transition-all shadow-lg shadow-[#003366]/20 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Profile...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Customer Profile
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

