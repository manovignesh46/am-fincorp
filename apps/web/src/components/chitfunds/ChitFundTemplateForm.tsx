import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ChitFundTemplate, TemplateMonthSchedule } from '../../types';

interface ChitFundTemplateFormData {
  name: string;
  totalAmount: string;
  durationMonths: string;
  description: string;
}

interface ChitFundTemplateFormProps {
  onSubmit: (data: Record<string, unknown>) => void;
  initialData?: ChitFundTemplate | null;
  isLoading?: boolean;
}

const buildSchedule = (months: number, existing: TemplateMonthSchedule[] = []): TemplateMonthSchedule[] =>
  Array.from({ length: months }, (_, i) => {
    const month = i + 1;
    return existing.find((e) => e.month === month) ?? { month, contributionAmount: 0, auctionAmount: 0 };
  });

const ChitFundTemplateForm = ({ onSubmit, initialData = null, isLoading = false }: ChitFundTemplateFormProps) => {
  const [formData, setFormData] = useState<ChitFundTemplateFormData>({
    name: initialData?.name || '',
    totalAmount: initialData?.totalAmount ? String(initialData.totalAmount) : '',
    durationMonths: initialData?.durationMonths ? String(initialData.durationMonths) : '',
    description: initialData?.description || '',
  });

  const [schedule, setSchedule] = useState<TemplateMonthSchedule[]>(() =>
    buildSchedule(initialData?.durationMonths ?? 0, initialData?.monthlySchedule ?? [])
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, durationMonths: value }));
    const months = parseInt(value, 10);
    setSchedule(months > 0 ? buildSchedule(months, schedule) : []);
  };

  const handleScheduleChange = (
    month: number,
    field: 'contributionAmount' | 'auctionAmount',
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((row) => (row.month === month ? { ...row, [field]: parseFloat(value) || 0 } : row))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      totalAmount: parseFloat(formData.totalAmount),
      durationMonths: parseInt(formData.durationMonths, 10),
      description: formData.description,
      monthlySchedule: schedule,
    });
  };

  const inputClass =
    'block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm';
  const labelClass = 'text-xs font-bold text-slate-500 uppercase tracking-wider ml-1';
  const tableInputClass =
    'w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all text-right';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
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

      {/* Total Amount + Duration */}
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
          <label className={labelClass}>Duration (Months)</label>
          <input
            type="number"
            name="durationMonths"
            required
            min="1"
            max="120"
            placeholder="e.g. 15"
            className={inputClass}
            value={formData.durationMonths}
            onChange={handleDurationChange}
          />
        </div>
      </div>

      {/* Description */}
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

      {/* Monthly Schedule Table */}
      {schedule.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between ml-1">
            <label className={labelClass}>Monthly Schedule</label>
            <span className="text-[11px] text-slate-400 font-medium">
              {schedule.length} month{schedule.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 overflow-hidden">
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-16">
                      Month
                    </th>
                    <th className="py-2.5 px-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Contribution (₹)
                    </th>
                    <th className="py-2.5 px-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Auction Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {schedule.map((row) => (
                    <tr key={row.month} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2 px-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                          {row.month}
                        </span>
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          required
                          placeholder="0"
                          className={tableInputClass}
                          value={row.contributionAmount || ''}
                          onChange={(e) => handleScheduleChange(row.month, 'contributionAmount', e.target.value)}
                        />
                      </td>
                      <td className="py-1.5 px-2">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          required
                          placeholder="0"
                          className={tableInputClass}
                          value={row.auctionAmount || ''}
                          onChange={(e) => handleScheduleChange(row.month, 'auctionAmount', e.target.value)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || schedule.length === 0}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={18} /> Saving...
          </>
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
