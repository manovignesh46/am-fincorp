const { Sequelize } = require('sequelize');
require('dotenv').config();

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
