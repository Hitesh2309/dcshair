import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { 
  FileText, ArrowLeft, Loader2, Save, User, 
  MapPin, CreditCard, Package, Info, Truck, Calendar, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import CustomSelect from '../components/CustomSelect';

export default function GenerateContract() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [options, setOptions] = useState({ customers: [], products: [], termsOfPayment: [] });
  const [error, setError] = useState('');

  const handleCreateTermsOfPayment = async (name) => {
    const res = await api.post('/contracts/terms-of-payment', { name });
    const newTerm = res.data;
    setOptions(prev => ({
      ...prev,
      termsOfPayment: [...prev.termsOfPayment, newTerm]
    }));
    return newTerm;
  };

  const [formData, setFormData] = useState({
    name: '',
    customerId: '',
    termsOfPaymentId: '',
    items: [], // Array of { productId, quantity, pricePerKg }
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
    const fetchOptions = async () => {
      try {
        const res = await api.get('/contracts/options');
        setOptions(res.data);
      } catch (err) {
        console.error('Error fetching options:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (productId) => {
    const product = options.products.find(p => p.id === productId);
    if (!product) return;

    if (formData.items.some(item => item.productId === productId)) return;

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { 
        productId, 
        name: product.name, 
        skuCode: product.skuCode,
        quantity: 0, 
        pricePerKg: 0 
      }]
    }));
  };

  const handleRemoveItem = (productId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId)
    }));
  };

  const handleItemChange = (productId, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.productId === productId ? { ...item, [field]: value } : item
      )
    }));
  };

  const totalWeight = formData.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0), 0);
  const totalPrice = formData.items.reduce((sum, item) => sum + ((parseFloat(item.quantity) || 0) * (parseFloat(item.pricePerKg) || 0)), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      setError('Please add at least one product');
      return;
    }
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/contracts')}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate New Contract</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to create a formal export contract</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-[#003366]">
              <Info className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Contract Name / Reference *</label>
              <input
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                placeholder="e.g. Contract for DCS Hair Serum - Q2"
              />
            </div>
            <CustomSelect 
              label="Customer"
              required
              options={options.customers}
              value={formData.customerId}
              onChange={(val) => setFormData(p => ({ ...p, customerId: val }))}
              placeholder="Select Customer"
            />
          </div>
        </section>

        {/* Logistic Details */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-[#003366]">
              <Truck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Logistics & Shipping</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Country of Origin</label>
              <input
                name="countryOfOrigin"
                value={formData.countryOfOrigin}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Country of Destination *</label>
              <input
                required
                name="countryOfDestination"
                value={formData.countryOfDestination}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                placeholder="e.g. USA"
              />
            </div>
            <CustomSelect 
              label="Pre-Carriage By"
              options={[
                { id: 'Sea', name: 'Sea' },
                { id: 'Air', name: 'Air' },
                { id: 'Road', name: 'Road' }
              ]}
              value={formData.preCarriageBy}
              onChange={(val) => setFormData(p => ({ ...p, preCarriageBy: val }))}
              searchable={false}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Port of Loading</label>
              <input
                name="portOfLoading"
                value={formData.portOfLoading}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                placeholder="e.g. Mundra Port"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Port of Final Destination</label>
              <input
                name="portOfFinalDestination"
                value={formData.portOfFinalDestination}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                placeholder="e.g. New York Port"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Exp. Departure Date</label>
              <input
                type="date"
                name="expectedDepartureDate"
                value={formData.expectedDepartureDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Exp. Delivery Date</label>
              <input
                type="date"
                name="expectedDeliveryDate"
                value={formData.expectedDeliveryDate}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
              />
            </div>
          </div>
        </section>

        {/* Product Selection & Table */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-[#003366]">
              <Package className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Product Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <CustomSelect 
              label="Select Product to Add"
              options={options.products}
              value=""
              onChange={handleProductSelect}
              placeholder="Search and add product..."
            />
            <CustomSelect 
              label="Terms of Payment *"
              required
              options={options.termsOfPayment}
              value={formData.termsOfPaymentId}
              onChange={(val) => setFormData(p => ({ ...p, termsOfPaymentId: val }))}
              placeholder="Select Payment Terms"
              onCreate={handleCreateTermsOfPayment}
              createLabel="Create new payment term"
            />
          </div>

          <div className="mt-4 overflow-hidden border border-gray-100 rounded-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4 w-32">Qty (KG)</th>
                  <th className="px-6 py-4 w-32">Price/KG</th>
                  <th className="px-6 py-4 w-32 text-right">Total</th>
                  <th className="px-6 py-4 w-16 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {formData.items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-400 text-sm font-medium italic">
                      No products added to this contract yet.
                    </td>
                  </tr>
                ) : (
                  formData.items.map((item) => (
                    <tr key={item.productId} className="group">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">{item.name}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 uppercase">{item.skuCode}</td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(item.productId, 'quantity', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-100 focus:border-[#003366]/30 focus:outline-none text-sm font-medium"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.01"
                          value={item.pricePerKg}
                          onChange={(e) => handleItemChange(item.productId, 'pricePerKg', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-100 focus:border-[#003366]/30 focus:outline-none text-sm font-medium"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-bold text-[#003366]">
                          ${((parseFloat(item.quantity) || 0) * (parseFloat(item.pricePerKg) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          type="button"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {formData.items.length > 0 && (
                <tfoot className="bg-gray-50/50 border-t border-gray-100">
                  <tr className="text-sm font-bold text-gray-900">
                    <td colSpan="2" className="px-6 py-4 text-right">Summary:</td>
                    <td className="px-6 py-4 text-[#003366]">{totalWeight.toFixed(2)} KG</td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4 text-right text-lg text-[#003366]">
                      ${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>

        {/* Other Details */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-[#003366]">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Additional Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Packing Instructions</label>
              <input
                name="packing"
                value={formData.packing}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                placeholder="e.g. Standard Palletizing"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 ml-1">Insurance Details</label>
              <input
                name="insurance"
                value={formData.insurance}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                placeholder="e.g. Covered by Seller"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 ml-1">Special Conditions</label>
            <textarea
              name="speacialCondition"
              value={formData.speacialCondition}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50 resize-none"
            />
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/contracts')}
            className="px-8 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-white transition-colors border border-transparent hover:border-gray-100"
          >
            Cancel
          </button>
          <button
            disabled={submitting}
            type="submit"
            className="bg-[#003366] text-white px-10 py-3 rounded-xl font-bold text-sm hover:bg-[#004080] transition-all shadow-xl shadow-[#003366]/20 flex items-center gap-2 disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Generate Contract
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
