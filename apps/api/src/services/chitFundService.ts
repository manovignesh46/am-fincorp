import { ChitFund, ChitFundTemplate, ChitFundEnrollment, Member, sequelize } from '@am-fincorp/database';

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

  // ── Enrollments ────────────────────────────────────────────────────────────

  async getEnrollments(chitFundId: string): Promise<any[]> {
    try {
      return await ChitFundEnrollment.findAll({
        where: { chitFundId },
        include: [{ model: Member, attributes: ['id', 'name', 'contact', 'email'] }],
        order: [['ticketNumber', 'ASC']],
      });
    } catch (error) {
      console.error(`Error fetching enrollments for ChitFund ${chitFundId}:`, error);
      throw new Error('Could not fetch enrollments');
    }
  }

  async addMember(chitFundId: string, memberId: string, ticketNumber?: number): Promise<any> {
    try {
      const existing = await ChitFundEnrollment.findOne({ where: { chitFundId, memberId } } as any);
      if (existing) throw new Error('Member is already enrolled in this chit fund');
      const enrollment = await ChitFundEnrollment.create({ chitFundId, memberId, ticketNumber } as any);
      return await ChitFundEnrollment.findByPk((enrollment as any).id, {
        include: [{ model: Member, attributes: ['id', 'name', 'contact', 'email'] }],
      });
    } catch (error) {
      console.error(`Error enrolling member ${memberId} in ChitFund ${chitFundId}:`, error);
      throw error;
    }
  }

  async removeEnrollment(chitFundId: string, enrollmentId: string): Promise<void> {
    try {
      const enrollment = (await ChitFundEnrollment.findOne({ where: { id: enrollmentId, chitFundId } } as any)) as any;
      if (!enrollment) throw new Error('Enrollment not found');
      await enrollment.destroy();
    } catch (error) {
      console.error(`Error removing enrollment ${enrollmentId}:`, error);
      throw error;
    }
  }
}

export default new ChitFundService();
