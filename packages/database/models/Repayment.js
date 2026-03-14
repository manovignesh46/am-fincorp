const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Repayment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    type: { type: DataTypes.ENUM('PRINCIPAL', 'INTEREST', 'BOTH'), defaultValue: 'BOTH' }
  }, { tableName: 'Repayments', timestamps: true, paranoid: true });
};
