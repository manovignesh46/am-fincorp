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
