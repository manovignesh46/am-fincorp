import { ChitFund, ChitFundTemplate, sequelize } from '@am-fincorp/database';

class ChitFundService {
  async createChitFund(chitFundData: Record<string, unknown>): Promise<any> {
    const t = await sequelize.transaction();
    try {
      const chitFund = await ChitFund.create(chitFundData, { transaction: t });
      await t.commit();
      return chitFund;
    } catch (error) {
      await t.rollback();
      console.error('Error creating Chit Fund:', error);
      throw new Error('Could not create Chit Fund: ' + (error as Error).message);
    }
  }

  async getAllChitFunds(): Promise<any[]> {
    try {
      return await ChitFund.findAll({
        include: [{ model: ChitFundTemplate }],
      });
    } catch (error) {
      console.error('Error fetching Chit Funds:', error);
      throw new Error('Could not fetch Chit Funds');
    }
  }

  async getChitFundById(id: string): Promise<any> {
    try {
      const chitFund = await ChitFund.findByPk(id, {
        include: [{ model: ChitFundTemplate }],
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

  async updateChitFund(id: string, updateData: Record<string, unknown>): Promise<any> {
    const t = await sequelize.transaction();
    try {
      const chitFund = (await ChitFund.findByPk(id)) as any;
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

  async deleteChitFund(id: string): Promise<void> {
    const t = await sequelize.transaction();
    try {
      const chitFund = (await ChitFund.findByPk(id)) as any;
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

export default new ChitFundService();
