import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE', 'COMPLETED', 'CLOSED'];

const ChitFundForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const [templates, setTemplates] = useState([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    templateId: initialData?.templateId || '',
    totalAmount: initialData?.totalAmount || '',
    monthlyContribution: initialData?.monthlyContribution || '',
    duration: initialData?.duration || '',
    startDate: initialData?.startDate ? initialData.startDate.slice(0, 10) : '',
    status: initialData?.status || 'ACTIVE',
    currentMonth: initialData?.currentMonth || 1,
  });

  useEffect(() => {
    axios.get('/chit-fund-templates').then((res) => setTemplates(res.data.data)).catch(() => {});
  }, []);

  const handleTemplateSelect = (e) => {
    const id = e.target.value;
    if (!id) {
      setFormData((prev) => ({ ...prev, templateId: '' }));
      return;
    }
    const tpl = templates.find((t) => String(t.id) === String(id));
    if (tpl) {
      setFormData((prev) => ({
        ...prev,
        templateId: id,
        totalAmount: tpl.totalAmount,
        monthlyContribution: tpl.monthlyContribution,
        duration: tpl.durationMonths,
      }));
    }
  };

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
      duration: parseInt(formData.duration, 10),
      currentMonth: parseInt(formData.currentMonth, 10),
      templateId: formData.templateId || null,
    });
  };

  const inputClass =
    'block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm';
  const labelClass = 'text-xs font-bold text-slate-500 uppercase tracking-wider ml-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Template selector */}
      <div className="space-y-1.5">
        <label className={labelClass}>Use a Template (Optional)</label>
        <select
          name="templateId"
          className={inputClass}
          value={formData.templateId}
          onChange={handleTemplateSelect}
        >
          <option value="">— Select a template to auto-fill —</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.durationMonths} months)
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass}>Fund Name</label>
        <input
          type="text"
          name="name"
          required
          placeholder="e.g. Gold Chit – Batch A"
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
          <label className={labelClass}>Monthly (₹)</label>
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Duration (Months)</label>
          <input
            type="number"
            name="duration"
            required
            min="1"
            placeholder="e.g. 10"
            className={inputClass}
            value={formData.duration}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Current Month</label>
          <input
            type="number"
            name="currentMonth"
            min="1"
            className={inputClass}
            value={formData.currentMonth}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass}>Start Date</label>
          <input
            type="date"
            name="startDate"
            required
            className={inputClass}
            value={formData.startDate}
            onChange={handleChange}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass}>Status</label>
          <select name="status" className={inputClass} value={formData.status} onChange={handleChange}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-blue-100"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={18} />
        ) : initialData ? (
          'Update Chit Fund'
        ) : (
          'Create Chit Fund'
        )}
      </button>
    </form>
  );
};

export default ChitFundForm;
