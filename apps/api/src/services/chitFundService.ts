import { ChitFund, ChitFundTemplate, ChitFundEnrollment, Member, Contribution, Auction, Transaction, sequelize } from '@am-fincorp/database';

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
      const existing = await ChitFundEnrollment.findOne({ where: { chitFundId, memberId }, paranoid: false } as any);
      if (existing) {
        const e = existing as any;
        if (e.deletedAt) {
          await e.restore();
          await e.update({ status: 'ACTIVE', ticketNumber: ticketNumber ?? e.ticketNumber });
        } else {
          throw new Error('Member is already enrolled in this chit fund');
        }
        return await ChitFundEnrollment.findByPk(e.id, {
          include: [{ model: Member, attributes: ['id', 'name', 'contact', 'email'] }],
        });
      }
      const enrollment = await ChitFundEnrollment.create({ chitFundId, memberId, ticketNumber } as any);
      return await ChitFundEnrollment.findByPk((enrollment as any).id, {
        include: [{ model: Member, attributes: ['id', 'name', 'contact', 'email'] }],
      });
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Member is already enrolled in this chit fund');
      }
      console.error(`Error enrolling member ${memberId} in ChitFund ${chitFundId}:`, error);
      throw error;
    }
  }

  async addMembers(chitFundId: string, memberIds: string[]): Promise<{ enrolled: any[]; skipped: string[] }> {
    const enrolled: any[] = [];
    const skipped: string[] = [];
    for (const memberId of memberIds) {
      try {
        const result = await this.addMember(chitFundId, memberId);
        enrolled.push(result);
      } catch {
        skipped.push(memberId);
      }
    }
    return { enrolled, skipped };
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

  // ── Contributions ──────────────────────────────────────────────────────────

  async getContributions(chitFundId: string): Promise<any[]> {
    try {
      return await Contribution.findAll({
        include: [{
          model: ChitFundEnrollment,
          where: { chitFundId },
          include: [{ model: Member, attributes: ['id', 'name'] }],
        }],
        order: [['month', 'ASC'], ['createdAt', 'ASC']],
      });
    } catch (error) {
      console.error(`Error fetching contributions for ChitFund ${chitFundId}:`, error);
      throw new Error('Could not fetch contributions');
    }
  }

  async deleteContribution(chitFundId: string, contributionId: string, userId: number): Promise<void> {
    const contribution = (await Contribution.findOne({
      where: { id: contributionId },
      include: [{ model: ChitFundEnrollment, where: { chitFundId } } as any],
    })) as any;
    if (!contribution) throw new Error('Contribution not found for this chit fund');

    const t = await sequelize.transaction();
    try {
      // Create a DEBIT reversal to cancel the original CREDIT contribution
      await Transaction.create({
        nature: 'DEBIT',
        category: 'REVERSAL',
        amount: contribution.amount,
        date: new Date(),
        note: `Reversal: contribution deleted (Month ${contribution.month}, Contribution #${contribution.id})`,
        referenceTransactionId: contribution.transactionId ?? null,
        userId,
      } as any, { transaction: t });

      await contribution.destroy({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      console.error(`Error deleting contribution ${contributionId}:`, error);
      throw error;
    }
  }

  async recordContribution(
    chitFundId: string,
    data: { enrollmentId: number; month: number; amount: number; paidDate?: string; note?: string },
    userId: number
  ): Promise<any> {
    const t = await sequelize.transaction();
    try {
      const enrollment = await ChitFundEnrollment.findOne({ where: { id: data.enrollmentId, chitFundId } } as any);
      if (!enrollment) throw new Error('Enrollment not found for this chit fund');

      const txnDate = data.paidDate ? new Date(data.paidDate) : new Date();

      // Create a CREDIT ledger entry for the logged-in partner
      const ledgerTxn = await Transaction.create({
        nature: 'CREDIT',
        category: 'CHIT_CONTRIBUTION',
        amount: data.amount,
        date: txnDate,
        note: data.note || null,
        userId,
      } as any, { transaction: t });

      const contribution = await Contribution.create({
        enrollmentId: data.enrollmentId,
        month: data.month,
        amount: data.amount,
        paidDate: data.paidDate || null,
        status: 'PAID',
        transactionId: (ledgerTxn as any).id,
      } as any, { transaction: t });

      await t.commit();
      return await Contribution.findByPk((contribution as any).id, {
        include: [{
          model: ChitFundEnrollment,
          include: [{ model: Member, attributes: ['id', 'name', 'contact'] }],
        }],
      });
    } catch (error) {
      await t.rollback();
      console.error(`Error recording contribution for ChitFund ${chitFundId}:`, error);
      throw error;
    }
  }

  // ── Auctions ───────────────────────────────────────────────────────────────

  async getAuctions(chitFundId: string): Promise<any[]> {
    try {
      return await Auction.findAll({
        where: { chitFundId },
        include: [{
          model: ChitFundEnrollment,
          as: 'winner',
          include: [{ model: Member, attributes: ['id', 'name'] }],
        }],
        order: [['auctionMonth', 'ASC']],
      });
    } catch (error) {
      console.error(`Error fetching auctions for ChitFund ${chitFundId}:`, error);
      throw new Error('Could not fetch auctions');
    }
  }

  async recordAuction(
    chitFundId: string,
    data: { winnerEnrollmentId: number; auctionMonth: number; payoutAmount: number; auctionDate?: string; note?: string },
    userId: number
  ): Promise<any> {
    const t = await sequelize.transaction();
    try {
      const enrollment = (await ChitFundEnrollment.findOne({ where: { id: data.winnerEnrollmentId, chitFundId } } as any)) as any;
      if (!enrollment) throw new Error('Enrollment not found for this chit fund');

      const txnDate = data.auctionDate ? new Date(data.auctionDate) : new Date();

      // Create a DEBIT ledger entry for the payout to the auction winner
      const ledgerTxn = await Transaction.create({
        nature: 'DEBIT',
        category: 'AUCTION_PAYOUT',
        amount: data.payoutAmount,
        date: txnDate,
        note: data.note || null,
        userId,
      } as any, { transaction: t });

      const auction = await Auction.create({
        chitFundId,
        winnerEnrollmentId: data.winnerEnrollmentId,
        auctionMonth: data.auctionMonth,
        auctionDate: data.auctionDate || null,
        bidAmount: null,
        payoutAmount: data.payoutAmount,
        status: 'COMPLETED',
        disbursementTransactionId: (ledgerTxn as any).id,
      } as any, { transaction: t });

      // Mark the winner's enrollment as auction won
      await enrollment.update(
        { auctionWon: true, auctionMonth: data.auctionMonth },
        { transaction: t }
      );

      await t.commit();
      return await Auction.findByPk((auction as any).id, {
        include: [{
          model: ChitFundEnrollment,
          as: 'winner',
          include: [{ model: Member, attributes: ['id', 'name', 'contact'] }],
        }],
      });
    } catch (error) {
      await t.rollback();
      console.error(`Error recording auction for ChitFund ${chitFundId}:`, error);
      throw error;
    }
  }
}

export default new ChitFundService();
