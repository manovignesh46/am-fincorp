import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRightLeft } from 'lucide-react';
import axios from 'axios';
import { TransactionNature, TransactionCategory } from '../../types';

interface ManualCategory {
  value: TransactionCategory;
  label: string;
}

const MANUAL_CATEGORIES: ManualCategory[] = [
  { value: 'RECORD_AMOUNT', label: 'Record Amount (Cash)' },
  { value: 'DOCUMENT_CHARGE', label: 'Document Charge' },
  { value: 'PARTNER_TO_PARTNER', label: 'Partner to Partner Transfer' },
];

interface Partner {
  id: number;
  name: string;
  email: string;
}

interface TransactionFormData {
  nature: TransactionNature;
  category: TransactionCategory;
  amount: string;
  date: string;
  note: string;
  toUserId: string; // only used for P2P
}

interface TransactionFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
  isLoading?: boolean;
}

const TransactionForm = ({ onSubmit, isLoading = false }: TransactionFormProps) => {
  const today = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState<TransactionFormData>({
    nature: 'CREDIT',
    category: 'RECORD_AMOUNT',
    amount: '',
    date: today,
    note: '',
    toUserId: '',
  });

  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);

  const isP2P = formData.category === 'PARTNER_TO_PARTNER';

  // Fetch partners list when form mounts (needed for To Partner dropdown)
  useEffect(() => {
    const fetchPartners = async () => {
      setPartnersLoading(true);
      try {
        const res = await axios.get<{ data: Partner[] }>('/users');
        setPartners(res.data.data);
      } catch {
        // silently ignore; will show empty dropdown
      } finally {
        setPartnersLoading(false);
      }
    };
    fetchPartners();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isP2P) {
      if (!formData.toUserId) {
        alert('Please select a partner to transfer to.');
        return;
      }
      // For P2P: send toUserId + category + amount + date + note (no nature)
      onSubmit({
        category: formData.category,
        toUserId: parseInt(formData.toUserId),
        amount: parseFloat(formData.amount),
        date: formData.date,
        note: formData.note,
      });
    } else {
      onSubmit({ ...formData, amount: parseFloat(formData.amount) });
    }
  };

  const inputClass =
    'block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm';
  const labelClass = 'text-xs font-bold text-slate-500 uppercase tracking-wider ml-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Category — always first */}
      <div className="space-y-1.5">
        <label className={labelClass}>Category</label>
        <select name="category" className={inputClass} value={formData.category} onChange={handleChange}>
          {MANUAL_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Nature toggle — shown for non-P2P categories */}
      {!isP2P && (
        <div className="space-y-1.5">
          <label className={labelClass}>Nature</label>
          <div className="grid grid-cols-2 gap-2">
            {(['CREDIT', 'DEBIT'] as TransactionNature[]).map((n) => (
              <label
                key={n}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 cursor-pointer font-bold text-sm transition-all ${
                  formData.nature === n
                    ? n === 'CREDIT'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-rose-500 bg-rose-50 text-rose-700'
                    : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="nature"
                  value={n}
                  checked={formData.nature === n}
                  onChange={handleChange}
                  className="sr-only"
                />
                {n === 'CREDIT' ? '▲ CREDIT' : '▼ DEBIT'}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* To Partner — only for P2P */}
      {isP2P && (
        <div className="space-y-1.5">
          <label className={labelClass}>To Partner</label>
          <div className="relative">
            <ArrowRightLeft
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <select
              name="toUserId"
              required={isP2P}
              className={`${inputClass} pl-9`}
              value={formData.toUserId}
              onChange={handleChange}
              disabled={partnersLoading}
            >
              <option value="">
                {partnersLoading ? 'Loading partners…' : '— Select receiving partner —'}
              </option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          {/* P2P hint */}
          <p className="text-xs text-slate-400 ml-1 mt-1">
            Amount will be <span className="text-rose-500 font-semibold">debited</span> from your account and{' '}
            <span className="text-emerald-600 font-semibold">credited</span> to the selected partner.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Amount (₹)</label>
          <input
            type="number"
            name="amount"
            required
            min="1"
            step="any"
            placeholder="e.g. 5000"
            className={inputClass}
            value={formData.amount}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Date</label>
          <input
            type="date"
            name="date"
            required
            className={inputClass}
            value={formData.date}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Note (Optional)</label>
        <input
          type="text"
          name="note"
          placeholder={isP2P ? 'e.g. Settling March expenses' : 'e.g. Cash deposit by partner'}
          className={inputClass}
          value={formData.note}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-blue-100"
      >
        {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Record Transaction'}
      </button>
    </form>
  );
};

export default TransactionForm;
