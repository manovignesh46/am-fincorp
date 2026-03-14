import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Member } from '../../types';

interface MemberFormData {
  name: string;
  contact: string;
  email: string;
  address: string;
}

interface MemberFormProps {
  onSubmit: (data: MemberFormData) => void;
  initialData?: Member | null;
  isLoading?: boolean;
}

const MemberForm = ({ onSubmit, initialData = null, isLoading = false }: MemberFormProps) => {
  const [formData, setFormData] = useState<MemberFormData>({
    name: initialData?.name || '',
    contact: initialData?.contact || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
        <input
          type="text"
          name="name"
          required
          className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
          placeholder="e.g. John Doe"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contact Number</label>
        <input
          type="text"
          name="contact"
          required
          className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
          placeholder="e.g. 9876543210"
          value={formData.contact}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email (Optional)</label>
        <input
          type="email"
          name="email"
          className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
          placeholder="e.g. john@example.com"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Address</label>
        <textarea
          name="address"
          rows={3}
          className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm resize-none"
          placeholder="Full residential address..."
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-3 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <span>{initialData ? 'Update Member' : 'Create Member'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default MemberForm;
