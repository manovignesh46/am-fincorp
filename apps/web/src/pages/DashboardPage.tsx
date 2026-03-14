import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  BadgeDollarSign,
  Coins,
  ArrowLeftRight,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import { cn } from '../utils/cn';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={cn('p-3 rounded-xl', color)}>
        <Icon size={24} className="text-white" />
      </div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Growth +12%</span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}!</h1>
        <p className="text-slate-500 mt-1">Here is what is happening with the funds today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Loans"
          value="₹ 12,45,000"
          icon={BadgeDollarSign}
          color="bg-emerald-500"
        />
        <StatCard
          title="Total Members"
          value="142"
          icon={Users}
          color="bg-indigo-500"
        />
        <StatCard
          title="Chit Fund Capital"
          value="₹ 50,00,000"
          icon={Coins}
          color="bg-amber-500"
        />
        <StatCard
          title="Total Cash in Hand"
          value="₹ 2,15,400"
          icon={CreditCard}
          color="bg-rose-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-80 flex flex-col items-center justify-center text-slate-400">
          <TrendingUp size={48} className="mb-4 opacity-20" />
          <p className="font-medium italic">Cash Flow Analytics Coming Soon</p>
        </div>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-80 flex flex-col items-center justify-center text-slate-400">
          <ArrowLeftRight size={48} className="mb-4 opacity-20" />
          <p className="font-medium italic">Recent Transactions Coming Soon</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
