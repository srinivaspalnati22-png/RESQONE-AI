import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Trash2, X, Phone, ShieldCheck } from 'lucide-react';
import { getEmergencyContacts, saveEmergencyContact } from '../services/sos_service';
import { useLanguage } from '../context/LanguageContext';

export function EmergencyContactsModal({ isOpen, onClose }) {
  const { t } = useLanguage();
  const [contacts, setContacts] = useState([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Father');

  useEffect(() => {
    if (isOpen) {
      loadContacts();
    }
  }, [isOpen]);

  const loadContacts = async () => {
    const data = await getEmergencyContacts();
    setContacts(data);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !phone) return;

    const updated = await saveEmergencyContact(null, { name, phone, relation });
    setContacts(updated);
    setName('');
    setPhone('');
  };

  const handleDelete = (id) => {
    const filtered = contacts.filter(c => c.id !== id);
    localStorage.setItem('resqone_emergency_contacts', JSON.stringify(filtered));
    setContacts(filtered);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3 text-red-400 font-bold text-xl">
              <Users className="w-6 h-6" />
              <span>{t('emergency_contacts_title')}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Add Contact Form */}
          {contacts.length < 5 ? (
            <form onSubmit={handleAdd} className="mb-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-red-400" />
                {t('add_contact_btn')} ({contacts.length}/5)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={t('contact_name')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 min-h-[44px]"
                  required
                />
                <input
                  type="tel"
                  placeholder={t('contact_phone')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500 min-h-[44px]"
                  required
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500 min-h-[44px]"
                >
                  <option value="Father">{t('relation_father')}</option>
                  <option value="Mother">{t('relation_mother')}</option>
                  <option value="Brother">{t('relation_brother')}</option>
                  <option value="Sister">{t('relation_sister')}</option>
                  <option value="Spouse">{t('relation_spouse')}</option>
                  <option value="Other">{t('relation_other')}</option>
                </select>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-sm transition-colors min-h-[44px]"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <p className="text-xs text-amber-400 bg-amber-950/40 p-3 rounded-lg border border-amber-800 mb-4">
              Maximum 5 emergency contacts reached. Delete a contact to add a new relative.
            </p>
          )}

          {/* Contact List */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">{c.name}</h5>
                    <p className="text-xs text-slate-400">{c.phone} • <span className="text-red-400 font-medium">{c.relation}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  title="Delete Contact"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm min-h-[44px]"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
