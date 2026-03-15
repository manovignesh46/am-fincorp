import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Loader2, AlertCircle, Edit2, Trash2,
  Coins, Calendar, TrendingUp, Hash, Activity, LayoutTemplate,
  UserPlus, Users, UserMinus, Phone, Ticket,
  Receipt, Gavel, Plus, CheckCircle2,
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import { ChitFund, ChitFundStatus, ChitFundEnrollment, Member, ChitFundContribution, ChitFundAuction } from '../types';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Enrollment state ──────────────────────────────────────────────────────
  const [enrollments, setEnrollments] = useState<ChitFundEnrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  // ── Contributions state ─────────────────────────────────────────────────
  const [contributions, setContributions] = useState<ChitFundContribution[]>([]);
  const [contributionsLoading, setContributionsLoading] = useState(false);
  const [isRecordContribOpen, setIsRecordContribOpen] = useState(false);
  const [contribEnrollmentId, setContribEnrollmentId] = useState('');
  const [contribMonth, setContribMonth] = useState('');
  const [contribAmount, setContribAmount] = useState('');
  const [contribPaidDate, setContribPaidDate] = useState('');
  const [contribNote, setContribNote] = useState('');
  const [recordingContrib, setRecordingContrib] = useState(false);
  const [contribError, setContribError] = useState<string | null>(null);

  // ── Auctions state ──────────────────────────────────────────────────────
  const [auctions, setAuctions] = useState<ChitFundAuction[]>([]);
  const [auctionsLoading, setAuctionsLoading] = useState(false);
  const [isRecordAuctionOpen, setIsRecordAuctionOpen] = useState(false);
  const [auctionWinnerEnrollmentId, setAuctionWinnerEnrollmentId] = useState('');
  const [auctionMonth, setAuctionMonth] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [auctionDateStr, setAuctionDateStr] = useState('');
  const [auctionNote, setAuctionNote] = useState('');
  const [recordingAuction, setRecordingAuction] = useState(false);
  const [auctionError, setAuctionError] = useState<string | null>(null);

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

  const fetchEnrollments = async () => {
    try {
      setEnrollmentsLoading(true);
      const res = await axios.get<{ data: ChitFundEnrollment[] }>(`/chit-funds/${id}/members`);
      setEnrollments(res.data.data);
    } catch {
      // non-blocking
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const fetchContributions = async () => {
    try {
      setContributionsLoading(true);
      const res = await axios.get<{ data: ChitFundContribution[] }>(`/chit-funds/${id}/contributions`);
      setContributions(res.data.data);
    } catch {
      // non-blocking
    } finally {
      setContributionsLoading(false);
    }
  };

  const fetchAuctions = async () => {
    try {
      setAuctionsLoading(true);
      const res = await axios.get<{ data: ChitFundAuction[] }>(`/chit-funds/${id}/auctions`);
      setAuctions(res.data.data);
    } catch {
      // non-blocking
    } finally {
      setAuctionsLoading(false);
    }
  };

  const openAddMemberModal = async () => {
    setIsAddMemberModalOpen(true);
    setSelectedMemberId('');
    setTicketNumber('');
    setAddMemberError(null);
    try {
      setMembersLoading(true);
      const res = await axios.get<{ data: Member[] }>('/members');
      setAllMembers(res.data.data);
    } catch {
      // ignore
    } finally {
      setMembersLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;
    try {
      setAddingMember(true);
      setAddMemberError(null);
      const res = await axios.post<{ data: ChitFundEnrollment }>(`/chit-funds/${id}/members`, {
        memberId: Number(selectedMemberId),
        ticketNumber: ticketNumber ? Number(ticketNumber) : undefined,
      });
      setEnrollments((prev) => [...prev, res.data.data]);
      setIsAddMemberModalOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setAddMemberError(err.response?.data?.message || 'Failed to add member.');
      }
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (enrollmentId: number) => {
    if (!window.confirm('Remove this member from the chit fund?')) return;
    try {
      setRemovingId(enrollmentId);
      await axios.delete(`/chit-funds/${id}/members/${enrollmentId}`);
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || 'Failed to remove member.');
      }
    } finally {
      setRemovingId(null);
    }
  };

  const calcCurrentMonth = (fund: ChitFund): number => {
    const start = new Date(fund.startDate);
    const now = new Date();
    const diff = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
    return Math.max(1, Math.min(diff, fund.duration));
  };

  const openRecordContribModal = (currentFund: ChitFund) => {
    const schedule = currentFund.ChitFundTemplate?.monthlySchedule ?? [];
    const monthNum = calcCurrentMonth(currentFund);
    const entry = schedule.find((s) => s.month === monthNum);
    setContribEnrollmentId('');
    setContribMonth(String(monthNum));
    setContribAmount(String(entry?.contributionAmount ?? currentFund.monthlyContribution));
    setContribPaidDate(new Date().toISOString().split('T')[0]);
    setContribNote('');
    setContribError(null);
    setIsRecordContribOpen(true);
  };

  const handleRecordContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRecordingContrib(true);
      setContribError(null);
      const res = await axios.post<{ data: ChitFundContribution }>(`/chit-funds/${id}/contributions`, {
        enrollmentId: Number(contribEnrollmentId),
        month: Number(contribMonth),
        amount: Number(contribAmount),
        paidDate: contribPaidDate || undefined,
        note: contribNote || undefined,
      });
      setContributions((prev) => [...prev, res.data.data].sort((a, b) => a.month - b.month));
      setIsRecordContribOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setContribError(err.response?.data?.message || 'Failed to record contribution.');
      }
    } finally {
      setRecordingContrib(false);
    }
  };

  const openRecordAuctionModal = (currentFund: ChitFund) => {
    const schedule = currentFund.ChitFundTemplate?.monthlySchedule ?? [];
    const monthNum = calcCurrentMonth(currentFund);
    const entry = schedule.find((s) => s.month === monthNum);
    setAuctionWinnerEnrollmentId('');
    setAuctionMonth(String(monthNum));
    setPayoutAmount(String(entry?.auctionAmount ?? currentFund.totalAmount));
    setAuctionDateStr(new Date().toISOString().split('T')[0]);
    setAuctionNote('');
    setAuctionError(null);
    setIsRecordAuctionOpen(true);
  };

  const handleRecordAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setRecordingAuction(true);
      setAuctionError(null);
      const res = await axios.post<{ data: ChitFundAuction }>(`/chit-funds/${id}/auctions`, {
        winnerEnrollmentId: Number(auctionWinnerEnrollmentId),
        auctionMonth: Number(auctionMonth),
        payoutAmount: Number(payoutAmount),
        auctionDate: auctionDateStr || undefined,
        note: auctionNote || undefined,
      });
      setAuctions((prev) => [...prev, res.data.data].sort((a, b) => a.auctionMonth - b.auctionMonth));
      setEnrollments((prev) =>
        prev.map((e) =>
          e.id === Number(auctionWinnerEnrollmentId)
            ? { ...e, auctionWon: true, auctionMonth: Number(auctionMonth) }
            : e
        )
      );
      setIsRecordAuctionOpen(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setAuctionError(err.response?.data?.message || 'Failed to record auction.');
      }
    } finally {
      setRecordingAuction(false);
    }
  };

  useEffect(() => { fetchFund(); fetchEnrollments(); fetchContributions(); fetchAuctions(); }, [id]);

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

  // Members not yet enrolled
  const enrolledMemberIds = new Set(enrollments.map((e) => e.memberId));
  const availableMembers = allMembers.filter((m) => !enrolledMemberIds.has(m.id));

  return (
    <div className="max-w-screen-xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
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
          <Button onClick={() => navigate(`/chitfunds/${id}/edit`)} icon={Edit2} label="Edit" hideLabel />
          <Button onClick={() => setIsDeleteModalOpen(true)} icon={Trash2} label="Delete" hideLabel variant="danger-outline" />
        </div>
      </div>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 items-start">

        {/* ── LEFT: Status / Progress + Details ─────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Status + progress banner */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Coins size={22} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{fund.name}</h2>
                  <p className="text-xs text-slate-400 font-medium">Fund ID: #{fund.id}</p>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${STATUS_STYLES[fund.status] || ''}`}>
                {fund.status}
              </span>
            </div>
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
        </div>

        {/* ── RIGHT: Enrolled Members ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800">
                Enrolled Members
                {enrollments.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-bold">
                    {enrollments.length}
                  </span>
                )}
              </h3>
            </div>
            <Button onClick={openAddMemberModal} icon={UserPlus} label="Add Member" hideLabel variant="success" size="sm" />
          </div>

          {enrollmentsLoading ? (
            <div className="flex items-center justify-center py-14 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={20} />
              <span className="text-sm font-medium">Loading members...</span>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-slate-400">
              <Users size={40} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">No members enrolled yet</p>
              <p className="text-xs mt-0.5">Click "Add Member" to enroll the first member</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Member</th>
                    <th className="py-2.5 px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Ticket #</th>
                    <th className="py-2.5 px-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-28">Status</th>
                    <th className="py-2.5 px-4 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800">{enrollment.Member?.name ?? '—'}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-slate-400">
                          <Phone size={11} />
                          <span className="text-xs">{enrollment.Member?.contact ?? '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {enrollment.ticketNumber != null ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                            <Ticket size={11} /> {enrollment.ticketNumber}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                          enrollment.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : enrollment.status === 'COMPLETED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleRemoveMember(enrollment.id)}
                          disabled={removingId === enrollment.id}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-40"
                          title="Remove member"
                        >
                          {removingId === enrollment.id
                            ? <Loader2 size={15} className="animate-spin" />
                            : <UserMinus size={15} />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Monthly Contributions & Auctions ─────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Contributions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800">
                Contributions
                {contributions.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-bold">
                    {contributions.length}
                  </span>
                )}
              </h3>
            </div>
            <button
              onClick={() => openRecordContribModal(fund)}
              disabled={enrollments.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Plus size={14} /> Record
            </button>
          </div>
          {contributionsLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={18} /> Loading...
            </div>
          ) : contributions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Receipt size={36} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">No contributions recorded yet</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-16">Month</th>
                    <th className="py-2 px-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Member</th>
                    <th className="py-2 px-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="py-2 px-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contributions.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                          {c.month}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {c.ChitFundEnrollment?.Member?.name ?? '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                        {fmt(c.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${
                          c.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : c.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Auctions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gavel size={18} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800">
                Monthly Auctions
                {auctions.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full font-bold">
                    {auctions.length}
                  </span>
                )}
              </h3>
            </div>
            <button
              onClick={() => openRecordAuctionModal(fund)}
              disabled={enrollments.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              <Plus size={14} /> Record
            </button>
          </div>
          {auctionsLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-400">
              <Loader2 className="animate-spin mr-2" size={18} /> Loading...
            </div>
          ) : auctions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Gavel size={36} className="mb-2 opacity-20" />
              <p className="text-sm font-medium">No auctions recorded yet</p>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-16">Month</th>
                    <th className="py-2 px-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Winner</th>
                    <th className="py-2 px-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Bid</th>
                    <th className="py-2 px-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auctions.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                          {a.auctionMonth}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {a.winner?.Member?.name ?? '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                        {a.bidAmount != null ? fmt(a.bidAmount) : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                        {fmt(a.payoutAmount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ── Add Member Modal ──────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => !addingMember && setIsAddMemberModalOpen(false)}
        title="Add Member to Chit Fund"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Select Member
            </label>
            {membersLoading ? (
              <div className="flex items-center gap-2 py-3 text-slate-400 text-sm">
                <Loader2 className="animate-spin" size={16} /> Loading members...
              </div>
            ) : (
              <select
                required
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
              >
                <option value="">— Choose a member —</option>
                {availableMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.contact})
                  </option>
                ))}
              </select>
            )}
            {availableMembers.length === 0 && !membersLoading && (
              <p className="text-xs text-slate-400 ml-1">All members are already enrolled.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Ticket Number <span className="font-normal normal-case text-slate-400">(optional)</span>
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            />
          </div>

          {addMemberError && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
              <AlertCircle size={14} />
              {addMemberError}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsAddMemberModalOpen(false)}
              disabled={addingMember}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingMember || !selectedMemberId}
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
            >
              {addingMember ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
              {addingMember ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Record Contribution Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={isRecordContribOpen}
        onClose={() => !recordingContrib && setIsRecordContribOpen(false)}
        title="Record Contribution"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleRecordContribution} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Month</label>
            <select
              required
              value={contribMonth}
              onChange={(e) => {
                const m = Number(e.target.value);
                setContribMonth(e.target.value);
                setContribEnrollmentId('');
                const schedule = fund.ChitFundTemplate?.monthlySchedule ?? [];
                const entry = schedule.find((s) => s.month === m);
                setContribAmount(String(entry?.contributionAmount ?? fund.monthlyContribution));
              }}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            >
              <option value="">— Select month —</option>
              {Array.from({ length: fund.duration }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Month {m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Member</label>
            <select
              required
              value={contribEnrollmentId}
              onChange={(e) => setContribEnrollmentId(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            >
              <option value="">— Choose enrolled member —</option>
              {enrollments
                .filter((e) => !contributions.some(
                  (c) => c.enrollmentId === e.id && c.month === Number(contribMonth)
                ))
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.Member?.name}{e.ticketNumber != null ? ` (Ticket #${e.ticketNumber})` : ''}
                  </option>
                ))
              }
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Amount (₹)</label>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={contribAmount}
              onChange={(e) => setContribAmount(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Paid Date</label>
            <input
              type="date"
              required
              value={contribPaidDate}
              onChange={(e) => setContribPaidDate(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Note <span className="font-normal normal-case text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={contribNote}
              onChange={(e) => setContribNote(e.target.value)}
              placeholder="e.g. Month 1 contribution"
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            />
          </div>
          {contribError && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
              <AlertCircle size={14} /> {contribError}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsRecordContribOpen(false)}
              disabled={recordingContrib}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recordingContrib || !contribEnrollmentId}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {recordingContrib ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              {recordingContrib ? 'Saving...' : 'Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Record Auction Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={isRecordAuctionOpen}
        onClose={() => !recordingAuction && setIsRecordAuctionOpen(false)}
        title="Record Auction"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleRecordAuction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Auction Month</label>
            <select
              required
              value={auctionMonth}
              onChange={(e) => {
                const m = Number(e.target.value);
                setAuctionMonth(e.target.value);
                setAuctionWinnerEnrollmentId('');
                const schedule = fund.ChitFundTemplate?.monthlySchedule ?? [];
                const entry = schedule.find((s) => s.month === m);
                setPayoutAmount(String(entry?.auctionAmount ?? fund.totalAmount));
              }}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            >
              <option value="">— Select month —</option>
              {Array.from({ length: fund.duration }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>Month {m}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Winner</label>
            <select
              required
              value={auctionWinnerEnrollmentId}
              onChange={(e) => setAuctionWinnerEnrollmentId(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            >
              <option value="">— Select auction winner —</option>
              {enrollments
                .filter((e) => !e.auctionWon && !auctions.some((a) => a.auctionMonth === Number(auctionMonth) && a.winnerEnrollmentId === e.id))
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.Member?.name}{e.ticketNumber != null ? ` (Ticket #${e.ticketNumber})` : ''}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Payout (₹)</label>
            <input
              type="number"
              required
              min="1"
              step="any"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Auction Date</label>
            <input
              type="date"
              required
              value={auctionDateStr}
              onChange={(e) => setAuctionDateStr(e.target.value)}
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
              Note <span className="font-normal normal-case text-slate-400">(optional)</span>
            </label>
            <input
              type="text"
              value={auctionNote}
              onChange={(e) => setAuctionNote(e.target.value)}
              placeholder="e.g. Month 1 auction"
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-blue-600 focus:border-blue-600 focus:bg-white outline-none transition-all font-medium text-slate-900 sm:text-sm"
            />
          </div>
          {auctionError && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-xs font-medium">
              <AlertCircle size={14} /> {auctionError}
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsRecordAuctionOpen(false)}
              disabled={recordingAuction}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={recordingAuction || !auctionWinnerEnrollmentId}
              className="flex-1 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
            >
              {recordingAuction ? <Loader2 className="animate-spin" size={16} /> : <Gavel size={16} />}
              {recordingAuction ? 'Saving...' : 'Record'}
            </button>
          </div>
        </form>
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
