import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Loader2, AlertCircle, Edit2, Trash2,
  Coins, Calendar, TrendingUp, Hash, Activity, LayoutTemplate,
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import ChitFundForm from '../components/chitfunds/ChitFundForm';
import { ChitFund, ChitFundStatus } from '../types';

const STATUS_STYLES: Record<ChitFundStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INACTIVE: 'bg-slate-100 text-slate-500 border-slate-200',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
  CLOSED: 'bg-rose-50 text-rose-600 border-rose-200',
};

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

const ChitFundDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [fund, setFund] = useState<ChitFund | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFund = async () => {
    try {
      setLoading(true);
      const res = await axios.get<{ data: ChitFund }>(`/chit-funds/${id}`);
      setFund(res.data.data);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to load chit fund.');
      } else {
        setError('Failed to load chit fund.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFund(); }, [id]);

  const handleEdit = async (formData: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);
      const res = await axios.put<{ data: ChitFund }>(`/chit-funds/${id}`, formData);
      setFund(res.data.data);
      setIsEditModalOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to update chit fund.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      await axios.delete(`/chit-funds/${id}`);
      navigate('/chitfunds');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to delete chit fund.');
      }
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-500">
        <Loader2 className="animate-spin mr-3" size={28} />
        <span className="font-medium">Loading chit fund...</span>
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-rose-500 bg-rose-50 rounded-2xl border border-rose-100">
        <AlertCircle size={40} className="mb-3" />
        <p className="font-bold">{error}</p>
        <button onClick={() => navigate('/chitfunds')} className="mt-4 text-sm font-bold text-rose-600 hover:text-rose-800">
          ← Back to Chit Funds
        </button>
      </div>
    );
  }

  const progressPct = Math.min((fund.currentMonth / fund.duration) * 100, 100);

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/chitfunds')}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Chit Funds</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{fund.name}</h1>
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

      {/* Status + progress banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Coins size={22} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{fund.name}</h2>
              <p className="text-xs text-slate-400 font-medium">Fund ID: #{fund.id}</p>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${STATUS_STYLES[fund.status] || ''}`}>
            {fund.status}
          </span>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1.5">
            <span>Month {fund.currentMonth} of {fund.duration}</span>
            <span>{Math.round(progressPct)}% complete</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Detail card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <InfoRow icon={TrendingUp} label="Total Amount" value={fmt(fund.totalAmount)} />
        <InfoRow icon={Coins} label="Monthly Contribution" value={fmt(fund.monthlyContribution)} />
        <InfoRow icon={Hash} label="Duration" value={`${fund.duration} months`} />
        <InfoRow icon={Activity} label="Current Month" value={`Month ${fund.currentMonth}`} />
        <InfoRow
          icon={Calendar}
          label="Start Date"
          value={new Date(fund.startDate).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}
        />
        {fund.ChitFundTemplate && (
          <InfoRow icon={LayoutTemplate} label="Template Used" value={fund.ChitFundTemplate.name} />
        )}
        <InfoRow
          icon={Calendar}
          label="Created On"
          value={new Date(fund.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'long', year: 'numeric',
          })}
        />
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => !isSubmitting && setIsEditModalOpen(false)}
        title="Edit Chit Fund"
        maxWidth="max-w-lg"
      >
        <ChitFundForm onSubmit={handleEdit} isLoading={isSubmitting} initialData={fund} />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        title="Delete Chit Fund"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <Trash2 size={32} />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to delete <span className="font-bold text-slate-900">{fund.name}</span>?
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

export default ChitFundDetailPage;
