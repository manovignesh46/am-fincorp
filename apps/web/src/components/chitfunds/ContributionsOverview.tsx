import { useNavigate } from 'react-router-dom';
import { Loader2, Receipt, Plus } from 'lucide-react';
import { ChitFund, ChitFundEnrollment, ChitFundContribution } from '../../types';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

interface Props {
  fund: ChitFund;
  chitFundId: string;
  enrollments: ChitFundEnrollment[];
  contributions: ChitFundContribution[];
  loading: boolean;
  onRecord: () => void;
}

const ContributionsOverview = ({ fund, chitFundId, enrollments, contributions, loading, onRecord }: Props) => {
  const navigate = useNavigate();

  const totalMembers = enrollments.length;
  const schedule = fund.ChitFundTemplate?.monthlySchedule ?? [];

  // Current month = how many months since startDate (1-based, clamped to duration)
  const start = new Date(fund.startDate);
  const now = new Date();
  const currentMonth = Math.max(1, Math.min(
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1,
    fund.duration
  ));

  // Only past + current months, newest first
  const months = Array.from({ length: currentMonth }, (_, i) => currentMonth - i);

  const contribByMonth = contributions.reduce<Record<number, ChitFundContribution[]>>((acc, c) => {
    (acc[c.month] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Receipt size={17} className="text-slate-400" />
          <h3 className="text-sm font-bold text-slate-800">Contributions</h3>
        </div>
        <button
          onClick={onRecord}
          disabled={enrollments.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={13} /> Record
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading...
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {months.map((m) => {
            const paid = contribByMonth[m] ?? [];
            const schedEntry = schedule.find((s) => s.month === m);
            const expectedPerMember = schedEntry?.contributionAmount ?? fund.ChitFundTemplate?.monthlyContribution ?? 0;
            const expectedTotal = totalMembers > 0 ? expectedPerMember * totalMembers : 0;
            const collectedTotal = paid.reduce((sum, c) => sum + c.amount, 0);
            const pendingMembers = totalMembers - paid.length;
            const fullyCollected = totalMembers > 0 && paid.length >= totalMembers;
            const pct = expectedTotal > 0 ? Math.min(100, (collectedTotal / expectedTotal) * 100) : 0;

            return (
              <div key={m} className="border-b border-slate-100 last:border-0">
                <button
                  type="button"
                  onClick={() => navigate(`/chitfunds/${chitFundId}/contributions?month=${m}`)}
                  className="w-full px-5 py-3.5 text-left hover:bg-slate-50 transition-colors group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0 bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {m}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-blue-700 leading-tight">Month {m}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {paid.length} of {totalMembers} member{totalMembers !== 1 ? 's' : ''}
                          {pendingMembers > 0 && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-rose-50 text-rose-600 rounded font-bold text-[10px]">
                              {pendingMembers} pending
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        {fullyCollected ? (
                          <span className="text-xs font-bold text-emerald-600">Fully collected</span>
                        ) : collectedTotal > 0 ? (
                          <span className="text-xs font-bold text-amber-600">Partial</span>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">Not started</span>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">
                          {fmt(collectedTotal)} / {fmt(expectedTotal)}
                        </p>
                      </div>
                      <span className="text-slate-400 text-xs group-hover:text-blue-500 transition-colors">▸</span>
                    </div>
                  </div>
                  <div className="mt-2.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${fullyCollected ? 'bg-emerald-500' : 'bg-blue-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContributionsOverview;
