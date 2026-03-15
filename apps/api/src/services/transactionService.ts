import { Op } from '@am-fincorp/database';
import { Transaction, User, Contribution, ChitFundEnrollment, Member, Auction, Loan, Repayment } from '@am-fincorp/database';

interface TransactionFilters {
  nature?: string;
  category?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResult<T> {
  rows: T[];
  count: number;
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
  async getAll(filters: TransactionFilters = {}): Promise<PaginatedResult<any>> {
    try {
      const { nature, category, userId, search, page = 1, limit = 10 } = filters;
      const where: Record<string, unknown> = {};
      if (nature) where.nature = nature;
      if (category) where.category = category;
      if (userId) where.userId = Number(userId);
      if (search) {
        where[Op.or as unknown as string] = [
          { note: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const safePage = Math.max(1, page);
      const safeLimit = Math.min(100, Math.max(1, limit));
      const offset = (safePage - 1) * safeLimit;

      const result = await (Transaction as any).findAndCountAll({
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
        limit: safeLimit,
        offset,
        distinct: true,
        subQuery: false,
      });
      return { rows: result.rows, count: result.count };
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
