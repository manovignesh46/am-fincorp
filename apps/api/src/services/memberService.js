const { Member, sequelize } = require('@am-fincorp/database');

class MemberService {
  async createMember(memberData) {
    try {
      return await Member.create(memberData);
    } catch (error) {
      console.error('Error creating member:', error);
      throw new Error('Could not create member: ' + error.message);
    }
  }

  async getAllMembers() {
    try {
      return await Member.findAll();
    } catch (error) {
      console.error('Error fetching members:', error);
      throw new Error('Could not fetch members');
    }
  }

  async getMemberById(id) {
    try {
      const member = await Member.findByPk(id);
      if (!member) throw new Error('Member not found');
      return member;
    } catch (error) {
      console.error(`Error fetching member with ID ${id}:`, error);
      throw error;
    }
  }

  async updateMember(id, updateData) {
    try {
      const member = await Member.findByPk(id);
      if (!member) throw new Error('Member not found');
      return await member.update(updateData);
    } catch (error) {
      console.error(`Error updating member with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteMember(id) {
    try {
      const member = await Member.findByPk(id);
      if (!member) throw new Error('Member not found');
      await member.destroy();
    } catch (error) {
      console.error(`Error deleting member with ID ${id}:`, error);
      throw error;
    }
  }
}

module.exports = new MemberService();
