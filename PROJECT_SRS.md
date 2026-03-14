# Software Requirements Specification for AM-Fincorp (SRS)

## Project: Microfinance & Chit Fund Management System

### Project Overview
This system is an internal financial management tool built for a peer-to-peer partnership. It tracks microfinance loans, auction-based chit funds, and exact cash-in-hand balances for individual partners.
Important Context for AI Generation: This system is for internal use only. There is no customer-facing portal. Only system administrators/partners log in. All financial transactions must adhere strictly to double-entry ledger principles, and financial records are never hard-deleted; mistakes are handled via compensating reversal transactions.

### Technical Architecture
Repository Structure: Monorepo managed via pnpm workspaces.
packages/database: Contains PostgreSQL connection and Sequelize ORM models/associations.
apps/api: Node.js + Express.js REST API.
apps/web: React.js + Vite frontend + TailwindCss.
Database: PostgreSQL managed via Sequelize ORM.
Authentication: JWT or Session-based, utilizing bcrypt for password hashing.
Offline Support: Not required. The system assumes an active internet connection.

### Core Business Logic & Rules

#### Authentication & Roles
The system utilizes a unified User model for authentication.
Roles: PARTNER (standard active users performing daily operations) and SUPER_ADMIN (reserved for future managerial oversight).
Every action that modifies data must log the userId (Partner) who performed it.
#### Unified Member Directory
Human participants (customers/borrowers) are stored in a single Member table to prevent duplicate KYC data.
A Member connects to a Chit Fund via the ChitFundEnrollment join table.
#### Chit Fund Operations
Templates: ChitFundTemplate stores the blueprint (total amount, duration, monthly contribution, built-in partner profit). This removes the need to calculate profit percentages per auction dynamically.
Enrollments: Members are assigned a specific ticketNumber within a fund.
Auctions & Contributions: The system tracks monthly collected contributions and the payout disbursed to the auction winner.
#### Accounting & Transaction Ledger (CRITICAL)
All financial movements are recorded in a centralized Transaction ledger using strict double-entry concepts to track Partner cash balances.
NATURE Enum: * CREDIT: Money entering a partner's hand (increases balance).
DEBIT: Money leaving a partner's hand (decreases balance).
CATEGORY Enum: PARTNER_TO_PARTNER, RECORD_AMOUNT, LOAN_DISBURSEMENT, LOAN_REPAYMENT, AUCTION_PAYOUT, CHIT_CONTRIBUTION, DOCUMENT_CHARGE, REVERSAL.
Partner-to-Partner Transfers: Requires generating two transaction rows simultaneously tied together by a transferGroupId (UUID):
A DEBIT for the sending partner.
A CREDIT for the receiving partner.
Balance Calculation: A partner's current cash-in-hand is queried dynamically: SUM(amount where nature = CREDIT) - SUM(amount where nature = DEBIT) for their UserId.
#### Mistake Handling (Soft Deletes & Reversals)
Rule: Financial records (Contributions, Repayments, Loans) must never be hard-deleted.
Models use Sequelize's paranoid: true for soft-deleting (setting deletedAt).
When a record is soft-deleted, the API must generate a new Transaction row with Category REVERSAL, the opposite nature (e.g., reversing a CREDIT requires a DEBIT), and link it to the original mistake via referenceTransactionId.

### Sequelize Database Schema (packages/database/models)
Instructions for AI: Use the following schemas to scaffold the database layer. All models expect PostgreSQL dialect.
User.js (Partners & Admins)

```javascript
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('SUPER_ADMIN', 'PARTNER'), defaultValue: 'PARTNER' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'Users', timestamps: true, paranoid: true });
};


Member.js

```javascript
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Member', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    contact: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true }
  }, { tableName: 'Members', timestamps: true, paranoid: true });
};


ChitFundTemplate.js

```javascript
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('ChitFundTemplate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    monthlyContribution: { type: DataTypes.FLOAT, allowNull: false },
    durationMonths: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true }
  }, { tableName: 'ChitFundTemplates', timestamps: true, paranoid: true });
};


ChitFund.js

```javascript
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('ChitFund', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    monthlyContribution: { type: DataTypes.FLOAT, allowNull: false },
    duration: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'COMPLETED', 'CLOSED'), defaultValue: 'ACTIVE' },
    startDate: { type: DataTypes.DATE, allowNull: false },
    currentMonth: { type: DataTypes.INTEGER, defaultValue: 1 }
  }, { tableName: 'ChitFunds', timestamps: true, paranoid: true });
};


ChitFundEnrollment.js (Join Table)

```javascript
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('ChitFundEnrollment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ticketNumber: { type: DataTypes.INTEGER, allowNull: true },
    joinDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    auctionWon: { type: DataTypes.BOOLEAN, defaultValue: false },
    auctionMonth: { type: DataTypes.INTEGER, allowNull: true },
    status: { type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'DEFAULTED'), defaultValue: 'ACTIVE' }
  }, { 
    tableName: 'ChitFundEnrollments', 
    timestamps: true, 
    paranoid: true,
    indexes: [{ unique: true, fields: ['MemberId', 'ChitFundId'] }] 
  });
};


Transaction.js (The Ledger)

```javascript
const { DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  return sequelize.define('Transaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nature: { type: DataTypes.ENUM('CREDIT', 'DEBIT'), allowNull: false },
    category: { 
      type: DataTypes.ENUM(
        'PARTNER_TO_PARTNER', 'RECORD_AMOUNT', 'LOAN_DISBURSEMENT', 
        'LOAN_REPAYMENT', 'AUCTION_PAYOUT', 'CHIT_CONTRIBUTION', 
        'DOCUMENT_CHARGE', 'REVERSAL'
      ), 
      allowNull: false 
    },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    note: { type: DataTypes.STRING, allowNull: true },
    transferGroupId: { type: DataTypes.UUID, allowNull: true },
    referenceTransactionId: { type: DataTypes.INTEGER, allowNull: true }
  }, { 
    tableName: 'Transactions', 
    timestamps: true 
    // Intentionally omitting paranoid: true to maintain an immutable ledger.
  });
};


5. Sequelize Associations (packages/database/index.js)
Instructions for AI: Use the following associations to establish the Foreign Key constraints in PostgreSQL.

```javascript
const { Sequelize } = require('sequelize');

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false, 
});

// Import Models
const User = require('./models/User')(sequelize);
const Member = require('./models/Member')(sequelize);
const ChitFundTemplate = require('./models/ChitFundTemplate')(sequelize);
const ChitFund = require('./models/ChitFund')(sequelize);
const ChitFundEnrollment = require('./models/ChitFundEnrollment')(sequelize);
const Transaction = require('./models/Transaction')(sequelize);

// Additional operational models to be generated
const Contribution = require('./models/Contribution')(sequelize);
const Auction = require('./models/Auction')(sequelize);
const Loan = require('./models/Loan')(sequelize);
const Repayment = require('./models/Repayment')(sequelize);
const PaymentSchedule = require('./models/PaymentSchedule')(sequelize);

// --- ASSOCIATIONS ---

// Users (Partners)
User.hasMany(Transaction, { foreignKey: 'userId', as: 'handledTransactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'handler' });

User.hasMany(Member, { foreignKey: 'createdById', as: 'createdMembers' });
Member.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

User.hasMany(ChitFund, { foreignKey: 'createdById', as: 'createdFunds' });
ChitFund.belongsTo(User, { foreignKey: 'createdById', as: 'creator' });

// Chit Funds
ChitFundTemplate.hasMany(ChitFund, { foreignKey: 'templateId' });
ChitFund.belongsTo(ChitFundTemplate, { foreignKey: 'templateId' });

Member.belongsToMany(ChitFund, { through: ChitFundEnrollment, foreignKey: 'memberId' });
ChitFund.belongsToMany(Member, { through: ChitFundEnrollment, foreignKey: 'chitFundId' });

Member.hasMany(ChitFundEnrollment, { foreignKey: 'memberId' });
ChitFundEnrollment.belongsTo(Member, { foreignKey: 'memberId' });

ChitFund.hasMany(ChitFundEnrollment, { foreignKey: 'chitFundId' });
ChitFundEnrollment.belongsTo(ChitFund, { foreignKey: 'chitFundId' });

ChitFundEnrollment.hasMany(Contribution, { foreignKey: 'enrollmentId' });
Contribution.belongsTo(ChitFundEnrollment, { foreignKey: 'enrollmentId' });

ChitFund.hasMany(Auction, { foreignKey: 'chitFundId' });
Auction.belongsTo(ChitFund, { foreignKey: 'chitFundId' });

ChitFundEnrollment.hasMany(Auction, { foreignKey: 'winnerEnrollmentId', as: 'auctionsWon' });
Auction.belongsTo(ChitFundEnrollment, { foreignKey: 'winnerEnrollmentId', as: 'winner' });

// Loans
Member.hasMany(Loan, { foreignKey: 'memberId' });
Loan.belongsTo(Member, { foreignKey: 'memberId' });

Loan.hasMany(PaymentSchedule, { foreignKey: 'loanId' });
PaymentSchedule.belongsTo(Loan, { foreignKey: 'loanId' });

Loan.hasMany(Repayment, { foreignKey: 'loanId' });
Repayment.belongsTo(Loan, { foreignKey: 'loanId' });

// Tying Operations to Ledger
Transaction.hasOne(Contribution, { foreignKey: 'transactionId' });
Contribution.belongsTo(Transaction, { foreignKey: 'transactionId' });

Transaction.hasOne(Repayment, { foreignKey: 'transactionId' });
Repayment.belongsTo(Transaction, { foreignKey: 'transactionId' });

Transaction.hasOne(Auction, { foreignKey: 'disbursementTransactionId' });
Auction.belongsTo(Transaction, { foreignKey: 'disbursementTransactionId' });

Transaction.hasOne(Loan, { foreignKey: 'disbursementTransactionId' });
Loan.belongsTo(Transaction, { foreignKey: 'disbursementTransactionId' });

module.exports = {
  sequelize, User, Member, ChitFundTemplate, ChitFund, ChitFundEnrollment, 
  Transaction, Contribution, Auction, Loan, Repayment, PaymentSchedule
};
```

### API Development Guidelines (Express.js)

Transaction Wrapping: Any API route that modifies financial state must be wrapped in a sequelize.transaction() to ensure operational records and ledger records succeed or fail together.
Reversal Logic Routing: Create a dedicated service utility for reversals (e.g., reverseTransaction(transactionId, userId)) that finds the original transaction, flips the nature, applies the REVERSAL category, and soft-deletes the associated operational record.
