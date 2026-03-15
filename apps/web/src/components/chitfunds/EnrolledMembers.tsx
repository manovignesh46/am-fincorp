import { Loader2, Users, UserPlus, UserMinus, Phone, Ticket, Lock } from 'lucide-react';
import Button from '../ui/Button';
import { ChitFundEnrollment, ChitFundContribution } from '../../types';

interface Props {
  enrollments: ChitFundEnrollment[];
  contributions: ChitFundContribution[];
  loading: boolean;
  removingId: number | null;
  onAdd: () => void;
  onRemove: (enrollmentId: number) => void;
}

const EnrolledMembers = ({ enrollments, contributions, loading, removingId, onAdd, onRemove }: Props) => (
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
      <Button onClick={onAdd} icon={UserPlus} label="Add Member" hideLabel variant="success" size="sm" />
    </div>

    {loading ? (
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
                  {(() => {
                    const hasContribs = contributions.some((c) => c.enrollmentId === enrollment.id);
                    const isRemoving = removingId === enrollment.id;
                    return (
                      <button
                        onClick={() => onRemove(enrollment.id)}
                        disabled={isRemoving}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                          hasContribs
                            ? 'text-amber-400 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
                        }`}
                        title={hasContribs ? 'Delete contributions first to remove this member' : 'Remove member'}
                      >
                        {isRemoving
                          ? <Loader2 size={15} className="animate-spin" />
                          : hasContribs
                          ? <Lock size={15} />
                          : <UserMinus size={15} />}
                      </button>
                    );
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

export default EnrolledMembers;
