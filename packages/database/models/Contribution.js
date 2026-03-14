const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Contribution', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    month: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM('PAID', 'PENDING', 'OVERDUE'), defaultValue: 'PAID' }
  }, { tableName: 'Contributions', timestamps: true, paranoid: true });
};
