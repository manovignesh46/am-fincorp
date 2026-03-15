import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AlertCircle, Loader2, Plus, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import DataTable, { Column } from '../components/ui/DataTable';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import TransactionForm from '../components/transactions/TransactionForm';
import { Transaction, TransactionNature, TransactionCategory, TransactionSummary } from '../types';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const NATURE_STYLES: Record<TransactionNature, string> = {
  CREDIT: 'bg-emerald-50 text-emerald-700',
  DEBIT: 'bg-rose-50 text-rose-600',
};

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  PARTNER_TO_PARTNER: 'P2P Transfer',
  RECORD_AMOUNT: 'Record Amount',
  LOAN_DISBURSEMENT: 'Loan Disbursement',
  LOAN_REPAYMENT: 'Loan Repayment',
  AUCTION_PAYOUT: 'Auction Payout',
  CHIT_CONTRIBUTION: 'Chit Contribution',
  DOCUMENT_CHARGE: 'Document Charge',
  REVERSAL: 'Reversal',
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS) as TransactionCategory[];

const getMember = (row: Transaction): string | null =>
  row.Contribution?.ChitFundEnrollment?.Member?.name ??
  row.Auction?.winner?.Member?.name ??
  row.Repayment?.Loan?.Member?.name ??
  row.Loan?.Member?.name ??
  null;

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
}

const SummaryCard = ({ label, value, icon: Icon, colorClass }: SummaryCardProps) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-black text-slate-900 mt-0.5">{fmt(value)}</p>
    </div>
  </div>
);

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({ totalCredits: 0, totalDebits: 0, netBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterNature, setFilterNature] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterNature) params.nature = filterNature;
      if (filterCategory) params.category = filterCategory;

      const [txRes, sumRes] = await Promise.all([
        axios.get<{ data: Transaction[] }>('/transactions', { params }),
        axios.get<{ data: TransactionSummary }>('/transactions/summary'),
      ]);

      setTransactions(txRes.data.data);
      setSummary(sumRes.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filterNature, filterCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRecord = async (formData: Record<string, unknown>) => {
    try {
      setIsSubmitting(true);
      await axios.post('/transactions', formData);
      await fetchData();
      setIsModalOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to record transaction');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Transaction>[] = [
    {
      header: 'Date & Time',
      accessor: (row) => {
        const d = new Date(row.date);
        return (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800">
              {d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
            <span className="text-xs text-slate-400">
              {d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Member',
      accessor: (row) => {
        const name = getMember(row);
        return name
          ? <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">{name}</span>
          : <span className="text-slate-300 text-xs">—</span>;
      },
    },
    {
      header: 'Nature',
      accessor: (row) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${NATURE_STYLES[row.nature] || ''}`}>
          {row.nature === 'CREDIT' ? '▲ CREDIT' : '▼ DEBIT'}
        </span>
      ),
    },
    {
      header: 'Category',
      accessor: (row) => (
        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
          {CATEGORY_LABELS[row.category] || row.category}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <span className={`font-bold text-sm ${row.nature === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {row.nature === 'DEBIT' ? '- ' : '+ '}{fmt(row.amount)}
        </span>
      ),
    },
    {
      header: 'Note',
      accessor: (row) => (
        <span className="text-slate-500 text-xs italic truncate max-w-[180px] block">
          {row.note || '—'}
        </span>
      ),
    },
    {
      header: 'Handler',
      accessor: (row) => (
        <span className="text-xs text-slate-500 font-medium">{row.handler?.name || '—'}</span>
      ),
    },
  ];

  return (
    <div className="p-0">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transaction Ledger</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Immutable double-entry record of all financial movements.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={Plus} label="Record Transaction" hideLabel />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          label="Total Credits"
          value={summary.totalCredits}
          icon={TrendingUp}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          label="Total Debits"
          value={summary.totalDebits}
          icon={TrendingDown}
          colorClass="bg-rose-50 text-rose-500"
        />
        <SummaryCard
          label="Net Balance"
          value={summary.netBalance}
          icon={Scale}
          colorClass={summary.netBalance >= 0 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center gap-3">
        <select
          className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
          value={filterNature}
          onChange={(e) => setFilterNature(e.target.value)}
        >
          <option value="">All Natures</option>
          <option value="CREDIT">Credit</option>
          <option value="DEBIT">Debit</option>
        </select>
        <select
          className="px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {ALL_CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        {(filterNature || filterCategory) && (
          <button
            onClick={() => { setFilterNature(''); setFilterCategory(''); }}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 px-2"
          >
            Clear filters
          </button>
        )}
        <span className="ml-auto text-xs text-slate-400 font-medium">{transactions.length} entries</span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <Loader2 className="animate-spin mb-4" size={40} />
          <p className="font-medium">Loading ledger...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-500 bg-rose-50 rounded-2xl border border-rose-100 italic">
          <AlertCircle className="mb-4" size={40} />
          <p className="font-bold">{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 text-xs font-black uppercase tracking-widest text-rose-600 hover:text-rose-800"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="card-clean">
          <DataTable columns={columns} data={transactions} onRowClick={(row) => navigate(`/transactions/${row.id}`)} />
          {transactions.length === 0 && (
            <div className="py-20 text-center text-slate-400 font-medium">
              No transactions found. Record the first entry.
            </div>
          )}
        </div>
      )}

      {/* Record Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Record Transaction"
      >
        <TransactionForm onSubmit={handleRecord} isLoading={isSubmitting} />
      </Modal>
    </div>
  );
};

export default TransactionsPage;
