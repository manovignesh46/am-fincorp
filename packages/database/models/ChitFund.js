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
