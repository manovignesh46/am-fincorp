const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Loan', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    principalAmount: { type: DataTypes.FLOAT, allowNull: false },
    interestRate: { type: DataTypes.FLOAT, allowNull: false },
    durationMonths: { type: DataTypes.INTEGER, allowNull: false },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: true },
    status: { type: DataTypes.ENUM('ACTIVE', 'PAID_OFF', 'DEFAULTED'), defaultValue: 'ACTIVE' },
    type: { type: DataTypes.ENUM('PERSONAL', 'BUSINESS'), defaultValue: 'PERSONAL' }
  }, { tableName: 'Loans', timestamps: true, paranoid: true });
};
