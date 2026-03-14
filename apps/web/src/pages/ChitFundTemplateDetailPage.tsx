import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Loader2, AlertCircle, Edit2, Trash2,
  LayoutTemplate, DollarSign, Calendar, Hash, AlignLeft, TableProperties,
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import ChitFundTemplateForm from '../components/chitfunds/ChitFundTemplateForm';
import { ChitFundTemplate } from '../types';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
}

const InfoRow = ({ icon: Icon, label, value }: InfoRowProps) => (
  <div className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon size={15} className="text-slate-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-slate-800">
        {value ?? <span className="italic text-slate-300 font-normal">Not set</span>}
      </div>
    </div>
  </div>
);

const ChitFundTemplateDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<ChitFundTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTemplate = async () => {
    try {
      setLoading(true);
      const res = await axios.get<{ data: ChitFundTemplate }>(`/chit-fund-templates/${id}`);
      setTemplate(res.data.data);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load template.');
      } else {
        setError('Failed to load template.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplate(); }, [id]);

  const handleEdit = async (formData: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);
      const res = await axios.put<{ data: ChitFundTemplate }>(`/chit-fund-templates/${id}`, formData);
      setTemplate(res.data.data);
      setIsEditModalOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to update template.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await axios.delete(`/chit-fund-templates/${id}`);
      navigate('/chitfund-templates');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to delete template.');
      }
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-500">
        <Loader2 className="animate-spin mr-3" size={28} />
        <span className="font-medium">Loading template...</span>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-rose-500 bg-rose-50 rounded-2xl border border-rose-100">
        <AlertCircle size={40} className="mb-3" />
        <p className="font-bold">{error}</p>
        <button onClick={() => navigate('/chitfund-templates')} className="mt-4 text-sm font-bold text-rose-600 hover:text-rose-800">
          ← Back to Templates
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/chitfund-templates')}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chit Fund Templates</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{template.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            <Edit2 size={15} /> Edit
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-bold rounded-xl border border-rose-200 transition-colors"
          >
            <Trash2 size={15} /> Delete
          </button>
        </div>
      </div>

      {/* Detail card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-4 mb-6 pb-5 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <LayoutTemplate size={26} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{template.name}</h2>
            <p className="text-sm text-slate-400 font-medium">Template ID: #{template.id}</p>
          </div>
        </div>

        <InfoRow icon={DollarSign} label="Total Amount" value={fmt(template.totalAmount)} />
        <InfoRow icon={Hash} label="Duration" value={`${template.durationMonths} months`} />
        <InfoRow icon={AlignLeft} label="Description" value={template.description} />
        <InfoRow
          icon={Calendar}
          label="Created On"
          value={new Date(template.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}
        />

        {/* Monthly Schedule */}
        {template.monthlySchedule && template.monthlySchedule.length > 0 && (
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                <TableProperties size={15} className="text-slate-400" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Monthly Schedule
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-20">Month</th>
                      <th className="py-2.5 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Contribution</th>
                      <th className="py-2.5 px-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Auction Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {template.monthlySchedule.map((row) => (
                      <tr key={row.month} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold">
                            {row.month}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-slate-700">
                          {fmt(row.contributionAmount)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-emerald-700">
                          {fmt(row.auctionAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        title="Edit Template"
      >
        <ChitFundTemplateForm onSubmit={handleEdit} isLoading={isSubmitting} initialData={template} />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        title="Delete Template"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <Trash2 size={32} />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-slate-900">{template.name}</span>?
            This cannot be undone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors text-sm"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChitFundTemplateDetailPage;
