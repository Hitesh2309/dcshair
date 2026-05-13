import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  FileText, ArrowLeft, Loader2, Save, Info, Truck, CreditCard, Package, Trash2, Users, UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';

export default function GenerateContract() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [options, setOptions] = useState({ customers: [], products: [], termsOfPayment: [] });
  const [parties, setParties] = useState({ consignees: [], buyers: [], notifyParties: [], contactPersons: [] });
  const [partiesLoading, setPartiesLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    customerId: '',
    consigneeId: '',
    buyerId: '',
    notifyPartyId: '',
    contactPersonId: '',
    termsOfPaymentId: '',
    items: [],
    countryOfOrigin: 'INDIA',
    countryOfDestination: '',
    description: '',
    packing: '',
    insurance: '',
    preCarriageBy: 'Sea',
    portOfLoading: '',
    portOfFinalDestination: '',
    operatingAirlines: '',
    speacialCondition: '',
    note: '',
    expectedDepartureDate: '',
    expectedDeliveryDate: ''
  });

  useEffect(() => {
    api.get('/contracts/options')
      .then(res => setOptions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // When customer changes, load their parties
  useEffect(() => {
    if (!formData.customerId) {
      setParties({ consignees: [], buyers: [], notifyParties: [], contactPersons: [] });
      setFormData(p => ({ ...p, consigneeId: '', buyerId: '', notifyPartyId: '', contactPersonId: '' }));
      return;
    }
    setPartiesLoading(true);
    api.get(`/contracts/customer/${formData.customerId}/parties`)
      .then(res => setParties(res.data))
      .catch(console.error)
      .finally(() => setPartiesLoading(false));
  }, [formData.customerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Inline party creation — posts to /party and updates local list
  const makePartyCreator = (type, partyKey) => async (name) => {
    const res = await api.post('/contracts/party', { type, customerId: formData.customerId, name });
    const newParty = res.data;
    setParties(prev => ({ ...prev, [partyKey]: [...prev[partyKey], newParty] }));
    return newParty;
  };

  const handleProductSelect = (productId) => {
    const product = options.products.find(p => p.id === productId);
    if (!product || formData.items.some(item => item.productId === productId)) return;
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId, name: product.name, skuCode: product.skuCode, quantity: 0, pricePerKg: 0 }]
    }));
  };

  const handleRemoveItem = (productId) => {
    setFormData(prev => ({ ...prev, items: prev.items.filter(item => item.productId !== productId) }));
  };

  const handleItemChange = (productId, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => item.productId === productId ? { ...item, [field]: value } : item)
    }));
  };

  const handleCreateTermsOfPayment = async (name) => {
    const res = await api.post('/contracts/terms-of-payment', { name });
    const newTerm = res.data;
    setOptions(prev => ({ ...prev, termsOfPayment: [...prev.termsOfPayment, newTerm] }));
    return newTerm;
  };

  const totalWeight = formData.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
  const totalPrice  = formData.items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.pricePerKg) || 0)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) { setError('Please add at least one product'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/contracts/create', formData);
      navigate('/contracts');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate contract');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
      </div>
    );
  }

  const customerSelected = !!formData.customerId;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/contracts')} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate New Contract</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to create a formal export contract</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100">{error}</div>
        )}

        {/* ── Basic Information ─────────────────────────────── */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <SectionHeader icon={<Info className="w-5 h-5" />} title="Basic Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Contract Name / Reference *</label>
              <input required name="name" value={formData.name} onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                placeholder="e.g. DCS-Q2-2026" />
            </div>
            <CustomSelect label="Customer *" required options={options.customers} value={formData.customerId}
              onChange={(val) => setFormData(p => ({ ...p, customerId: val }))} placeholder="Select Customer" />
          </div>
        </section>

        {/* ── Parties (Consignee, Buyer, Notify, Contact) ──── */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <SectionHeader icon={<Users className="w-5 h-5" />} title="Parties" subtitle={!customerSelected ? 'Select a customer first to load parties' : ''} />

          {partiesLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading parties...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CustomSelect label="Consignee" options={parties.consignees}
                value={formData.consigneeId} onChange={(val) => setFormData(p => ({ ...p, consigneeId: val }))}
                placeholder={customerSelected ? 'Select Consignee' : 'Select a customer first'}
                onCreate={customerSelected ? makePartyCreator('consignee', 'consignees') : undefined}
                createLabel="Create new consignee" />

              <CustomSelect label="Buyer" options={parties.buyers}
                value={formData.buyerId} onChange={(val) => setFormData(p => ({ ...p, buyerId: val }))}
                placeholder={customerSelected ? 'Select Buyer' : 'Select a customer first'}
                onCreate={customerSelected ? makePartyCreator('buyer', 'buyers') : undefined}
                createLabel="Create new buyer" />

              <CustomSelect label="Notify Party" options={parties.notifyParties}
                value={formData.notifyPartyId} onChange={(val) => setFormData(p => ({ ...p, notifyPartyId: val }))}
                placeholder={customerSelected ? 'Select Notify Party' : 'Select a customer first'}
                onCreate={customerSelected ? makePartyCreator('notifyParty', 'notifyParties') : undefined}
                createLabel="Create new notify party" />

              <CustomSelect label="Contact Person" options={parties.contactPersons}
                value={formData.contactPersonId} onChange={(val) => setFormData(p => ({ ...p, contactPersonId: val }))}
                placeholder={customerSelected ? 'Select Contact Person' : 'Select a customer first'}
                onCreate={customerSelected ? makePartyCreator('contactPerson', 'contactPersons') : undefined}
                createLabel="Create new contact person" />
            </div>
          )}
        </section>

        {/* ── Logistics ─────────────────────────────────────── */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <SectionHeader icon={<Truck className="w-5 h-5" />} title="Logistics & Shipping" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Field label="Country of Origin" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange} />
            <Field label="Country of Destination *" name="countryOfDestination" value={formData.countryOfDestination} onChange={handleChange} required placeholder="e.g. China" />
            <CustomSelect label="Pre-Carriage By" options={[{ id: 'Sea', name: 'Sea' }, { id: 'Air', name: 'Air' }, { id: 'Road', name: 'Road' }]}
              value={formData.preCarriageBy} onChange={(val) => setFormData(p => ({ ...p, preCarriageBy: val }))} searchable={false} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Port of Loading" name="portOfLoading" value={formData.portOfLoading} onChange={handleChange} placeholder="e.g. Mundra Port" />
            <Field label="Port of Final Destination" name="portOfFinalDestination" value={formData.portOfFinalDestination} onChange={handleChange} placeholder="e.g. New York Port" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Exp. Departure Date" name="expectedDepartureDate" type="date" value={formData.expectedDepartureDate} onChange={handleChange} />
            <Field label="Exp. Delivery Date" name="expectedDeliveryDate" type="date" value={formData.expectedDeliveryDate} onChange={handleChange} />
          </div>
        </section>

        {/* ── Products ──────────────────────────────────────── */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <SectionHeader icon={<Package className="w-5 h-5" />} title="Product Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <CustomSelect label="Add Product" options={options.products} value=""
              onChange={handleProductSelect} placeholder="Search and add product..." />
            <CustomSelect label="Terms of Payment *" required options={options.termsOfPayment}
              value={formData.termsOfPaymentId} onChange={(val) => setFormData(p => ({ ...p, termsOfPaymentId: val }))}
              placeholder="Select Payment Terms"
              onCreate={handleCreateTermsOfPayment} createLabel="Create new payment term" />
          </div>

          <div className="overflow-hidden border border-gray-100 rounded-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4 w-32">Qty (KG)</th>
                  <th className="px-6 py-4 w-32">Price/KG</th>
                  <th className="px-6 py-4 w-32 text-right">Total</th>
                  <th className="px-6 py-4 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {formData.items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-400 text-sm font-medium italic">
                      No products added yet.
                    </td>
                  </tr>
                ) : formData.items.map((item) => (
                  <tr key={item.productId}>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-xs text-gray-500 uppercase">{item.skuCode}</td>
                    <td className="px-6 py-4">
                      <input type="number" step="0.01" value={item.quantity}
                        onChange={(e) => handleItemChange(item.productId, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-100 focus:border-[#003366]/30 focus:outline-none text-sm font-medium" />
                    </td>
                    <td className="px-6 py-4">
                      <input type="number" step="0.01" value={item.pricePerKg}
                        onChange={(e) => handleItemChange(item.productId, 'pricePerKg', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-100 focus:border-[#003366]/30 focus:outline-none text-sm font-medium" />
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-[#003366]">
                      ${((parseFloat(item.quantity) || 0) * (parseFloat(item.pricePerKg) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button type="button" onClick={() => handleRemoveItem(item.productId)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              {formData.items.length > 0 && (
                <tfoot className="bg-gray-50/50 border-t border-gray-100">
                  <tr className="text-sm font-bold text-gray-900">
                    <td colSpan="2" className="px-6 py-4 text-right">Summary:</td>
                    <td className="px-6 py-4 text-[#003366]">{totalWeight.toFixed(2)} KG</td>
                    <td className="px-6 py-4" />
                    <td className="px-6 py-4 text-right text-lg text-[#003366]">
                      ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>

        {/* ── Additional Details ────────────────────────────── */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <SectionHeader icon={<FileText className="w-5 h-5" />} title="Additional Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field label="Packing Instructions" name="packing" value={formData.packing} onChange={handleChange} placeholder="e.g. Export Worthy Packing" />
            <Field label="Insurance Details" name="insurance" value={formData.insurance} onChange={handleChange} placeholder="e.g. Covered by Seller" />
            <Field label="Operating Airlines" name="operatingAirlines" value={formData.operatingAirlines} onChange={handleChange} placeholder="e.g. Emirates" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">Special Conditions</label>
            <textarea name="speacialCondition" value={formData.speacialCondition} onChange={handleChange} rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50 resize-none" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">Please Note</label>
            <textarea name="note" value={formData.note} onChange={handleChange} rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50 resize-none" />
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/contracts')}
            className="px-8 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-white transition-colors border border-transparent hover:border-gray-100">
            Cancel
          </button>
          <button disabled={submitting} type="submit"
            className="bg-[#003366] text-white px-10 py-3 rounded-xl font-bold text-sm hover:bg-[#004080] transition-all shadow-xl shadow-[#003366]/20 flex items-center gap-2 disabled:opacity-70">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Save className="w-4 h-4" /> Generate Contract</>}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Small reusable sub-components ─────────────────────────────────────────
function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
      <div className="p-2 bg-blue-50 rounded-lg text-[#003366]">{icon}</div>
      <div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, type = 'text', required }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 ml-1">{label}</label>
      <input required={required} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50" />
    </div>
  );
}
