import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Coins, Search, AlertCircle, Loader2, Edit2, Trash2, Plus } from 'lucide-react';
import DataTable from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import ChitFundForm from '../components/chitfunds/ChitFundForm';

const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const STATUS_STYLES = {
  ACTIVE:    'bg-emerald-50 text-emerald-700',
  INACTIVE:  'bg-slate-100 text-slate-500',
  COMPLETED: 'bg-blue-50 text-blue-700',
  CLOSED:    'bg-rose-50 text-rose-600',
};

const ChitFundsPage = () => {
  const navigate = useNavigate();
  const [chitFunds, setChitFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchChitFunds = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/chit-funds');
      setChitFunds(res.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching chit funds:', err);
      setError('Failed to load chit funds. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChitFunds();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedFund(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (fund) => {
    setSelectedFund(fund);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (fund) => {
    setSelectedFund(fund);
    setIsDeleteModalOpen(true);
  };

  const handleAddOrEdit = async (formData) => {
    try {
      setIsSubmitting(true);
      if (selectedFund) {
        await axios.put(`/chit-funds/${selectedFund.id}`, formData);
      } else {
        await axios.post('/chit-funds', formData);
      }
      await fetchChitFunds();
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save chit fund');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFund) return;
    try {
      setIsSubmitting(true);
      await axios.delete(`/chit-funds/${selectedFund.id}`);
      await fetchChitFunds();
      setIsDeleteModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete chit fund');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Fund Name',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.name}</span>
          {row.ChitFundTemplate && (
            <span className="text-[11px] text-slate-400">Template: {row.ChitFundTemplate.name}</span>
          )}
        </div>
      ),
    },
    { header: 'Total Amount', accessor: (row) => <span className="font-semibold text-slate-700">{fmt(row.totalAmount)}</span> },
    { header: 'Monthly (₹)', accessor: (row) => fmt(row.monthlyContribution) },
    {
      header: 'Progress',
      accessor: (row) => (
        <div className="flex flex-col gap-1 min-w-[100px]">
          <span className="text-xs font-bold text-slate-600">Month {row.currentMonth} / {row.duration}</span>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min((row.currentMonth / row.duration) * 100, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Start Date',
      accessor: (row) => new Date(row.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[row.status] || ''}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(row); }}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(row); }}
            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  const filtered = chitFunds.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chit Funds</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage active and past chit fund schemes.</p>
        </div>
        <button onClick={handleOpenAddModal} className="flex items-center gap-2 btn-primary">
          <Plus size={18} />
          <span>New Chit Fund</span>
        </button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-3 group focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
        <Search className="text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search chit funds..."
          className="flex-1 outline-none text-slate-700 placeholder:text-slate-400 font-medium text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-medium">Loading chit funds...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-500 bg-rose-50 rounded-2xl border border-rose-100 italic">
          <AlertCircle className="mb-4" size={40} />
          <p className="font-bold">{error}</p>
          <button onClick={fetchChitFunds} className="mt-4 text-xs font-black uppercase tracking-widest text-rose-600 hover:text-rose-800">
            Refresh
          </button>
        </div>
      ) : (
        <div className="card-clean overflow-hidden">
          <DataTable columns={columns} data={filtered} onRowClick={(row) => navigate(`/chitfunds/${row.id}`)} />
          {filtered.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium">
              {searchTerm ? 'No chit funds match your search.' : 'No chit funds yet. Create one to get started.'}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title={selectedFund ? 'Edit Chit Fund' : 'New Chit Fund'}
        maxWidth="max-w-lg"
      >
        <ChitFundForm onSubmit={handleAddOrEdit} isLoading={isSubmitting} initialData={selectedFund} />
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        title="Delete Chit Fund"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trash2 size={32} />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-bold text-slate-900">{selectedFund?.name}</span>? This cannot be undone.
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
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-rose-100"
            >
              {isSubmitting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChitFundsPage;
