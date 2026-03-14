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
