const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('SUPER_ADMIN', 'PARTNER'), defaultValue: 'PARTNER' },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
  }, { tableName: 'Users', timestamps: true, paranoid: true });
};
