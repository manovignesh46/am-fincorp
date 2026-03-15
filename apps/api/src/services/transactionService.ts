import { Op } from '@am-fincorp/database';
import { Transaction, User, Contribution, ChitFundEnrollment, ChitFund, Member, Auction, Loan, Repayment } from '@am-fincorp/database';

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
            paranoid: false,
            include: [{
              model: ChitFundEnrollment,
              required: false,
              paranoid: false,
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
        order: [['id', 'DESC']],
        limit: safeLimit,
        offset,
        distinct: true,
        subQuery: false,
      });

      // Post-process: batch-resolve member names for REVERSAL transactions.
      // Deep nesting through referenceTransaction causes Postgres to truncate
      // column aliases (>63 chars), so we resolve them in a separate query.
      const rows = result.rows as any[];
      const reversals = rows.filter((tx) => tx.category === 'REVERSAL' && tx.referenceTransactionId);
      if (reversals.length > 0) {
        const refTxIds = reversals.map((tx) => tx.referenceTransactionId);
        const refContribs = await (Contribution as any).findAll({
          where: { transactionId: refTxIds },
          paranoid: false,
          include: [{
            model: ChitFundEnrollment,
            required: false,
            paranoid: false,
            include: [{ model: Member, attributes: ['id', 'name'], required: false }],
          }],
        });
        const memberByRefTxId = new Map<number, { id: number; name: string }>();
        for (const contrib of refContribs as any[]) {
          const member = contrib.ChitFundEnrollment?.Member;
          if (member) memberByRefTxId.set(contrib.transactionId, { id: member.id, name: member.name });
        }
        for (const tx of reversals) {
          const member = memberByRefTxId.get(tx.referenceTransactionId);
          if (member) tx.dataValues.resolvedMember = member;
        }
      }

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
        include: [
          { model: User, as: 'handler', attributes: ['id', 'name', 'email'] },
          {
            model: Contribution,
            required: false,
            paranoid: false,
            include: [{
              model: ChitFundEnrollment,
              required: false,
              paranoid: false,
              include: [
                { model: Member, attributes: ['id', 'name'], required: false },
                { model: ChitFund, attributes: ['id', 'name'], required: false },
              ],
            }],
          },
          {
            model: Auction,
            required: false,
            include: [{
              model: ChitFundEnrollment,
              as: 'winner',
              required: false,
              include: [
                { model: Member, attributes: ['id', 'name'], required: false },
                { model: ChitFund, attributes: ['id', 'name'], required: false },
              ],
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
      });
      if (!transaction) throw new Error('Transaction not found');

      // For REVERSAL: resolve member + chit fund from the soft-deleted contribution
      const tx = transaction as any;
      if (tx.category === 'REVERSAL' && tx.referenceTransactionId) {
        const refContrib = await (Contribution as any).findOne({
          where: { transactionId: tx.referenceTransactionId },
          paranoid: false,
          include: [{
            model: ChitFundEnrollment,
            required: false,
            paranoid: false,
            include: [
              { model: Member, attributes: ['id', 'name'], required: false },
              { model: ChitFund, attributes: ['id', 'name'], required: false },
            ],
          }],
        });
        if (refContrib) {
          tx.dataValues.resolvedMember = refContrib.ChitFundEnrollment?.Member ?? null;
          tx.dataValues.resolvedChitFund = refContrib.ChitFundEnrollment?.ChitFund ?? null;
          tx.dataValues.resolvedContribution = {
            month: refContrib.month,
            amount: refContrib.amount,
            paidDate: refContrib.paidDate,
          };
        }
      }

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
