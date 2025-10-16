import { getApperClient } from "@/services/apperClient";

export class PostService {
  static savedPostIds = new Set();

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
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "author_c"}},
          {"field": {"Name": "community_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "comment_count_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "post_type_c"}},
          {"field": {"Name": "image_url_c"}},
          {"field": {"Name": "link_url_c"}},
          {"field": {"Name": "poll_options_c"}},
          {"field": {"Name": "user_vote_c"}},
          {"field": {"Name": "user_poll_vote_c"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {
                  "fieldName": "title_c",
                  "operator": "Contains",
                  "values": [searchTerm]
                }
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {
                  "fieldName": "content_c",
                  "operator": "Contains",
                  "values": [searchTerm]
                }
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {
                  "fieldName": "author_c",
                  "operator": "Contains",
                  "values": [searchTerm]
                }
              ],
              "operator": "OR"
            },
            {
              "conditions": [
                {
                  "fieldName": "tags_c",
                  "operator": "Contains",
                  "values": [searchTerm]
                }
              ],
              "operator": "OR"
            }
          ]
        }]
      };
      
      const response = await apperClient.fetchRecords('post_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      const results = [];
      for (const post of response.data) {
        let snippet = '';
        const title = post.title_c || '';
        const content = post.content_c || '';
        const author = post.author_c || '';
        const tagsStr = post.tags_c || '';
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];
        
        if (title.toLowerCase().includes(searchTerm)) {
          const index = title.toLowerCase().indexOf(searchTerm);
          const start = Math.max(0, index - 30);
          const end = Math.min(title.length, index + searchTerm.length + 30);
          snippet = title.substring(start, end);
        } else if (content.toLowerCase().includes(searchTerm)) {
          const index = content.toLowerCase().indexOf(searchTerm);
          const start = Math.max(0, index - 40);
          const end = Math.min(content.length, index + searchTerm.length + 40);
          snippet = content.substring(start, end);
        } else if (tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
          const matchedTag = tags.find(tag => tag.toLowerCase().includes(searchTerm));
          snippet = `Tagged with: ${matchedTag}`;
        } else if (author.toLowerCase().includes(searchTerm)) {
          snippet = `Posted by u/${author}`;
        }

        results.push({
          post: this.transformPost(post),
          snippet: snippet.trim()
        });
      }
      
      return results;
    } catch (error) {
      console.error("Error searching posts:", error);
      return [];
    }
  }

  static transformPost(post) {
    const tagsStr = post.tags_c || '';
    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];
    
    let pollOptions = null;
    if (post.poll_options_c) {
      try {
        pollOptions = JSON.parse(post.poll_options_c);
      } catch (e) {
        console.error('Error parsing poll options:', e);
      }
    }
    
    return {
      Id: post.Id,
      id: `post_${post.Id}`,
      title: post.title_c || '',
      content: post.content_c || '',
      author: post.author_c || '',
      community: post.community_c || '',
      score: post.score_c || 0,
      userVote: post.user_vote_c || 0,
      timestamp: post.timestamp_c || new Date().toISOString(),
      commentCount: post.comment_count_c || 0,
      tags: tags,
      postType: post.post_type_c || 'text',
      imageUrl: post.image_url_c || null,
      linkUrl: post.link_url_c || null,
      pollOptions: pollOptions,
      userPollVote: post.user_poll_vote_c || null
    };
  }

  static async getAll() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "author_c"}},
          {"field": {"Name": "community_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "comment_count_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "post_type_c"}},
          {"field": {"Name": "image_url_c"}},
          {"field": {"Name": "link_url_c"}},
          {"field": {"Name": "poll_options_c"}},
          {"field": {"Name": "user_vote_c"}},
          {"field": {"Name": "user_poll_vote_c"}}
        ],
        orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}]
      };
      
      const response = await apperClient.fetchRecords('post_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(post => this.transformPost(post));
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "author_c"}},
          {"field": {"Name": "community_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "comment_count_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "post_type_c"}},
          {"field": {"Name": "image_url_c"}},
          {"field": {"Name": "link_url_c"}},
          {"field": {"Name": "poll_options_c"}},
          {"field": {"Name": "user_vote_c"}},
          {"field": {"Name": "user_poll_vote_c"}}
        ]
      };
      
      const response = await apperClient.getRecordById('post_c', parseInt(id), params);
      
      if (!response.success || !response.data) {
        return null;
      }
      
      return this.transformPost(response.data);
    } catch (error) {
      console.error(`Error fetching post ${id}:`, error);
      return null;
    }
  }

  static async getPopular() {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "author_c"}},
          {"field": {"Name": "community_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "comment_count_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "post_type_c"}},
          {"field": {"Name": "image_url_c"}},
          {"field": {"Name": "link_url_c"}},
          {"field": {"Name": "poll_options_c"}},
          {"field": {"Name": "user_vote_c"}},
          {"field": {"Name": "user_poll_vote_c"}}
        ],
        where: [{
          "FieldName": "score_c",
          "Operator": "GreaterThanOrEqualTo",
          "Values": [50]
        }],
        orderBy: [{"fieldName": "score_c", "sorttype": "DESC"}]
      };
      
      const response = await apperClient.fetchRecords('post_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(post => this.transformPost(post));
    } catch (error) {
      console.error("Error fetching popular posts:", error);
      return [];
    }
  }

  static async getByCommunity(communityName) {
    try {
      const apperClient = getApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "content_c"}},
          {"field": {"Name": "author_c"}},
          {"field": {"Name": "community_c"}},
          {"field": {"Name": "score_c"}},
          {"field": {"Name": "timestamp_c"}},
          {"field": {"Name": "comment_count_c"}},
          {"field": {"Name": "tags_c"}},
          {"field": {"Name": "post_type_c"}},
          {"field": {"Name": "image_url_c"}},
          {"field": {"Name": "link_url_c"}},
          {"field": {"Name": "poll_options_c"}},
          {"field": {"Name": "user_vote_c"}},
          {"field": {"Name": "user_poll_vote_c"}}
        ],
        where: [{
          "FieldName": "community_c",
          "Operator": "EqualTo",
          "Values": [communityName]
        }],
        orderBy: [{"fieldName": "timestamp_c", "sorttype": "DESC"}]
      };
      
      const response = await apperClient.fetchRecords('post_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      return response.data.map(post => this.transformPost(post));
    } catch (error) {
      console.error(`Error fetching posts for community ${communityName}:`, error);
      return [];
    }
  }

  static async addComment(postId, commentId) {
    try {
      const post = await this.getById(postId);
      if (!post) return false;
      
      const newCount = (post.commentCount || 0) + 1;
      await this.update(postId, { commentCount: newCount });
      return true;
    } catch (error) {
      console.error(`Error adding comment to post ${postId}:`, error);
      return false;
    }
  }

  static async create(postData) {
    try {
      const apperClient = getApperClient();
      
      let pollOptionsStr = null;
      if (postData.pollOptions && Array.isArray(postData.pollOptions)) {
        pollOptionsStr = JSON.stringify(postData.pollOptions);
      }
      
      const tagsStr = Array.isArray(postData.tags) ? postData.tags.join(',') : '';
      
      const params = {
        records: [{
          title_c: postData.title || '',
          content_c: postData.content || '',
          author_c: postData.author || '',
          community_c: postData.community || '',
          score_c: postData.score || 1,
          user_vote_c: postData.userVote || 1,
          timestamp_c: postData.timestamp || new Date().toISOString(),
          comment_count_c: 0,
          tags_c: tagsStr,
          post_type_c: postData.postType || 'text',
          image_url_c: postData.imageUrl || '',
          link_url_c: postData.linkUrl || '',
          poll_options_c: pollOptionsStr || '',
          user_poll_vote_c: ''
        }]
      };
      
      const response = await apperClient.createRecord('post_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return null;
      }
      
      if (response.results && response.results.length > 0) {
        const created = response.results[0];
        if (created.success) {
          return this.transformPost(created.data);
        }
      }
      
      return null;
    } catch (error) {
      console.error("Error creating post:", error);
      return null;
    }
  }

  static async update(id, updateData) {
    try {
      const apperClient = getApperClient();
      const updateRecord = { Id: parseInt(id) };
      
      if (updateData.title) updateRecord.title_c = updateData.title;
      if (updateData.content !== undefined) updateRecord.content_c = updateData.content;
      if (updateData.author) updateRecord.author_c = updateData.author;
      if (updateData.community) updateRecord.community_c = updateData.community;
      if (updateData.score !== undefined) updateRecord.score_c = updateData.score;
      if (updateData.userVote !== undefined) updateRecord.user_vote_c = updateData.userVote;
      if (updateData.commentCount !== undefined) updateRecord.comment_count_c = updateData.commentCount;
      if (updateData.postType) updateRecord.post_type_c = updateData.postType;
      if (updateData.imageUrl !== undefined) updateRecord.image_url_c = updateData.imageUrl;
      if (updateData.linkUrl !== undefined) updateRecord.link_url_c = updateData.linkUrl;
      if (updateData.userPollVote !== undefined) updateRecord.user_poll_vote_c = updateData.userPollVote || '';
      
      if (updateData.tags && Array.isArray(updateData.tags)) {
        updateRecord.tags_c = updateData.tags.join(',');
      }
      
      if (updateData.pollOptions) {
        updateRecord.poll_options_c = JSON.stringify(updateData.pollOptions);
      }
      
      const params = {
        records: [updateRecord]
      };
      
      const response = await apperClient.updateRecord('post_c', params);
      
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
      console.error(`Error updating post ${id}:`, error);
      return null;
    }
  }

  static async delete(id) {
    try {
      const apperClient = getApperClient();
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('post_c', params);
      
      if (!response.success) {
        console.error(response.message);
        return false;
      }
      
      return response.results && response.results.length > 0 && response.results[0].success;
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error);
      return false;
    }
  }

  static async vote(postId, voteValue) {
    try {
      const post = await this.getById(postId.replace('post_', ''));
      if (!post) return null;
      
      const oldVote = post.userVote || 0;
      const newVote = oldVote === voteValue ? 0 : voteValue;
      const scoreDiff = newVote - oldVote;
      
      const newScore = post.score + scoreDiff;
      
      await this.update(post.Id, { 
        score: newScore, 
        userVote: newVote 
      });
      
      return {
        ...post,
        score: newScore,
        userVote: newVote
      };
    } catch (error) {
      console.error(`Error voting on post ${postId}:`, error);
      return null;
    }
  }

  static async pollVote(postId, optionId) {
    try {
      const post = await this.getById(postId.replace('post_', ''));
      if (!post || post.postType !== 'poll' || !post.pollOptions) return null;
      
      const pollOptions = [...post.pollOptions];
      const option = pollOptions.find(opt => opt.Id === optionId);
      if (!option) return null;
      
      if (post.userPollVote !== null && post.userPollVote !== '') {
        const prevOption = pollOptions.find(opt => opt.Id === parseInt(post.userPollVote));
        if (prevOption) {
          prevOption.voteCount = Math.max(0, prevOption.voteCount - 1);
        }
      }
      
      let newUserPollVote = null;
      if (post.userPollVote === optionId.toString()) {
        newUserPollVote = null;
      } else {
        option.voteCount += 1;
        newUserPollVote = optionId.toString();
      }
      
      await this.update(post.Id, {
        pollOptions: pollOptions,
        userPollVote: newUserPollVote
      });
      
      return {
        ...post,
        pollOptions: pollOptions,
        userPollVote: newUserPollVote
      };
    } catch (error) {
      console.error(`Error poll voting on post ${postId}:`, error);
      return null;
    }
  }

  static async toggleSave(postId) {
    if (this.savedPostIds.has(postId)) {
      this.savedPostIds.delete(postId);
      return { saved: false };
    } else {
      this.savedPostIds.add(postId);
      return { saved: true };
    }
  }

  static async isSaved(postId) {
    return this.savedPostIds.has(postId);
  }

  static async getSaved() {
    try {
      if (this.savedPostIds.size === 0) {
        return [];
      }
      
      const allPosts = await this.getAll();
      return allPosts.filter(post => this.savedPostIds.has(post.id));
    } catch (error) {
      console.error("Error fetching saved posts:", error);
      return [];
}
  }
}