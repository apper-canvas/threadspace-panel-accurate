import { formatDistanceToNow } from "date-fns";
import VoteButtons from "@/components/molecules/VoteButtons";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const PostCard = ({ post, onVote }) => {
  const timeAgo = formatDistanceToNow(new Date(post.timestamp), { addSuffix: true });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:post-card-hover group">
      <div className="flex gap-4">
        <VoteButtons
          score={post.score}
          userVote={post.userVote}
          onVote={onVote}
          postId={post.id}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">
              r/{post.community}
            </span>
            <span>•</span>
            <span>Posted by u/{post.author}</span>
            <span>•</span>
            <span>{timeAgo}</span>
</div>
          
          <h2 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-primary transition-colors duration-200">
            {post.title}
          </h2>
          
          {post.content && (
            <p className="text-gray-700 mb-4 leading-relaxed line-clamp-3">
              {post.content}
            </p>
          )}
{post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 overflow-x-auto pb-1">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 bg-primary text-white rounded-full text-xs font-medium whitespace-nowrap hover:bg-primary/90 transition-colors duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <button className="flex items-center gap-2 hover:text-gray-700 transition-colors duration-200 p-1">
              <ApperIcon name="MessageCircle" size={16} />
              <span>{post.commentCount} comments</span>
            </button>
            
            <button className="flex items-center gap-2 hover:text-gray-700 transition-colors duration-200 p-1">
              <ApperIcon name="Share" size={16} />
              <span>Share</span>
            </button>
            
            <button className="flex items-center gap-2 hover:text-gray-700 transition-colors duration-200 p-1">
              <ApperIcon name="Bookmark" size={16} />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;