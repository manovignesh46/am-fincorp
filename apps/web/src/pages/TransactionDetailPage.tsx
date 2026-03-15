import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Loader2, AlertCircle,
  ArrowLeftRight, Calendar, Tag, User, StickyNote, Lock,
  Coins, Hash, CalendarClock, Link2, Building2,
} from 'lucide-react';
import { Transaction, TransactionNature, TransactionCategory } from '../types';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const NATURE_STYLES: Record<TransactionNature, string> = {
  CREDIT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DEBIT: 'bg-rose-50 text-rose-600 border-rose-200',
};

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  PARTNER_TO_PARTNER: 'Partner-to-Partner Transfer',
  RECORD_AMOUNT: 'Record Amount (Cash)',
  LOAN_DISBURSEMENT: 'Loan Disbursement',
  LOAN_REPAYMENT: 'Loan Repayment',
  AUCTION_PAYOUT: 'Auction Payout',
  CHIT_CONTRIBUTION: 'Chit Contribution',
  DOCUMENT_CHARGE: 'Document Charge',
  REVERSAL: 'Reversal',
};

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

const TransactionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [tx, setTx] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        setLoading(true);
        const res = await axios.get<{ data: Transaction }>(`/transactions/${id}`);
        setTx(res.data.data);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to load transaction.');
        } else {
          setError('Failed to load transaction.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-500">
        <Loader2 className="animate-spin mr-3" size={28} />
        <span className="font-medium">Loading transaction...</span>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-rose-500 bg-rose-50 rounded-2xl border border-rose-100">
        <AlertCircle size={40} className="mb-3" />
        <p className="font-bold">{error}</p>
        <button onClick={() => navigate('/transactions')} className="mt-4 text-sm font-bold text-rose-600 hover:text-rose-800">
          ← Back to Ledger
        </button>
      </div>
    );
  }

  const isCredit = tx.nature === 'CREDIT';

  // Resolve member & chit fund across all transaction types
  const memberName =
    tx.Contribution?.ChitFundEnrollment?.Member?.name ??
    tx.Auction?.winner?.Member?.name ??
    tx.Repayment?.Loan?.Member?.name ??
    tx.Loan?.Member?.name ??
    tx.resolvedMember?.name ??
    null;

  const chitFundName =
    tx.Contribution?.ChitFundEnrollment?.ChitFund?.name ??
    tx.Auction?.winner?.ChitFund?.name ??
    tx.resolvedChitFund?.name ??
    null;

  const chitFundId =
    tx.Contribution?.ChitFundEnrollment?.ChitFund?.id ??
    tx.Auction?.winner?.ChitFund?.id ??
    tx.resolvedChitFund?.id ??
    null;

  const contribMonth = tx.Contribution?.month ?? tx.resolvedContribution?.month ?? null;
  const contribPaidDate = tx.Contribution?.paidDate ?? tx.resolvedContribution?.paidDate ?? null;
  const auctionMonth = tx.Auction?.month ?? null;

  const hasContext = !!(memberName || chitFundName || contribMonth !== null || auctionMonth !== null);

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate('/transactions')}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Transaction Ledger</p>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Transaction #{tx.id}</h1>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
          <Lock size={13} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Immutable Record</span>
        </div>
      </div>

      {/* Amount banner */}
      <div
        className={`rounded-2xl border p-6 mb-4 flex items-center justify-between ${
          isCredit ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'
            }`}
          >
            <ArrowLeftRight size={22} />
          </div>
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${isCredit ? 'text-emerald-600' : 'text-rose-500'}`}>
              {isCredit ? '▲ CREDIT' : '▼ DEBIT'}
            </p>
            <p className={`text-2xl font-black ${isCredit ? 'text-emerald-700' : 'text-rose-600'}`}>
              {isCredit ? '+' : '-'} {fmt(tx.amount)}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${NATURE_STYLES[tx.nature] || ''}`}>
          {tx.nature}
        </span>
      </div>

      {/* Context card — member / chit fund / contribution details */}
      {hasContext && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-4">
          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-2">Context</p>
          <div className="divide-y divide-indigo-100">
            {memberName && (
              <div className="flex items-center gap-3 py-2.5">
                <User size={15} className="text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Member</p>
                  <p className="text-sm font-semibold text-indigo-900">{memberName}</p>
                </div>
              </div>
            )}
            {chitFundName && (
              <div className="flex items-center gap-3 py-2.5">
                <Building2 size={15} className="text-indigo-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Chit Fund</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-indigo-900">{chitFundName}</p>
                    {chitFundId && (
                      <button
                        onClick={() => navigate(`/chit-funds/${chitFundId}`)}
                        className="text-xs text-indigo-500 hover:text-indigo-700 underline font-medium"
                      >
                        View →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
            {contribMonth !== null && (
              <div className="flex items-center gap-3 py-2.5">
                <Hash size={15} className="text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Contribution Month</p>
                  <p className="text-sm font-semibold text-indigo-900">Month {contribMonth}</p>
                </div>
              </div>
            )}
            {contribPaidDate && (
              <div className="flex items-center gap-3 py-2.5">
                <CalendarClock size={15} className="text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Paid Date</p>
                  <p className="text-sm font-semibold text-indigo-900">
                    {new Date(contribPaidDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
            )}
            {auctionMonth !== null && (
              <div className="flex items-center gap-3 py-2.5">
                <Hash size={15} className="text-indigo-400 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Auction Month</p>
                  <p className="text-sm font-semibold text-indigo-900">Month {auctionMonth}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <InfoRow icon={Tag} label="Category" value={CATEGORY_LABELS[tx.category] || tx.category} />
        <InfoRow icon={Coins} label="Amount" value={fmt(tx.amount)} />
        <InfoRow
          icon={Calendar}
          label="Date"
          value={new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
        />
        <InfoRow icon={User} label="Recorded By" value={tx.handler?.name || '—'} />
        <InfoRow icon={StickyNote} label="Note" value={tx.note} />
        {tx.referenceTransactionId && (
          <InfoRow
            icon={Link2}
            label="References Transaction"
            value={
              <button
                onClick={() => navigate(`/transactions/${tx.referenceTransactionId}`)}
                className="text-indigo-600 hover:text-indigo-800 underline font-semibold"
              >
                #{tx.referenceTransactionId}
              </button>
            }
          />
        )}
        {tx.transferGroupId && (
          <InfoRow icon={ArrowLeftRight} label="Transfer Group ID" value={tx.transferGroupId} />
        )}
        <InfoRow
          icon={CalendarClock}
          label="Recorded At"
          value={new Date(tx.createdAt).toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        />
      </div>
    </div>
  );
};

export default TransactionDetailPage;

