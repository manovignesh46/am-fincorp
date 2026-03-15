import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { ChitFund, ChitFundTemplate, ChitFundStatus } from '../../types';

const STATUS_OPTIONS: ChitFundStatus[] = ['ACTIVE', 'INACTIVE', 'COMPLETED', 'CLOSED'];

interface ChitFundFormData {
  name: string;
  description: string;
  templateId: string;
  totalAmount: string;
  duration: string;
  startDate: string;
  status: ChitFundStatus;
}

interface ChitFundFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
  initialData?: ChitFund | null;
  isLoading?: boolean;
}

const ChitFundForm = ({ onSubmit, initialData = null, isLoading = false }: ChitFundFormProps) => {
  const [templates, setTemplates] = useState<ChitFundTemplate[]>([]);
  const [formData, setFormData] = useState<ChitFundFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    templateId: initialData?.templateId ? String(initialData.templateId) : '',
    totalAmount: initialData?.totalAmount ? String(initialData.totalAmount) : '',
    duration: initialData?.duration ? String(initialData.duration) : '',
    startDate: initialData?.startDate ? initialData.startDate.slice(0, 10) : '',
    status: initialData?.status || 'ACTIVE',
  });

  useEffect(() => {
    axios.get<{ data: ChitFundTemplate[] }>('/chit-fund-templates')
      .then((res) => setTemplates(res.data.data))
      .catch(() => {});
  }, []);

  const handleTemplateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (!id) {
      setFormData((prev) => ({ ...prev, templateId: '' }));
      return;
    }
    const tpl = templates.find((t) => String(t.id) === id);
    if (tpl) {
      setFormData((prev) => ({
        ...prev,
        templateId: id,
        totalAmount: String(tpl.totalAmount),
        duration: String(tpl.durationMonths),
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      totalAmount: parseFloat(formData.totalAmount),
      duration: parseInt(formData.duration, 10),
      currentMonth: 1,
      description: formData.description || null,
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
        <label className={labelClass}>Template <span className="text-rose-500">*</span></label>
        <select
          name="templateId"
          required
          className={inputClass}
          value={formData.templateId}
          onChange={handleTemplateSelect}
        >
          <option value="">— Select a template —</option>
          {templates.map((t) => {
            // Use monthlyContribution if set; otherwise average the monthlySchedule
            const contrib = t.monthlyContribution
              ?? (t.monthlySchedule && t.monthlySchedule.length > 0
                ? Math.round(
                    t.monthlySchedule.reduce((sum, s) => sum + s.contributionAmount, 0) /
                    t.monthlySchedule.length
                  )
                : null);
            const contribLabel = contrib != null
              ? `₹${Number(contrib).toLocaleString('en-IN')}/mo`
              : `${t.durationMonths} months`;
            return (
              <option key={t.id} value={t.id}>
                {t.name} ({t.durationMonths} months · {contribLabel})
              </option>
            );
          })}
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

      <div className="space-y-1.5">
        <label className={labelClass}>Description <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span></label>
        <input
          type="text"
          name="description"
          placeholder="e.g. Monthly gold savings scheme for batch A"
          className={inputClass}
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

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
