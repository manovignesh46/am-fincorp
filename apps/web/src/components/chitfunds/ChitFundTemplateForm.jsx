import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const ChitFundTemplateForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    totalAmount: initialData?.totalAmount || '',
    monthlyContribution: initialData?.monthlyContribution || '',
    durationMonths: initialData?.durationMonths || '',
    description: initialData?.description || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      totalAmount: parseFloat(formData.totalAmount),
      monthlyContribution: parseFloat(formData.monthlyContribution),
      durationMonths: parseInt(formData.durationMonths, 10),
    });
  };

  const inputClass =
    'block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm';
  const labelClass = 'text-xs font-bold text-slate-500 uppercase tracking-wider ml-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className={labelClass}>Template Name</label>
        <input
          type="text"
          name="name"
          required
          placeholder="e.g. Gold Plan – ₹1L"
          className={inputClass}
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Total Amount (₹)</label>
          <input
            type="number"
            name="totalAmount"
            required
            min="1"
            step="any"
            placeholder="e.g. 100000"
            className={inputClass}
            value={formData.totalAmount}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Monthly Contribution (₹)</label>
          <input
            type="number"
            name="monthlyContribution"
            required
            min="1"
            step="any"
            placeholder="e.g. 10000"
            className={inputClass}
            value={formData.monthlyContribution}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Duration (Months)</label>
        <input
          type="number"
          name="durationMonths"
          required
          min="1"
          placeholder="e.g. 10"
          className={inputClass}
          value={formData.durationMonths}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Description (Optional)</label>
        <textarea
          name="description"
          rows={2}
          placeholder="Any notes about this template..."
          className={`${inputClass} resize-none`}
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-blue-100"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : initialData ? (
          'Update Template'
        ) : (
          'Create Template'
        )}
      </button>
    </form>
  );
};

export default ChitFundTemplateForm;
