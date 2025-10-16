import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import Button from '@/components/atoms/Button';
import PostCard from '@/components/organisms/PostCard';
import { UserService } from '@/services/api/userService';
import { postService } from '@/services/api/postService';
import { commentService } from '@/services/api/commentService';

function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    loadUserProfile();
  }, [username]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

const userData = await UserService.getByUsername(username);
      if (!userData) {
        setError('User not found');
        setLoading(false);
        return;
      }

      setUser(userData);

      const allPosts = await postService.getAll();
      const filteredPosts = allPosts.filter(post => post.author === username);
      setUserPosts(filteredPosts);

      const allComments = await commentService.getAll();
      const filteredComments = allComments.filter(comment => comment.author === username);
      setUserComments(filteredComments);

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load user profile');
      setLoading(false);
      toast.error('Failed to load profile');
    }
  };

  const handleVote = async (postId, voteType) => {
    try {
      await postService.vote(postId, voteType);
      const updatedPosts = await postService.getAll();
      const filteredPosts = updatedPosts.filter(post => post.author === username);
      setUserPosts(filteredPosts);
      toast.success(`Post ${voteType}d`);
    } catch (err) {
      toast.error('Failed to vote on post');
    }
  };

  if (loading) {
    return <Loading message="Loading profile..." />;
  }

  if (error) {
    return <Error message={error} />;
  }

  if (!user) {
    return <Empty message="User not found" />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="bg-surface rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center text-surface text-2xl font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-secondary mb-1">u/{user.username}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <ApperIcon name="Calendar" size={16} />
                <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <ApperIcon name="Award" size={16} />
                <span>{user.karma} karma</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => navigate('/communities')}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Users" size={16} />
                Browse Communities
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ApperIcon name="Home" size={16} />
                Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-surface rounded-lg shadow-sm mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-accent border-b-2 border-accent'
                : 'text-gray-600 hover:text-secondary'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ApperIcon name="FileText" size={16} />
              <span>Posts ({userPosts.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'text-accent border-b-2 border-accent'
                : 'text-gray-600 hover:text-secondary'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ApperIcon name="MessageSquare" size={16} />
              <span>Comments ({userComments.length})</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {userPosts.length === 0 ? (
            <Empty message="No posts yet" />
          ) : (
            userPosts.map(post => (
              <PostCard
                key={post.Id}
                post={post}
                onVote={handleVote}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'comments' && (
        <div className="space-y-4">
          {userComments.length === 0 ? (
            <Empty message="No comments yet" />
          ) : (
            userComments.map(comment => (
              <div key={comment.Id} className="bg-surface rounded-lg shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1">
                    <button className="text-gray-400 hover:text-primary transition-colors">
                      <ApperIcon name="ArrowUp" size={18} />
                    </button>
                    <span className="text-sm font-medium text-secondary">{comment.votes}</span>
                    <button className="text-gray-400 hover:text-accent transition-colors">
                      <ApperIcon name="ArrowDown" size={18} />
                    </button>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600 mb-2">
                      Commented on{' '}
                      <button
                        onClick={() => navigate(`/post/${comment.postId}`)}
                        className="text-accent hover:underline"
                      >
                        post #{comment.postId}
                      </button>
                    </div>
                    <p className="text-secondary">{comment.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;