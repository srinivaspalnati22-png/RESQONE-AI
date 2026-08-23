import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Trash2, X, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export function EmergencyContactsModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const { familyContacts, updateFamilyContacts } = useAuth();
  const [contacts, setContacts] = useState(familyContacts || []);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Father');

  useEffect(() => {
    if (familyContacts) {
      setContacts(familyContacts);
    }
  }, [familyContacts, isOpen]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    const newContact = {
      id: `fc-${Date.now()}`,
      name,
      phone,
      relation
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
    updateFamilyContacts(updated);
    setName('');
    setPhone('');
  };

  const handleDelete = (id) => {
    const filtered = contacts.filter(c => c.id !== id);
    setContacts(filtered);
    updateFamilyContacts(filtered);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-[#0B1220] border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl z-10 space-y-4"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5 text-red-400 font-black text-lg">
              <Users className="w-5 h-5" />
              <span>5 Family Emergency SOS Contacts</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Add Contact Form (If less than 5) */}
          {contacts.length < 5 ? (
            <form onSubmit={handleAdd} className="bg-[#050A14] p-3.5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-red-400" />
                <span>Add Emergency Relative ({contacts.length}/5 Registered)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Relative Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="+91-9440000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="flex-1 bg-[#0B1220] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Brother / Sister</option>
                  <option value="Child">Son / Daughter</option>
                  <option value="Friend">Best Friend</option>
                  <option value="Doctor">Doctor</option>
                </select>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Add Contact
                </button>
              </div>
            </form>
          ) : (
            <div className="text-xs text-emerald-400 bg-emerald-950/40 p-3 rounded-2xl border border-emerald-800/60 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Full 5/5 Emergency Safety Net Configured! Automatic location alerts ready.</span>
            </div>
          )}

          {/* Contact List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {contacts.map((c, idx) => (
              <div
                key={c.id || idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#050A14] border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400 font-bold text-xs">
                    #{idx + 1}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">{c.name}</h5>
                    <p className="text-[11px] text-slate-400 font-mono">{c.phone} • <span className="text-red-400 font-semibold">{c.relation}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Done & Save
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
