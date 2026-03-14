// ─── User ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

// ─── Member ───────────────────────────────────────────────────────────────────
export interface Member {
  id: number;
  name: string;
  contact: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
}

// ─── Chit Fund Template ───────────────────────────────────────────────────────
export interface ChitFundTemplate {
  id: number;
  name: string;
  totalAmount: number;
  monthlyContribution: number;
  durationMonths: number;
  description?: string;
  createdAt: string;
}

// ─── Chit Fund ────────────────────────────────────────────────────────────────
export type ChitFundStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CLOSED';

export interface ChitFund {
  id: number;
  name: string;
  totalAmount: number;
  monthlyContribution: number;
  duration: number;
  currentMonth: number;
  startDate: string;
  status: ChitFundStatus;
  templateId?: number | null;
  ChitFundTemplate?: Pick<ChitFundTemplate, 'id' | 'name'>;
  createdAt: string;
}

// ─── Transaction ──────────────────────────────────────────────────────────────
export type TransactionNature = 'CREDIT' | 'DEBIT';

export type TransactionCategory =
  | 'PARTNER_TO_PARTNER'
  | 'RECORD_AMOUNT'
  | 'LOAN_DISBURSEMENT'
  | 'LOAN_REPAYMENT'
  | 'AUCTION_PAYOUT'
  | 'CHIT_CONTRIBUTION'
  | 'DOCUMENT_CHARGE'
  | 'REVERSAL';

export interface Transaction {
  id: number;
  nature: TransactionNature;
  category: TransactionCategory;
  amount: number;
  date: string;
  note?: string;
  handler?: { id: number; name: string; email: string };
  transferGroupId?: string;
  referenceTransactionId?: number;
  userId: number;
  createdAt: string;
}

export interface TransactionSummary {
  totalCredits: number;
  totalDebits: number;
  netBalance: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}
