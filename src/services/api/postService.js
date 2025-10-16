import postsData from "@/services/mockData/posts.json";
import { CommunityService } from "@/services/api/communityService";

export class PostService {
  static posts = [...postsData];

  static delay = () => new Promise(resolve => setTimeout(resolve, 300));

  static async getAll() {
    await this.delay();
    return [...this.posts.map(post => ({ ...post }))];
  }

  static async getById(id) {
    await this.delay();
    const post = this.posts.find(p => p.Id === parseInt(id));
    return post ? { ...post } : null;
  }

  static async getPopular() {
    await this.delay();
    return [...this.posts]
      .filter(post => post.score >= 50)
      .sort((a, b) => b.score - a.score)
      .map(post => ({ ...post }));
  }

  static async create(postData) {
    await this.delay();
    
const maxId = Math.max(...this.posts.map(p => p.Id), 0);
    const newPost = {
      Id: maxId + 1,
      id: `post_${maxId + 1}`,
title: postData.title,
      content: postData.content,
      author: postData.author,
      community: postData.community,
      score: postData.score || 1,
      userVote: postData.userVote || 1,
      timestamp: postData.timestamp,
      commentCount: postData.commentCount || 0,
      tags: postData.tags || [],
      postType: postData.postType || 'text',
      imageUrl: postData.imageUrl || null,
      linkUrl: postData.linkUrl || null
    };
    
    this.posts.unshift(newPost);
    return { ...newPost };
  }

static async update(id, updateData) {
    await this.delay();
    
    const index = this.posts.findIndex(p => p.Id === parseInt(id));
    if (index === -1) return null;
    
    this.posts[index] = { ...this.posts[index], ...updateData, tags: updateData.tags || this.posts[index].tags };
    return { ...this.posts[index] };
  }

  static async delete(id) {
    await this.delay();
    
    const index = this.posts.findIndex(p => p.Id === parseInt(id));
    if (index === -1) return false;
    
    this.posts.splice(index, 1);
    return true;
  }

  static async vote(postId, voteValue) {
    await this.delay();
    
    const post = this.posts.find(p => p.id === postId);
    if (!post) return null;
    
    const oldVote = post.userVote || 0;
    const newVote = oldVote === voteValue ? 0 : voteValue;
    const scoreDiff = newVote - oldVote;
    
    post.userVote = newVote;
    post.score += scoreDiff;
    
    return { ...post };
  }
}