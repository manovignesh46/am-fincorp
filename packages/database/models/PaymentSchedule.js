const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('PaymentSchedule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dueDate: { type: DataTypes.DATE, allowNull: false },
    expectedAmount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('PENDING', 'PAID', 'OVERDUE'), defaultValue: 'PENDING' }
  }, { tableName: 'PaymentSchedules', timestamps: true, paranoid: true });
};
