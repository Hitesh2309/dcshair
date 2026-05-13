import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { UserPlus, ArrowLeft, Loader2, Save, Home, Info, Phone, Mail } from 'lucide-react';
import CustomSelect from '../components/CustomSelect';

export default function AddCustomer() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const allCountries = [
    'India', 'China', 'Japan', 'South Korea', 'North Korea', 'Thailand', 'Vietnam', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Afghanistan', 'Iran', 'Iraq', 'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Oman', 'Yemen', 'Israel', 'Jordan', 'Turkey', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan', 'Mongolia', 'United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 'Portugal', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Poland', 'Czech Republic', 'Hungary', 'Greece', 'Ireland', 'Romania', 'Bulgaria', 'Croatia', 'Serbia', 'Ukraine', 'Russia', 'South Africa', 'Egypt', 'Nigeria', 'Kenya', 'Ethiopia', 'Morocco', 'Ghana', 'Algeria', 'Tunisia', 'Uganda', 'United States', 'Canada', 'Mexico', 'Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'Venezuela', 'Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'
  ];

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', altPhone: '', address: '', city: '', state: '', country: 'India',
    consignees: [{ name: '', address: '', phone: '', email: '' }],
    buyers: [{ name: '', address: '', phone: '', email: '' }],
    notifyParties: [{ name: '', address: '', phone: '', email: '' }],
    contactPersons: [{ name: '', phone: '', email: '' }]
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePartyChange = (partyType, field, value) => {
    setFormData(prev => ({
      ...prev,
      [partyType]: [{ ...prev[partyType][0], [field]: value }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        consignees: formData.consignees.filter(c => c.name.trim()),
        buyers: formData.buyers.filter(b => b.name.trim()),
        notifyParties: formData.notifyParties.filter(n => n.name.trim()),
        contactPersons: formData.contactPersons.filter(cp => cp.name.trim())
      };

      await api.post('/customers', payload);
      navigate('/customers');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add customer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/customers')} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to create a new client profile</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100">{error}</div>
        )}

        {/* ── Primary Customer Details ─────────────────────────────── */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-[#003366]"><Info className="w-5 h-5" /></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Customer Details</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Company / Individual Name *</label>
              <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50" placeholder="e.g. Acme Corp" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50" placeholder="contact@company.com" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Primary Phone</label>
              <input name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50" placeholder="+1 234 567 8900" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Alternate Phone</label>
              <input name="altPhone" value={formData.altPhone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50" placeholder="Optional" />
            </div>
          </div>

          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2 mt-4">
            <Home className="w-3 h-3" /> Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 ml-1">Street Address</label>
              <input name="address" value={formData.address} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50" placeholder="Apartment, Street, Area" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">City</label>
              <input name="city" value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50" placeholder="e.g. Mumbai" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">State / Province</label>
              <input name="state" value={formData.state} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50" placeholder="e.g. Maharashtra" />
            </div>
            <div className="md:col-span-2">
              <CustomSelect label="Country" options={allCountries.map(c => ({ id: c, name: c }))} value={formData.country} onChange={(val) => setFormData(p => ({ ...p, country: val }))} />
            </div>
          </div>
        </section>

        {/* ── Related Parties ─────────────────────────────────────── */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-[#003366]"><UserPlus className="w-5 h-5" /></div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Related Parties (Optional)</h2>
              <p className="text-xs text-gray-500 mt-1">Automatically link related entities to this customer for easy contract generation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Consignee */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <h4 className="font-bold text-[#003366]">Consignee Details</h4>
              <div className="space-y-3">
                <input type="text" placeholder="Name" value={formData.consignees[0].name} onChange={(e) => handlePartyChange('consignees', 'name', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
                <input type="email" placeholder="Email" value={formData.consignees[0].email} onChange={(e) => handlePartyChange('consignees', 'email', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
                <input type="text" placeholder="Phone" value={formData.consignees[0].phone} onChange={(e) => handlePartyChange('consignees', 'phone', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
                <input type="text" placeholder="Address" value={formData.consignees[0].address} onChange={(e) => handlePartyChange('consignees', 'address', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
              </div>
            </div>

            {/* Buyer */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <h4 className="font-bold text-[#003366]">Buyer Details</h4>
              <div className="space-y-3">
                <input type="text" placeholder="Name" value={formData.buyers[0].name} onChange={(e) => handlePartyChange('buyers', 'name', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
                <input type="email" placeholder="Email" value={formData.buyers[0].email} onChange={(e) => handlePartyChange('buyers', 'email', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
                <input type="text" placeholder="Phone" value={formData.buyers[0].phone} onChange={(e) => handlePartyChange('buyers', 'phone', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
                <input type="text" placeholder="Address" value={formData.buyers[0].address} onChange={(e) => handlePartyChange('buyers', 'address', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
              </div>
            </div>

            {/* Notify Party */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <h4 className="font-bold text-[#003366]">Notify Party Details</h4>
              <div className="space-y-3">
                <input type="text" placeholder="Name" value={formData.notifyParties[0].name} onChange={(e) => handlePartyChange('notifyParties', 'name', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
                <input type="email" placeholder="Email" value={formData.notifyParties[0].email} onChange={(e) => handlePartyChange('notifyParties', 'email', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
                <input type="text" placeholder="Phone" value={formData.notifyParties[0].phone} onChange={(e) => handlePartyChange('notifyParties', 'phone', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
                <input type="text" placeholder="Address" value={formData.notifyParties[0].address} onChange={(e) => handlePartyChange('notifyParties', 'address', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
              </div>
            </div>

            {/* Contact Person */}
            <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
              <h4 className="font-bold text-[#003366]">Contact Person Details</h4>
              <div className="space-y-3">
                <input type="text" placeholder="Name" value={formData.contactPersons[0].name} onChange={(e) => handlePartyChange('contactPersons', 'name', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
                <input type="email" placeholder="Email" value={formData.contactPersons[0].email} onChange={(e) => handlePartyChange('contactPersons', 'email', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
                <input type="text" placeholder="Phone" value={formData.contactPersons[0].phone} onChange={(e) => handlePartyChange('contactPersons', 'phone', e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] text-sm" />
              </div>
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/customers')} className="px-8 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-white transition-colors border border-transparent hover:border-gray-100">
            Cancel
          </button>
          <button disabled={isSubmitting} type="submit" className="bg-[#003366] text-white px-10 py-3 rounded-xl font-bold text-sm hover:bg-[#004080] transition-all shadow-xl shadow-[#003366]/20 flex items-center gap-2 disabled:opacity-70">
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Customer</>}
          </button>
        </div>
      </form>
    </div>
  );
}
