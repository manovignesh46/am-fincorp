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
export interface TemplateMonthSchedule {
  month: number;
  contributionAmount: number;
  auctionAmount: number;
}

export interface ChitFundTemplate {
  id: number;
  name: string;
  totalAmount: number;
  monthlyContribution?: number;
  durationMonths: number;
  description?: string;
  monthlySchedule?: TemplateMonthSchedule[];
  createdAt: string;
}

// ─── Chit Fund ────────────────────────────────────────────────────────────────
export type ChitFundStatus = 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CLOSED';

export interface ChitFund {
  id: number;
  name: string;
  description?: string | null;
  totalAmount: number;
  monthlyContribution: number;
  duration: number;
  currentMonth: number;
  startDate: string;
  status: ChitFundStatus;
  templateId?: number | null;
  ChitFundTemplate?: Pick<ChitFundTemplate, 'id' | 'name' | 'monthlySchedule'>;
  createdAt: string;
}

// ─── Chit Fund Enrollment ─────────────────────────────────────────────────────
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';

export interface ChitFundEnrollment {
  id: number;
  chitFundId: number;
  memberId: number;
  ticketNumber?: number | null;
  joinDate: string;
  auctionWon: boolean;
  auctionMonth?: number | null;
  status: EnrollmentStatus;
  Member?: Pick<Member, 'id' | 'name' | 'contact' | 'email'>;
  createdAt: string;
}

// ─── Chit Fund Contribution ───────────────────────────────────────────────────
export interface ChitFundContribution {
  id: number;
  enrollmentId: number;
  month: number;
  amount: number;
  paidDate?: string | null;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  transactionId?: number;
  ChitFundEnrollment?: {
    id: number;
    ticketNumber?: number | null;
    Member?: Pick<Member, 'id' | 'name'>;
  };
  createdAt: string;
}

// ─── Chit Fund Auction ────────────────────────────────────────────────────────
export interface ChitFundAuction {
  id: number;
  chitFundId: number;
  auctionMonth: number;
  auctionDate?: string | null;
  bidAmount?: number | null;
  payoutAmount: number;
  status: 'COMPLETED' | 'PENDING';
  winnerEnrollmentId?: number;
  winner?: {
    id: number;
    ticketNumber?: number | null;
    Member?: Pick<Member, 'id' | 'name'>;
  };
  disbursementTransactionId?: number;
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
  // Nested member resolution paths
  Contribution?: {
    ChitFundEnrollment?: { Member?: { id: number; name: string } };
  };
  Auction?: {
    winner?: { Member?: { id: number; name: string } };
  };
  Repayment?: {
    Loan?: { Member?: { id: number; name: string } };
  };
  Loan?: { Member?: { id: number; name: string } };
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
