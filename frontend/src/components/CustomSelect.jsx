import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Plus, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select option", 
  label,
  required = false,
  searchable = true,
  onCreate = null,       // async fn(name) => newOption {id, name} — enables "create new" mode
  createLabel = 'Create new',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [createInput, setCreateInput] = useState('');
  const [createError, setCreateError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = value ? options.find(opt => opt.id.toString() === value.toString()) : null;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setCreating(false);
        setCreateInput('');
        setCreateError('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!createInput.trim()) {
      setCreateError('Name cannot be empty');
      return;
    }
    setCreateLoading(true);
    setCreateError('');
    try {
      const newOption = await onCreate(createInput.trim());
      onChange(newOption.id);
      setIsOpen(false);
      setCreating(false);
      setCreateInput('');
    } catch (err) {
      setCreateError(err.response?.data?.error || err.message || 'Failed to create');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-1 relative" ref={containerRef}>
      {label && (
        <label className="text-xs font-bold text-gray-500 ml-1">
          {label} {required && '*'}
        </label>
      )}
      
      <div 
        onClick={() => { setIsOpen(!isOpen); setCreating(false); setCreateError(''); }}
        className={`w-full px-4 py-3 rounded-xl border transition-all text-sm cursor-pointer flex justify-between items-center bg-gray-50/50 ${
          isOpen ? 'ring-2 ring-[#003366]/10 border-[#003366]' : 'border-gray-200'
        }`}
      >
        <span className={selectedOption ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
          >
            {searchable && !creating && (
              <div className="p-3 border-b border-gray-50">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-50 border border-gray-100 text-xs focus:outline-none focus:border-[#003366]/30 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Create-new inline form */}
            {creating && (
              <div className="p-3 border-b border-gray-50 space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{createLabel}</p>
                <input
                  autoFocus
                  type="text"
                  value={createInput}
                  onChange={(e) => { setCreateInput(e.target.value); setCreateError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') { setCreating(false); setCreateInput(''); } }}
                  placeholder={`e.g. 50% Advance`}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-[#003366]/50 transition-all"
                />
                {createError && (
                  <p className="text-[10px] text-red-500 font-semibold">{createError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={createLoading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#003366] text-white text-xs font-bold hover:bg-[#004080] transition-colors disabled:opacity-60"
                  >
                    {createLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCreating(false); setCreateInput(''); setCreateError(''); }}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {!creating && (
              <div className="max-h-52 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400 font-medium italic">
                    No results found
                  </div>
                ) : (
                  filteredOptions.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => {
                        onChange(opt.id);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={`px-4 py-3 text-sm cursor-pointer transition-colors flex justify-between items-center ${
                        value && value.toString() === opt.id.toString()
                          ? 'bg-blue-50 text-[#003366] font-bold'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {opt.name}
                      {value && value.toString() === opt.id.toString() && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#003366]" />
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Create new trigger footer */}
            {onCreate && !creating && (
              <div
                onClick={() => { setCreating(true); setSearchTerm(''); }}
                className="px-4 py-3 flex items-center gap-2 text-xs font-bold text-[#003366] cursor-pointer hover:bg-blue-50 border-t border-gray-50 transition-colors"
              >
                <div className="w-5 h-5 rounded-md bg-[#003366] flex items-center justify-center">
                  <Plus className="w-3 h-3 text-white" />
                </div>
                {createLabel}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
