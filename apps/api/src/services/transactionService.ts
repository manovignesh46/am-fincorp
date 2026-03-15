import { Transaction, User, Contribution, ChitFundEnrollment, Member, Auction, Loan, Repayment } from '@am-fincorp/database';

interface TransactionFilters {
  nature?: string;
  category?: string;
  userId?: string;
}

interface TransactionSummary {
  totalCredits: number;
  totalDebits: number;
  netBalance: number;
}

interface PartnerBalance {
  credits: number;
  debits: number;
  balance: number;
}

class TransactionService {
  async getAll(filters: TransactionFilters = {}): Promise<any[]> {
    try {
      const where: Record<string, unknown> = {};
      if (filters.nature) where.nature = filters.nature;
      if (filters.category) where.category = filters.category;
      if (filters.userId) where.userId = Number(filters.userId);

      return await Transaction.findAll({
        where,
        include: [
          { model: User, as: 'handler', attributes: ['id', 'name', 'email'] },
          {
            model: Contribution,
            required: false,
            include: [{
              model: ChitFundEnrollment,
              required: false,
              include: [{ model: Member, attributes: ['id', 'name'], required: false }],
            }],
          },
          {
            model: Auction,
            required: false,
            include: [{
              model: ChitFundEnrollment,
              as: 'winner',
              required: false,
              include: [{ model: Member, attributes: ['id', 'name'], required: false }],
            }],
          },
          {
            model: Repayment,
            required: false,
            include: [{
              model: Loan,
              required: false,
              include: [{ model: Member, attributes: ['id', 'name'], required: false }],
            }],
          },
          {
            model: Loan,
            required: false,
            include: [{ model: Member, attributes: ['id', 'name'], required: false }],
          },
        ],
        order: [['date', 'DESC'], ['createdAt', 'DESC']],
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Could not fetch transactions');
    }
  }

  async create(data: Record<string, unknown>, userId: number): Promise<any> {
    try {
      if (!data.amount || Number(data.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      return await Transaction.create({ ...data, userId });
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error((error as Error).message);
    }
  }

  async getSummary(): Promise<TransactionSummary> {
    try {
      const totalCredits = ((await (Transaction as any).sum('amount', { where: { nature: 'CREDIT' } })) as number) || 0;
      const totalDebits = ((await (Transaction as any).sum('amount', { where: { nature: 'DEBIT' } })) as number) || 0;
      return { totalCredits, totalDebits, netBalance: totalCredits - totalDebits };
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      throw new Error('Could not fetch summary');
    }
  }

  async getById(id: string): Promise<any> {
    try {
      const transaction = await Transaction.findByPk(id, {
        include: [{ model: User, as: 'handler', attributes: ['id', 'name', 'email'] }],
      });
      if (!transaction) throw new Error('Transaction not found');
      return transaction;
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error);
      throw error;
    }
  }

  async getPartnerBalance(userId: string | number): Promise<PartnerBalance> {
    try {
      const credits = ((await (Transaction as any).sum('amount', { where: { userId, nature: 'CREDIT' } })) as number) || 0;
      const debits = ((await (Transaction as any).sum('amount', { where: { userId, nature: 'DEBIT' } })) as number) || 0;
      return { credits, debits, balance: credits - debits };
    } catch (error) {
      console.error('Error computing partner balance:', error);
      throw new Error('Could not compute balance');
    }
  }
}

export default new TransactionService();
