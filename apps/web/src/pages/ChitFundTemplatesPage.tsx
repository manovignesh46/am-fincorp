import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, AlertCircle, Loader2, Edit2, Trash2, Plus } from 'lucide-react';
import DataTable, { Column } from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { ChitFundTemplate } from '../types';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const ChitFundTemplatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<ChitFundTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ChitFundTemplate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await axios.get<{ data: ChitFundTemplate[] }>('/chit-fund-templates');
      setTemplates(res.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to load templates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenDeleteModal = (template: ChitFundTemplate) => {
    setSelectedTemplate(template);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTemplate) return;
    try {
      setIsSubmitting(true);
      await axios.delete(`/chit-fund-templates/${selectedTemplate.id}`);
      await fetchTemplates();
      setIsDeleteModalOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to delete template');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<ChitFundTemplate>[] = [
    {
      header: 'Name',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{row.name}</span>
          {row.description && (
            <span className="text-[11px] text-slate-400 truncate max-w-[200px]">{row.description}</span>
          )}
        </div>
      ),
    },
    { header: 'Total Amount', accessor: (row) => <span className="font-semibold text-slate-700">{fmt(row.totalAmount)}</span> },
    {
      header: 'Contribution (₹)',
      accessor: (row) => {
        if (row.monthlySchedule && row.monthlySchedule.length > 0) {
          const amounts = row.monthlySchedule.map((s) => s.contributionAmount);
          const min = Math.min(...amounts);
          const max = Math.max(...amounts);
          return (
            <span className="font-semibold text-slate-700">
              {min === max ? fmt(min) : `${fmt(min)} – ${fmt(max)}`}
            </span>
          );
        }
        return <span className="text-slate-400 text-xs italic">Not set</span>;
      },
    },
    {
      header: 'Duration',
      accessor: (row) => (
        <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
          {row.durationMonths} months
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1">
          <Button onClick={(e) => { e.stopPropagation(); navigate(`/chitfund-templates/${row.id}/edit`); }} icon={Edit2} label="Edit Template" alwaysIconOnly variant="ghost-blue" size="sm" />
          <Button onClick={(e) => { e.stopPropagation(); handleOpenDeleteModal(row); }} icon={Trash2} label="Delete Template" alwaysIconOnly variant="ghost-red" size="sm" />
        </div>
      ),
    },
  ];

  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-0">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chit Fund Templates</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Define reusable blueprints for chit fund schemes.</p>
        </div>
        <Button onClick={() => navigate('/chitfund-templates/new')} icon={Plus} label="New Template" hideLabel />
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-6 flex items-center gap-3 group focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
        <Search className="text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search templates..."
          className="flex-1 outline-none text-slate-700 placeholder:text-slate-400 font-medium text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-medium">Loading templates...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-500 bg-rose-50 rounded-2xl border border-rose-100 italic">
          <AlertCircle className="mb-4" size={40} />
          <p className="font-bold">{error}</p>
          <button
            onClick={fetchTemplates}
            className="mt-4 text-xs font-black uppercase tracking-widest text-rose-600 hover:text-rose-800"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="card-clean">
          <DataTable columns={columns} data={filtered} onRowClick={(row) => navigate(`/chitfund-templates/${row.id}`)} />
          {filtered.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium">
              {searchTerm ? 'No templates match your search.' : 'No templates yet. Create one to get started.'}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isSubmitting && setIsDeleteModalOpen(false)}
        title="Delete Template"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2">
            <Trash2 size={32} />
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-bold text-slate-900">{selectedTemplate?.name}</span>? This cannot be undone.
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

export default ChitFundTemplatesPage;
