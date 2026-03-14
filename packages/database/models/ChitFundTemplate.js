const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ChitFundTemplate', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    monthlyContribution: { type: DataTypes.FLOAT, allowNull: true },
    durationMonths: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    monthlySchedule: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      comment: 'Array of { month, contributionAmount, auctionAmount } per month',
    },
  }, { tableName: 'ChitFundTemplates', timestamps: true, paranoid: true });
};
