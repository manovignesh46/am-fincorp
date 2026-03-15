import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Loader2, AlertCircle, Receipt, Plus,
  CheckCircle2, ChevronLeft, ChevronRight, Trash2,
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { ChitFund, ChitFundEnrollment, ChitFundContribution } from '../types';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' });

const ChitFundContributionsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [fund, setFund] = useState<ChitFund | null>(null);
  const [enrollments, setEnrollments] = useState<ChitFundEnrollment[]>([]);
  const [contributions, setContributions] = useState<ChitFundContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Selected month (from URL ?month=N) ─────────────────────────────────────
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    const m = Number(searchParams.get('month'));
    return m > 0 ? m : 1;
  });

  // ── Record Contribution modal ───────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalEnrollmentId, setModalEnrollmentId] = useState('');
  const [modalAmount, setModalAmount] = useState('');
  const [modalPaidDate, setModalPaidDate] = useState('');
  const [modalNote, setModalNote] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);

  // ── Delete state ────────────────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<number | null>(null);  const [deleteTargetContrib, setDeleteTargetContrib] = useState<ChitFundContribution | null>(null);
  // ── Fetch all data ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [fundRes, enrollRes, contribRes] = await Promise.all([
        axios.get<{ data: ChitFund }>(`/chit-funds/${id}`),
        axios.get<{ data: ChitFundEnrollment[] }>(`/chit-funds/${id}/members`),
        axios.get<{ data: ChitFundContribution[] }>(`/chit-funds/${id}/contributions`),
      ]);
      setFund(fundRes.data.data);
      setEnrollments(enrollRes.data.data);
      setContributions(contribRes.data.data);
      setError(null);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Sync selectedMonth → URL
  useEffect(() => {
    setSearchParams({ month: String(selectedMonth) }, { replace: true });
  }, [selectedMonth, setSearchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-500 gap-3">
        <AlertCircle size={36} className="text-rose-400" />
        <p>{error ?? 'Fund not found.'}</p>
      </div>
    );
  }

  const schedule = fund.ChitFundTemplate?.monthlySchedule ?? [];
  const totalMembers = enrollments.length;
  const months = Array.from({ length: fund.duration }, (_, i) => i + 1);

  // Contributions for selected month
  const monthContribs = contributions.filter((c) => c.month === selectedMonth);
  const paidEnrollmentIds = new Set(monthContribs.map((c) => c.enrollmentId));
  const schedEntry = schedule.find((s) => s.month === selectedMonth);
  const expectedPerMember = schedEntry?.contributionAmount ?? fund.ChitFundTemplate?.monthlyContribution ?? 0;
  const expectedTotal = expectedPerMember * totalMembers;
  const collectedTotal = monthContribs.reduce((s, c) => s + c.amount, 0);
  const fullyCollected = totalMembers > 0 && monthContribs.length >= totalMembers;

  // Open modal pre-filled for selected month
  const openModal = (enrollmentId?: number) => {
    setModalEnrollmentId(enrollmentId ? String(enrollmentId) : '');
    setModalAmount(String(expectedPerMember));
    setModalPaidDate(new Date().toISOString().split('T')[0]);
    setModalNote('');
    setRecordError(null);
    setIsModalOpen(true);
  };

  const handleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRecording(true);
      setRecordError(null);
      const res = await axios.post<{ data: ChitFundContribution }>(`/chit-funds/${id}/contributions`, {
        enrollmentId: Number(modalEnrollmentId),
        month: selectedMonth,
        amount: Number(modalAmount),
        paidDate: modalPaidDate || undefined,
        note: modalNote || undefined,
      });
      setContributions((prev) => [...prev, res.data.data]);
      setIsModalOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setRecordError(err.response?.data?.message || 'Failed to record contribution.');
      }
    } finally {
      setRecording(false);
    }
  };

  const handleDelete = (contributionId: number) => {
    const contrib = contributions.find((c) => c.id === contributionId);
    if (contrib) setDeleteTargetContrib(contrib);
  };

  const doDelete = async () => {
    if (!deleteTargetContrib) return;
    try {
      setDeletingId(deleteTargetContrib.id);
      await axios.delete(`/chit-funds/${id}/contributions/${deleteTargetContrib.id}`);
      setContributions((prev) => prev.filter((c) => c.id !== deleteTargetContrib.id));
      setDeleteTargetContrib(null);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to delete.');
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(`/chitfunds/${id}`)}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 font-medium mb-2 transition-colors"
          >
            <ArrowLeft size={15} /> Back to {fund.name}
          </button>
          <h1 className="text-2xl font-extrabold text-blue-700 flex items-center gap-2">
            <Receipt size={22} /> Contributions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Month {selectedMonth} of {fund.duration}&nbsp;&nbsp;|&nbsp;&nbsp;
            {`Monthly Contribution: ${fmt(expectedPerMember)}`}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-3 sm:px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors mt-1 flex-shrink-0"
          title="Record Contribution"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Record Contribution</span>
        </button>
      </div>

      {/* ── Month selector bar ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <button
            onClick={() => setSelectedMonth((m) => Math.max(1, m - 1))}
            disabled={selectedMonth === 1}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1.5 min-w-max">
              {months.map((m) => {
                const mc = contributions.filter((c) => c.month === m);
                const sc = schedule.find((s) => s.month === m);
                const exp = (sc?.contributionAmount ?? fund.ChitFundTemplate?.monthlyContribution ?? 0) * totalMembers;
                const full = totalMembers > 0 && mc.length >= totalMembers;
                const partial = mc.length > 0 && !full;
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(m)}
                    className={`flex flex-col items-center px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedMonth === m
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : full
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : partial
                        ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>M{m}</span>
                    <span className={`text-[10px] font-normal mt-0.5 ${selectedMonth === m ? 'text-blue-200' : 'text-slate-400'}`}>
                      {mc.reduce((s, c) => s + c.amount, 0) > 0 ? fmt(mc.reduce((s, c) => s + c.amount, 0)) : fmt(exp)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => setSelectedMonth((m) => Math.min(fund.duration, m + 1))}
            disabled={selectedMonth === fund.duration}
            className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* ── Summary bar ── */}
        <div className="px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-5 text-sm overflow-x-auto pb-1 sm:pb-0">
            <div className="flex-shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expected</p>
              <p className="font-bold text-slate-700">{fmt(expectedTotal)}</p>
            </div>
            <div className="flex-shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Collected</p>
              <p className="font-bold text-emerald-600">{fmt(collectedTotal)}</p>
            </div>
            <div className="flex-shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outstanding</p>
              <p className={`font-bold ${expectedTotal - collectedTotal > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                {fmt(Math.max(0, expectedTotal - collectedTotal))}
              </p>
            </div>
            <div className="flex-shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</p>
              {fullyCollected
                ? <p className="font-bold text-emerald-600">Fully collected</p>
                : monthContribs.length > 0
                ? <p className="font-bold text-amber-600">{totalMembers - monthContribs.length} pending</p>
                : <p className="font-bold text-slate-400">Not started</p>
              }
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-full sm:max-w-xs">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${fullyCollected ? 'bg-emerald-500' : 'bg-blue-500'}`}
                style={{ width: `${expectedTotal > 0 ? Math.min(100, (collectedTotal / expectedTotal) * 100) : 0}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-right">
              {monthContribs.length} / {totalMembers} members
            </p>
          </div>
        </div>

        {/* ── Member rows ── */}
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-white border-b border-slate-100">
            <tr>
              <th className="py-3 px-5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Member</th>
              <th className="py-3 px-5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Month</th>
              <th className="py-3 px-5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
              <th className="py-3 px-5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Paid Date</th>
              <th className="py-3 px-5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Balance</th>
              <th className="py-3 px-5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {enrollments.map((enr) => {
              const contrib = monthContribs.find((c) => c.enrollmentId === enr.id);
              const isPaid = !!contrib;
              return (
                <tr key={enr.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-5">
                    <Link
                      to={`/members/${enr.memberId}`}
                      className="font-semibold text-blue-700 hover:underline"
                    >
                      {enr.Member?.name ?? '—'}
                    </Link>
                  </td>
                  <td className="py-3.5 px-5 text-center text-slate-500">Month {selectedMonth}</td>
                  <td className="py-3.5 px-5 text-right font-semibold text-slate-800">
                    {isPaid ? fmt(contrib.amount) : fmt(expectedPerMember)}
                  </td>
                  <td className="py-3.5 px-5 text-center text-slate-500">
                    {isPaid && contrib.paidDate ? fmtDate(contrib.paidDate) : '—'}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    {isPaid ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        Paid in full
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    {isPaid ? (
                      <button
                        onClick={() => handleDelete(contrib.id)}
                        disabled={deletingId === contrib.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40"
                      >
                        {deletingId === contrib.id
                          ? <Loader2 size={13} className="animate-spin" />
                          : <Trash2 size={13} />}
                        Delete
                      </button>
                    ) : (
                      <button
                        onClick={() => openModal(enr.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold border border-blue-200 transition-colors"
                      >
                        <Plus size={13} /> Record
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* ── Record Contribution Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !recording && setIsModalOpen(false)}
        title={`Record Contribution — Month ${selectedMonth}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleRecord} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Member</label>
            <select
              required
              value={modalEnrollmentId}
              onChange={(e) => setModalEnrollmentId(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            >
              <option value="">— Choose member —</option>
              {enrollments
                .filter((e) => !paidEnrollmentIds.has(e.id))
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.Member?.name}{e.ticketNumber != null ? ` (Ticket #${e.ticketNumber})` : ''}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Amount (₹)</label>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={modalAmount}
              onChange={(e) => setModalAmount(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Paid Date</label>
            <input
              type="date"
              required
              value={modalPaidDate}
              onChange={(e) => setModalPaidDate(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Note <span className="font-normal normal-case text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={modalNote}
              onChange={(e) => setModalNote(e.target.value)}
              placeholder="e.g. paid via UPI"
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            />
          </div>
          {recordError && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
              <AlertCircle size={14} /> {recordError}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={recording}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recording || !modalEnrollmentId}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {recording ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              {recording ? 'Saving...' : 'Record'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTargetContrib}
        onClose={() => setDeleteTargetContrib(null)}
        onConfirm={doDelete}
        title="Delete Contribution"
        message={
          deleteTargetContrib ? (
            <>Delete the contribution of <strong>{fmt(deleteTargetContrib.amount)}</strong> by{' '}
            <strong>{deleteTargetContrib.ChitFundEnrollment?.Member?.name ?? 'this member'}</strong> for Month {deleteTargetContrib.month}? This cannot be undone.</>
          ) : ''
        }
        confirmLabel="Delete"
        confirmingLabel="Deleting..."
        isConfirming={!!deletingId}
      />
    </div>
  );
};

export default ChitFundContributionsPage;
