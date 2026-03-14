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
    indexes: [{ unique: true, fields: ['memberId', 'chitFundId'] }]
  });
};
