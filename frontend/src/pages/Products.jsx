import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Package, Search, Plus, X, Loader2, Image as ImageIcon, Barcode, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  console.log(products);

  const [formData, setFormData] = useState({
    name: '',
    size: '',
    imageUrl: '',
    skuCode: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/products/get`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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
      await api.post('/products/create', formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        size: '',
        imageUrl: '',
        skuCode: ''
      });
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add product. Please check if SKU is unique.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.skuCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage hair care products and inventory</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#003366] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#004080] transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm"
            />
          </div>

          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {filteredProducts.length} Total Products
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-8 py-4 font-semibold">Product</th>
                <th className="px-8 py-4 font-semibold">SKU Code</th>
                <th className="px-8 py-4 font-semibold">Size</th>
                <th className="px-8 py-4 font-semibold">Added On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
                      <span className="text-gray-400 font-medium">Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="w-10 h-10 text-gray-200" />
                      <span className="text-gray-400 font-medium">No products found</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{product.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-0.5 font-semibold">ID: PRD-{product.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#003366] bg-blue-50 px-2.5 py-1 rounded-lg w-fit border border-blue-100">
                      <Barcode className="w-3 h-3" />
                      {product.skuCode}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Layers className="w-4 h-4 text-gray-400" />
                      {product.size || '—'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500 font-medium">
                    {new Date(product.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
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
              className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden relative z-10 border border-gray-100"
            >
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
                  <p className="text-sm text-gray-500 mt-1">Register a new product in the catalog</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2.5 hover:bg-white hover:shadow-sm rounded-xl text-gray-400 hover:text-gray-600 transition-all border border-transparent hover:border-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 ml-1">Product Name *</label>
                  <input
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                    placeholder="e.g. Premium Hair Serum"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">SKU Code *</label>
                    <input
                      required
                      name="skuCode"
                      value={formData.skuCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50 uppercase"
                      placeholder="DCS-HS-001"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">Size (in KG)</label>
                    <input
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                      placeholder="e.g. 1"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 ml-1">Image URL</label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm bg-gray-50/50"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="flex-[2] bg-[#003366] text-white px-4 py-3 rounded-xl font-bold text-sm hover:bg-[#004080] transition-all shadow-lg shadow-[#003366]/20 flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add to Catalog
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
