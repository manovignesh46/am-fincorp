import { Loader2, Gavel, Plus } from 'lucide-react';
import { ChitFund, ChitFundEnrollment, ChitFundAuction } from '../../types';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

interface Props {
  fund: ChitFund;
  enrollments: ChitFundEnrollment[];
  auctions: ChitFundAuction[];
  loading: boolean;
  onRecord: () => void;
}

const AuctionsOverview = ({ fund, enrollments, auctions, loading, onRecord }: Props) => {
  const schedule = fund.ChitFundTemplate?.monthlySchedule ?? [];

  // Group ALL auctions per month (multiple winners allowed per month)
  const auctionsByMonth = auctions.reduce<Record<number, ChitFundAuction[]>>((acc, a) => {
    (acc[a.auctionMonth] ??= []).push(a);
    return acc;
  }, {});

  // Only months that have at least one auction, descending
  const months = Object.keys(auctionsByMonth)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Gavel size={17} className="text-slate-400" />
          <h3 className="text-sm font-bold text-slate-800">Auctions</h3>
        </div>
        <button
          onClick={onRecord}
          disabled={enrollments.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={13} /> Record
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading...
        </div>
      ) : months.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <Gavel size={32} className="mb-2 opacity-20" />
          <p className="text-sm font-medium">No auctions recorded yet</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {months.map((m) => {
            const monthAuctions = auctionsByMonth[m] ?? [];
            const schedEntry = schedule.find((s) => s.month === m);
            const expectedPayout = schedEntry?.auctionAmount ?? fund.totalAmount;
            const totalPayout = monthAuctions.reduce((sum, a) => sum + a.payoutAmount, 0);
            const hasAuctions = monthAuctions.length > 0;

            return (
              <div key={m} className="px-5 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex-shrink-0 mt-0.5">
                      {m}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-amber-700 leading-tight">Month {m}</p>
                      {hasAuctions ? (
                        <div className="mt-1 space-y-0.5">
                          {monthAuctions.map((a, idx) => (
                            <p key={a.id} className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                              {monthAuctions.length > 1 && (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[9px] font-bold flex-shrink-0">
                                  {idx + 1}
                                </span>
                              )}
                              {a.winner?.Member?.name ?? '—'}
                              {a.auctionDate && (
                                <span className="text-slate-400 font-normal">
                                  · {new Date(a.auctionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                </span>
                              )}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 mt-0.5">No auction yet</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {hasAuctions ? (
                      <>
                        <span className="text-xs font-bold text-emerald-600">
                          {monthAuctions.length > 1 ? `${monthAuctions.length} auctions` : 'Completed'}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {monthAuctions.length > 1
                            ? <>Total: <span className="font-semibold text-slate-700">{fmt(totalPayout)}</span></>
                            : <>Payout: <span className="font-semibold text-slate-700">{fmt(monthAuctions[0].payoutAmount)}</span></>
                          }
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-slate-400">Pending</span>
                        <p className="text-xs text-slate-400 mt-0.5">{fmt(expectedPayout)}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuctionsOverview;
