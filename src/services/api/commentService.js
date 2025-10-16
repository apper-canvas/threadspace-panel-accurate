import { getApperClient } from '@/services/apperClient';

export class CommentService {
  static async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "post_id_c"}},
          {"field": {"Name": "parent_id_c"}},
          {"field": {"Name": "author_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "score_c"}}
        ]
      };
      
      const response = await apperClient.fetchRecords('comment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(comment => ({
        Id: comment.Id,
        postId: comment.post_id_c || 0,
        parentId: comment.parent_id_c || null,
        author: comment.author_c || '',
        content: comment.content_c || '',
        timestamp: comment.timestamp_c || new Date().toISOString(),
        score: comment.score_c || 0
      }));
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  }

  static async getByPostId(postId) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "post_id_c"}},
          {"field": {"Name": "parent_id_c"}},
          {"field": {"Name": "author_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "score_c"}}
        ],
        where: [{
          "FieldName": "post_id_c",
          "Operator": "EqualTo",
          "Values": [parseInt(postId)]
        }]
      };
      
      const response = await apperClient.fetchRecords('comment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(comment => ({
        Id: comment.Id,
        postId: comment.post_id_c || 0,
        parentId: comment.parent_id_c || null,
        author: comment.author_c || '',
        content: comment.content_c || '',
        timestamp: comment.timestamp_c || new Date().toISOString(),
        score: comment.score_c || 0
      }));
    } catch (error) {
      console.error(`Error fetching comments for post ${postId}:`, error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "post_id_c"}},
          {"field": {"Name": "parent_id_c"}},
          {"field": {"Name": "author_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "score_c"}}
        ]
      };
      
      const response = await apperClient.getRecordById('comment_c', parseInt(id), params);
      
      if (!response.success || !response.data) {
        return null;
      }
      
      const comment = response.data;
      return {
        Id: comment.Id,
        postId: comment.post_id_c || 0,
        parentId: comment.parent_id_c || null,
        author: comment.author_c || '',
        content: comment.content_c || '',
        timestamp: comment.timestamp_c || new Date().toISOString(),
        score: comment.score_c || 0
      };
    } catch (error) {
      console.error(`Error fetching comment ${id}:`, error);
      return null;
    }
  }

  static async create(commentData) {
    try {
      if (!commentData.content || !commentData.content.trim()) {
        throw new Error('Comment content is required');
      }

      const apperClient = getApperClient();
      const params = {
        records: [{
          post_id_c: parseInt(commentData.postId),
          parent_id_c: commentData.parentId ? parseInt(commentData.parentId) : 0,
          author_c: commentData.author || 'Anonymous',
          content_c: commentData.content.trim(),
          timestamp_c: new Date().toISOString(),
          score_c: 0
        }]
      };
      
      const response = await apperClient.createRecord('comment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error('Failed to create comment');
      }
      
      if (response.results && response.results.length > 0) {
        const created = response.results[0];
        if (created.success) {
          const comment = created.data;
          return {
            Id: comment.Id,
            postId: comment.post_id_c || 0,
            parentId: comment.parent_id_c || null,
            author: comment.author_c || '',
            content: comment.content_c || '',
            timestamp: comment.timestamp_c || new Date().toISOString(),
            score: comment.score_c || 0
          };
        }
      }
      
      throw new Error('Failed to create comment');
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const apperClient = getApperClient();
      
      const allComments = await this.getAll();
      const childComments = allComments.filter(c => c.parentId === parseInt(id));
      const idsToDelete = [parseInt(id), ...childComments.map(c => c.Id)];
      
      const params = {
        RecordIds: idsToDelete
      };
      
      const response = await apperClient.deleteRecord('comment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error('Comment not found');
      }
      
      return { Id: id };
    } catch (error) {
      console.error(`Error deleting comment ${id}:`, error);
      throw error;
    }
  }

  static async updateScore(id, newScore) {
    try {
      const apperClient = getApperClient();
      const params = {
        records: [{
          Id: parseInt(id),
          score_c: newScore
        }]
      };
      
      const response = await apperClient.updateRecord('comment_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error('Comment not found');
      }
      
      if (response.results && response.results.length > 0) {
        const updated = response.results[0];
        if (updated.success) {
          return await this.getById(id);
        }
      }
      
      throw new Error('Failed to update comment score');
    } catch (error) {
      console.error(`Error updating comment score ${id}:`, error);
      throw error;
    }
  }
}

export const commentService = CommentService;