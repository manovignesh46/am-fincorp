const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Auction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    auctionMonth: { type: DataTypes.INTEGER, allowNull: false },
    bidAmount: { type: DataTypes.FLOAT, allowNull: false },
    payoutAmount: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.ENUM('COMPLETED', 'PENDING'), defaultValue: 'COMPLETED' }
  }, { tableName: 'Auctions', timestamps: true, paranoid: true });
};
