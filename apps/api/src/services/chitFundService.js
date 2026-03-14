const { ChitFund, ChitFundTemplate, sequelize } = require('@am-fincorp/database');

class ChitFundService {
  /**
   * Create a new Chit Fund
   * @param {Object} chitFundData 
   * @returns {Promise<Object>}
   */
  async createChitFund(chitFundData) {
    const t = await sequelize.transaction();
    try {
      const chitFund = await ChitFund.create(chitFundData, { transaction: t });
      await t.commit();
      return chitFund;
    } catch (error) {
      await t.rollback();
      console.error('Error creating Chit Fund:', error);
      throw new Error('Could not create Chit Fund: ' + error.message);
    }
  }

  /**
   * Get all Chit Funds
   * @returns {Promise<Array>}
   */
  async getAllChitFunds() {
    try {
      return await ChitFund.findAll({
        include: [{ model: ChitFundTemplate }]
      });
    } catch (error) {
      console.error('Error fetching Chit Funds:', error);
      throw new Error('Could not fetch Chit Funds');
    }
  }

  /**
   * Get a single Chit Fund by ID
   * @param {number} id 
   * @returns {Promise<Object>}
   */
  async getChitFundById(id) {
    try {
      const chitFund = await ChitFund.findByPk(id, {
        include: [{ model: ChitFundTemplate }]
      });
      if (!chitFund) {
        throw new Error('Chit Fund not found');
      }
      return chitFund;
    } catch (error) {
      console.error(`Error fetching Chit Fund with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update a Chit Fund
   * @param {number} id 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  async updateChitFund(id, updateData) {
    const t = await sequelize.transaction();
    try {
      const chitFund = await ChitFund.findByPk(id);
      if (!chitFund) {
        throw new Error('Chit Fund not found');
      }
      await chitFund.update(updateData, { transaction: t });
      await t.commit();
      return chitFund;
    } catch (error) {
      await t.rollback();
      console.error(`Error updating Chit Fund with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete a Chit Fund
   * @param {number} id 
   * @returns {Promise<void>}
   */
  async deleteChitFund(id) {
    const t = await sequelize.transaction();
    try {
      const chitFund = await ChitFund.findByPk(id);
      if (!chitFund) {
        throw new Error('Chit Fund not found');
      }
      await chitFund.destroy({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      console.error(`Error deleting Chit Fund with ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new ChitFundService();
