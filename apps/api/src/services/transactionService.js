const { Transaction, User } = require('@am-fincorp/database');

class TransactionService {
  /**
   * Get all transactions with optional filters
   * @param {Object} filters - { nature, category, userId }
   * @returns {Promise<Array>}
   */
  async getAll(filters = {}) {
    try {
      const where = {};
      if (filters.nature) where.nature = filters.nature;
      if (filters.category) where.category = filters.category;
      if (filters.userId) where.userId = Number(filters.userId);

      return await Transaction.findAll({
        where,
        include: [{ model: User, as: 'handler', attributes: ['id', 'name', 'email'] }],
        order: [['date', 'DESC']],
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error('Could not fetch transactions');
    }
  }

  /**
   * Create a manual transaction (e.g., RECORD_AMOUNT)
   * userId is injected from the authenticated user (req.user.id)
   * @param {Object} data
   * @param {number} userId
   * @returns {Promise<Transaction>}
   */
  async create(data, userId) {
    try {
      if (!data.amount || Number(data.amount) <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      return await Transaction.create({ ...data, userId });
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error(error.message);
    }
  }

  /**
   * Get overall ledger summary: total credits, debits, net balance
   * @returns {Promise<Object>}
   */
  async getSummary() {
    try {
      const totalCredits = (await Transaction.sum('amount', { where: { nature: 'CREDIT' } })) || 0;
      const totalDebits = (await Transaction.sum('amount', { where: { nature: 'DEBIT' } })) || 0;
      return { totalCredits, totalDebits, netBalance: totalCredits - totalDebits };
    } catch (error) {
      console.error('Error fetching transaction summary:', error);
      throw new Error('Could not fetch summary');
    }
  }

  /**
   * Get a single transaction by ID
   * @param {number} id
   * @returns {Promise<Transaction>}
   */
  async getById(id) {
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

  /**
   * Get cash-in-hand balance for a specific partner
   * @param {number} userId
   * @returns {Promise<Object>}
   */
  async getPartnerBalance(userId) {
    try {
      const credits = (await Transaction.sum('amount', { where: { userId, nature: 'CREDIT' } })) || 0;
      const debits = (await Transaction.sum('amount', { where: { userId, nature: 'DEBIT' } })) || 0;
      return { credits, debits, balance: credits - debits };
    } catch (error) {
      console.error('Error computing partner balance:', error);
      throw new Error('Could not compute balance');
    }
  }
}

module.exports = new TransactionService();
