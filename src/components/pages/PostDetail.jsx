import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import { PostService } from "@/services/api/postService";
import { CommentService } from "@/services/api/commentService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Button from "@/components/atoms/Button";
import Textarea from "@/components/atoms/Textarea";
import VoteButtons from "@/components/molecules/VoteButtons";

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPostAndComments();
  }, [id]);

  async function loadPostAndComments() {
    try {
      setLoading(true);
      setError(null);
      
      const [postData, commentsData] = await Promise.all([
        PostService.getById(id),
        CommentService.getByPostId(id)
      ]);

      if (!postData) {
        setError('Post not found');
        setLoading(false);
        return;
      }

      setPost(postData);
      setComments(commentsData);
    } catch (err) {
      setError(err.message || 'Failed to load post details');
      toast.error('Failed to load post details');
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(postId, voteValue) {
    try {
      const currentPost = { ...post };
      let newScore = currentPost.score;
      let newUserVote = voteValue;

      if (currentPost.userVote === voteValue) {
        newScore -= voteValue;
        newUserVote = 0;
      } else if (currentPost.userVote === 0) {
        newScore += voteValue;
      } else {
        newScore += voteValue * 2;
      }

      setPost({ ...currentPost, score: newScore, userVote: newUserVote });
      await PostService.update(postId, { score: newScore, userVote: newUserVote });
      toast.success('Vote updated');
    } catch (err) {
      toast.error('Failed to update vote');
      setPost(post);
    }
  }

  async function handleCommentVote(commentId, voteValue) {
    try {
      const comment = comments.find(c => c.Id === commentId);
      if (!comment) return;

      const newScore = comment.score + voteValue;
      await CommentService.updateScore(commentId, newScore);
      
      setComments(prev => prev.map(c => 
        c.Id === commentId ? { ...c, score: newScore } : c
      ));
      
      toast.success('Vote updated');
    } catch (err) {
      toast.error('Failed to update vote');
    }
  }

  async function handleSubmitComment(e) {
    e.preventDefault();
    
    if (!commentContent.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      const newComment = await CommentService.create({
        postId: id,
        parentId: null,
        author: 'currentUser',
        content: commentContent
      });

      await PostService.addComment(id, newComment.Id);
      
      setComments(prev => [...prev, newComment]);
      setPost(prev => ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }));
      setCommentContent('');
      toast.success('Comment added successfully');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  }

  function renderComments() {
    const topLevelComments = comments.filter(c => c.parentId === null);
    
    if (topLevelComments.length === 0) {
      return (
        <Empty 
          title="No comments yet" 
          message="Be the first to share your thoughts!"
        />
      );
    }

    return topLevelComments.map(comment => (
      <CommentCard 
        key={comment.Id} 
        comment={comment} 
        replies={comments.filter(c => c.parentId === comment.Id)}
        onVote={handleCommentVote}
      />
    ));
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadPostAndComments} />;
  }

  if (!post) {
    return <Empty title="Post not found" message="This post may have been removed or doesn't exist." />;
  }

  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center gap-2"
      >
        <ApperIcon name="ArrowLeft" size={16} />
        Back
      </Button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex gap-4">
          <VoteButtons
            score={post.score}
            userVote={post.userVote}
            onVote={handleVote}
            postId={post.Id}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <Link 
                to={`/communities/${post.community}`}
                className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium hover:from-primary/20 hover:to-primary/30 transition-colors"
              >
                r/{post.community}
              </Link>
              <span>•</span>
              <span>Posted by u/{post.author}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>
            
            {post.postType === 'text' && post.content && (
              <div className="text-gray-700 mb-4 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            )}
            
            {post.postType === 'image' && post.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img 
                  src={post.imageUrl} 
                  alt={post.title}
                  className="w-full max-h-[600px] object-contain cursor-pointer"
                  onClick={() => window.open(post.imageUrl, '_blank')}
                />
              </div>
            )}
            
            {post.postType === 'link' && post.linkUrl && (
              <a
                href={post.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <ApperIcon name="ExternalLink" size={20} className="text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-accent truncate">
                    {new URL(post.linkUrl).hostname}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {post.linkUrl}
                  </div>
                </div>
                <ApperIcon name="ArrowRight" size={16} className="text-gray-400" />
              </a>
            )}
            
            <div className="flex items-center gap-6 text-sm text-gray-500 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <ApperIcon name="MessageCircle" size={16} />
                <span>{post.commentCount || 0} comments</span>
              </div>
              
              <button className="flex items-center gap-2 hover:text-gray-700 transition-colors p-1">
                <ApperIcon name="Share" size={16} />
                <span>Share</span>
              </button>
              
              <button className="flex items-center gap-2 hover:text-gray-700 transition-colors p-1">
                <ApperIcon name="Bookmark" size={16} />
                <span>Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Add a Comment</h2>
        <form onSubmit={handleSubmitComment}>
          <Textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="What are your thoughts?"
            rows={4}
            className="mb-3"
            disabled={submitting}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting || !commentContent.trim()}
              className="min-w-[100px]"
            >
              {submitting ? 'Posting...' : 'Comment'}
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Comments ({comments.length})
        </h2>
        <div className="space-y-4">
          {renderComments()}
        </div>
      </div>
    </div>
  );
}

function CommentCard({ comment, replies, onVote, depth = 0 }) {
  const timeAgo = formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true });
  const [showReplies, setShowReplies] = useState(true);

  return (
    <div className={`${depth > 0 ? 'ml-8 pl-4 border-l-2 border-gray-200' : ''}`}>
      <div className="py-3">
<div className="flex items-start gap-3">
          <VoteButtons
            score={comment.score}
            onVote={(voteValue) => onVote(comment.Id, voteValue)}
            size="sm"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span className="font-medium text-gray-900">u/{comment.author}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-2">
              {comment.content}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                <ApperIcon name="MessageCircle" size={14} />
                <span>Reply</span>
              </button>
              
              <button className="flex items-center gap-1 hover:text-gray-700 transition-colors">
                <ApperIcon name="Share" size={14} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
        
        {replies && replies.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1 mb-2"
            >
              <ApperIcon name={showReplies ? "ChevronUp" : "ChevronDown"} size={14} />
              {showReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </button>
            
            {showReplies && (
              <div className="space-y-4">
                {replies.map(reply => (
                  <CommentCard
                    key={reply.Id}
                    comment={reply}
                    replies={[]}
                    onVote={onVote}
                    depth={depth + 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}