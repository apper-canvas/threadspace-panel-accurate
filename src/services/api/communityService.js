import communitiesData from "@/services/mockData/communities.json";

export class CommunityService {
  static communities = [...communitiesData];

  static delay = () => new Promise(resolve => setTimeout(resolve, 250));

  static async getAll() {
    await this.delay();
    return [...this.communities.map(community => ({ ...community }))];
  }

  static async getById(id) {
    await this.delay();
    const community = this.communities.find(c => c.Id === parseInt(id));
    return community ? { ...community } : null;
  }

  static async getByName(name) {
    await this.delay();
    const community = this.communities.find(c => c.name.toLowerCase() === name.toLowerCase());
    return community ? { ...community } : null;
  }

  static async create(communityData) {
    await this.delay();
    
    const maxId = Math.max(...this.communities.map(c => c.Id), 0);
    const newCommunity = {
      Id: maxId + 1,
      id: `community_${maxId + 1}`,
      name: communityData.name,
      description: communityData.description,
      memberCount: communityData.memberCount || 1,
      color: communityData.color || "#FF4500"
    };
    
    this.communities.push(newCommunity);
    return { ...newCommunity };
  }

  static async update(id, updateData) {
    await this.delay();
    
    const index = this.communities.findIndex(c => c.Id === parseInt(id));
    if (index === -1) return null;
    
    this.communities[index] = { ...this.communities[index], ...updateData };
    return { ...this.communities[index] };
  }

  static async delete(id) {
    await this.delay();
    
    const index = this.communities.findIndex(c => c.Id === parseInt(id));
    if (index === -1) return false;
    
    this.communities.splice(index, 1);
    return true;
  }
}