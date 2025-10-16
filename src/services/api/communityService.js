import { getApperClient } from "@/services/apperClient";

export class CommunityService {
  static async search(query) {
    try {
      if (!query || !query.trim()) {
        return [];
      }

      const apperClient = getApperClient();
      const searchTerm = query.toLowerCase().trim();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "member_count_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "Tags"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {
                  "fieldName": "name_c",
                  "operator": "Contains",
                  "values": [searchTerm]
                }
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {
                  "fieldName": "description_c",
                  "operator": "Contains",
                  "values": [searchTerm]
                }
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {
                  "fieldName": "Tags",
                  "operator": "Contains",
                  "values": [searchTerm]
                }
              ],
              "operator": "OR"
            }
          ]
        }]
      };
      
      const response = await apperClient.fetchRecords('community_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      const results = [];
      for (const community of response.data) {
        let snippet = '';
        const name = community.name_c || '';
        const description = community.description_c || '';
        const tags = community.Tags || '';
        
        if (description.toLowerCase().includes(searchTerm)) {
          const index = description.toLowerCase().indexOf(searchTerm);
          const start = Math.max(0, index - 40);
          const end = Math.min(description.length, index + searchTerm.length + 40);
          snippet = description.substring(start, end);
        } else if (tags.toLowerCase().includes(searchTerm)) {
          snippet = `Category: ${tags}`;
        }

        results.push({
          community: {
            Id: community.Id,
            name: name,
            description: description,
            memberCount: community.member_count_c || 0,
            color: community.color_c || "#FF4500",
            category: tags
          },
          snippet: snippet.trim()
        });
      }
      
      return results;
    } catch (error) {
      console.error("Error searching communities:", error);
      return [];
    }
  }

  static async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "member_count_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "Tags"}}
        ]
      };
      
      const response = await apperClient.fetchRecords('community_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(community => ({
        Id: community.Id,
        id: `community_${community.Id}`,
        name: community.name_c || '',
        description: community.description_c || '',
        memberCount: community.member_count_c || 0,
        color: community.color_c || "#FF4500",
        category: community.Tags || '',
        postCount: 0
      }));
    } catch (error) {
      console.error("Error fetching communities:", error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "member_count_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "Tags"}}
        ]
      };
      
      const response = await apperClient.getRecordById('community_c', parseInt(id), params);
      
      if (!response.success || !response.data) {
        return null;
      }
      
      const community = response.data;
      return {
        Id: community.Id,
        id: `community_${community.Id}`,
        name: community.name_c || '',
        description: community.description_c || '',
        memberCount: community.member_count_c || 0,
        color: community.color_c || "#FF4500",
        category: community.Tags || '',
        postCount: 0
      };
    } catch (error) {
      console.error(`Error fetching community ${id}:`, error);
      return null;
    }
  }

  static async getByName(name) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "member_count_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "Tags"}}
        ],
        where: [{
          "FieldName": "name_c",
          "Operator": "EqualTo",
          "Values": [name]
        }]
      };
      
      const response = await apperClient.fetchRecords('community_c', params);
      
      if (!response.success || !response.data || response.data.length === 0) {
        return null;
      }
      
      const community = response.data[0];
      return {
        Id: community.Id,
        id: `community_${community.Id}`,
        name: community.name_c || '',
        description: community.description_c || '',
        memberCount: community.member_count_c || 0,
        color: community.color_c || "#FF4500",
        category: community.Tags || '',
        postCount: 0
      };
    } catch (error) {
      console.error(`Error fetching community by name ${name}:`, error);
      return null;
    }
  }

  static async create(communityData) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          name_c: communityData.name || '',
          description_c: communityData.description || '',
          member_count_c: communityData.memberCount || 1,
          color_c: communityData.color || "#FF4500",
          Tags: communityData.category || ''
        }]
      };
      
      const response = await apperClient.createRecord('community_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      if (response.results && response.results.length > 0) {
        const created = response.results[0];
        if (created.success) {
          return await this.getById(created.data.Id);
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating community:", error);
      return null;
    }
  }

  static async update(id, updateData) {
    try {
      const apperClient = getApperClient();
      const updateRecord = { Id: parseInt(id) };
      
      if (updateData.name) updateRecord.name_c = updateData.name;
      if (updateData.description) updateRecord.description_c = updateData.description;
      if (updateData.memberCount !== undefined) updateRecord.member_count_c = updateData.memberCount;
      if (updateData.color) updateRecord.color_c = updateData.color;
      if (updateData.category) updateRecord.Tags = updateData.category;
      
      const params = {
        records: [updateRecord]
      };
      
      const response = await apperClient.updateRecord('community_c', params);
      
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
      console.error(`Error updating community ${id}:`, error);
      return null;
    }
  }

  static async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('community_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }
      
      return response.results && response.results.length > 0 && response.results[0].success;
    } catch (error) {
      console.error(`Error deleting community ${id}:`, error);
      return false;
}
  }
}