import { getApperClient } from '@/services/apperClient';

export const UserService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "username_c"}},
          {"field": {"Name": "display_name_c"}},
          {"field": {"Name": "avatar_c"}},
          {"field": {"Name": "bio_c"}},
          {"field": {"Name": "join_date_c"}},
          {"field": {"Name": "karma_c"}}
        ]
      };
      
      const response = await apperClient.fetchRecords('user_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(user => ({
        Id: user.Id,
        username: user.username_c || '',
        displayName: user.display_name_c || '',
        avatar: user.avatar_c || '',
        bio: user.bio_c || '',
        joinDate: user.join_date_c || new Date().toISOString(),
        karma: user.karma_c || 0
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "username_c"}},
          {"field": {"Name": "display_name_c"}},
          {"field": {"Name": "avatar_c"}},
          {"field": {"Name": "bio_c"}},
          {"field": {"Name": "join_date_c"}},
          {"field": {"Name": "karma_c"}}
        ]
      };
      
      const response = await apperClient.getRecordById('user_c', id, params);
      
      if (!response.success || !response.data) {
        return null;
      }
      
      const user = response.data;
      return {
        Id: user.Id,
        username: user.username_c || '',
        displayName: user.display_name_c || '',
        avatar: user.avatar_c || '',
        bio: user.bio_c || '',
        joinDate: user.join_date_c || new Date().toISOString(),
        karma: user.karma_c || 0
      };
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  },

  async getByUsername(username) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "username_c"}},
          {"field": {"Name": "display_name_c"}},
          {"field": {"Name": "avatar_c"}},
          {"field": {"Name": "bio_c"}},
          {"field": {"Name": "join_date_c"}},
          {"field": {"Name": "karma_c"}}
        ],
        where: [{
          "FieldName": "username_c",
          "Operator": "EqualTo",
          "Values": [username]
        }]
      };
      
      const response = await apperClient.fetchRecords('user_c', params);
      
      if (!response.success || !response.data || response.data.length === 0) {
        return null;
      }
      
      const user = response.data[0];
      return {
        Id: user.Id,
        username: user.username_c || '',
        displayName: user.display_name_c || '',
        avatar: user.avatar_c || '',
        bio: user.bio_c || '',
        joinDate: user.join_date_c || new Date().toISOString(),
        karma: user.karma_c || 0
      };
    } catch (error) {
      console.error(`Error fetching user by username ${username}:`, error);
      return null;
    }
  },

  async create(userData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          username_c: userData.username || '',
          display_name_c: userData.displayName || userData.username || '',
          avatar_c: userData.avatar || '',
          bio_c: userData.bio || '',
          join_date_c: new Date().toISOString(),
          karma_c: 0
        }]
      };
      
      const response = await apperClient.createRecord('user_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      if (response.results && response.results.length > 0) {
        const created = response.results[0];
        if (created.success) {
          const user = created.data;
          return {
            Id: user.Id,
            username: user.username_c || '',
            displayName: user.display_name_c || '',
            avatar: user.avatar_c || '',
            bio: user.bio_c || '',
            joinDate: user.join_date_c || new Date().toISOString(),
            karma: user.karma_c || 0
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  },

  async update(id, userData) {
    try {
      const apperClient = getApperClient();
      const updateData = { Id: id };
      
      if (userData.username) updateData.username_c = userData.username;
      if (userData.displayName) updateData.display_name_c = userData.displayName;
      if (userData.avatar) updateData.avatar_c = userData.avatar;
      if (userData.bio) updateData.bio_c = userData.bio;
      if (userData.karma !== undefined) updateData.karma_c = userData.karma;
      
      const params = {
        records: [updateData]
      };
      
      const response = await apperClient.updateRecord('user_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      if (response.results && response.results.length > 0) {
        const updated = response.results[0];
        if (updated.success) {
          return await this.getById(id);
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [id]
      };
      
      const response = await apperClient.deleteRecord('user_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }
      
      return response.results && response.results.length > 0 && response.results[0].success;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return false;
    }
  }
};