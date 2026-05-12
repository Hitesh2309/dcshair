import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FileText, Search, Plus, Loader2, Calendar, User, MapPin, Download, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewState, setPreviewState] = useState({ open: false, url: null, name: '', loading: false });
  const navigate = useNavigate();

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contracts/list');
      setContracts(res.data);
    } catch (err) {
      console.error('Error fetching contracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // Revoke blob URL when modal closes to free memory
  useEffect(() => {
    return () => {
      if (previewState.url) window.URL.revokeObjectURL(previewState.url);
    };
  }, [previewState.url]);

  const handlePreview = async (e, contract) => {
    e.stopPropagation();
    setPreviewState({ open: true, url: null, name: contract.name, loading: true });
    try {
      const response = await api.get(`/contracts/${contract.id}/preview`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setPreviewState({ open: true, url: blobUrl, name: contract.name, loading: false });
    } catch (err) {
      console.error('Preview failed:', err);
      setPreviewState({ open: false, url: null, name: '', loading: false });
      alert('Failed to load PDF preview');
    }
  };

  const handleDownload = async (e, contract) => {
    e.stopPropagation();
    try {
      const response = await api.get(`/contracts/${contract.id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contract-${contract.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download PDF');
    }
  };

  const closePreview = () => {
    if (previewState.url) window.URL.revokeObjectURL(previewState.url);
    setPreviewState({ open: false, url: null, name: '', loading: false });
  };

  const filteredContracts = contracts.filter(contract =>
    contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and generate export contracts</p>
        </div>
        <button
          onClick={() => navigate('/contracts/generate')}
          className="bg-[#003366] text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-[#004080] transition-all shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Generate Contract
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by contract name or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#003366]/10 focus:border-[#003366] transition-all text-sm"
            />
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            {filteredContracts.length} Total Contracts
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-8 py-4 font-semibold">Contract Details</th>
                <th className="px-8 py-4 font-semibold">Customer</th>
                <th className="px-8 py-4 font-semibold">Origin/Dest</th>
                <th className="px-8 py-4 font-semibold">Date</th>
                <th className="px-8 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
                      <span className="text-gray-400 font-medium">Loading contracts...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-10 h-10 text-gray-200" />
                      <span className="text-gray-400 font-medium">No contracts found</span>
                    </div>
                  </td>
                </tr>
              ) : filteredContracts.map((contract) => (
                <tr
                  key={contract.id}
                  className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                  onClick={(e) => handlePreview(e, contract)}
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#003366]">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{contract.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-0.5 font-semibold">#CTR-{contract.id.toString().padStart(4, '0')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <User className="w-4 h-4 text-gray-400" />
                      {contract.customer?.name}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-700">{contract.countryOfOrigin}</span>
                      <span className="text-gray-300">→</span>
                      <span className="text-gray-700">{contract.countryOfDestination}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(contract.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(e) => handlePreview(e, contract)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-[#003366] transition-all active:scale-90"
                        title="Preview PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDownload(e, contract)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-all active:scale-90"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {previewState.open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closePreview}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#003366] rounded-lg">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">{previewState.name}</h2>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Contract PDF Preview</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={closePreview}
                    className="p-2 hover:bg-gray-200 rounded-xl text-gray-500 hover:text-gray-700 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PDF Viewer */}
              <div className="flex-1 bg-gray-100 overflow-hidden">
                {previewState.loading ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-[#003366]" />
                    <p className="text-sm font-semibold text-gray-500">Generating PDF...</p>
                  </div>
                ) : (
                  <iframe
                    src={previewState.url}
                    className="w-full h-full border-0"
                    title="Contract PDF Preview"
                  />
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
