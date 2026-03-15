import { Op } from '@am-fincorp/database';
import { Member } from '@am-fincorp/database';

export interface MemberListParams {
  search?: string;
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  rows: T[];
  count: number;
}

class MemberService {
  async createMember(memberData: Record<string, unknown>): Promise<any> {
    try {
      return await Member.create(memberData);
    } catch (error) {
      console.error('Error creating member:', error);
      throw new Error('Could not create member: ' + (error as Error).message);
    }
  }

  async getAllMembers(params: MemberListParams = {}): Promise<PaginatedResult<any>> {
    try {
      const { search, page = 1, limit = 10, orderBy = 'createdAt', orderDir = 'DESC' } = params;
      const where: Record<string, unknown> = {};
      if (search) {
        where[Op.or as unknown as string] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { contact: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ];
      }
      const safePage = Math.max(1, page);
      const safeLimit = Math.min(100, Math.max(1, limit));
      const offset = (safePage - 1) * safeLimit;

      const result = await (Member as any).findAndCountAll({
        where,
        order: [[orderBy, orderDir]],
        limit: safeLimit,
        offset,
      });
      return { rows: result.rows, count: result.count };
    } catch (error) {
      console.error('Error fetching members:', error);
      throw new Error('Could not fetch members');
    }
  }

  async getMemberById(id: string): Promise<any> {
    try {
      const member = await Member.findByPk(id);
      if (!member) throw new Error('Member not found');
      return member;
    } catch (error) {
      console.error(`Error fetching member with ID ${id}:`, error);
      throw error;
    }
  }

  async updateMember(id: string, updateData: Record<string, unknown>): Promise<any> {
    try {
      const member = (await Member.findByPk(id)) as any;
      if (!member) throw new Error('Member not found');
      return await member.update(updateData);
    } catch (error) {
      console.error(`Error updating member with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteMember(id: string): Promise<void> {
    try {
      const member = (await Member.findByPk(id)) as any;
      if (!member) throw new Error('Member not found');
      await member.destroy();
    } catch (error) {
      console.error(`Error deleting member with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new MemberService();
