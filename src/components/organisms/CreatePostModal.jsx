import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import { PostService } from "@/services/api/postService";
import { CommunityService } from "@/services/api/communityService";
import { cn } from "@/utils/cn";

const CreatePostModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    community: ""
  });
  const [communities, setCommunities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadCommunities();
      // Reset form when modal opens
      setFormData({ title: "", content: "", community: "" });
      setErrors({});
    }
  }, [isOpen]);

  const loadCommunities = async () => {
    try {
      const fetchedCommunities = await CommunityService.getAll();
      setCommunities(fetchedCommunities);
      if (fetchedCommunities.length > 0) {
        setFormData(prev => ({ ...prev, community: fetchedCommunities[0].name }));
      }
    } catch (err) {
      toast.error("Failed to load communities");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 300) {
      newErrors.title = "Title must be less than 300 characters";
    }
    
    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    } else if (formData.content.length > 10000) {
      newErrors.content = "Content must be less than 10,000 characters";
    }
    
    if (!formData.community) {
      newErrors.community = "Please select a community";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newPost = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        community: formData.community,
        author: "currentUser",
        timestamp: new Date().toISOString(),
        score: 1,
        userVote: 1,
        commentCount: 0
      };
      
      await PostService.create(newPost);
      toast.success("Post created successfully!");
      onClose();
      
      // Refresh the page to show the new post
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (err) {
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create a Post</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <ApperIcon name="X" size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <Select
            label="Community"
            value={formData.community}
            onChange={(e) => handleInputChange("community", e.target.value)}
            error={errors.community}
          >
            <option value="">Select a community</option>
            {communities.map(community => (
              <option key={community.id} value={community.name}>
                r/{community.name}
              </option>
            ))}
          </Select>
          
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            placeholder="An interesting title..."
            error={errors.title}
            maxLength={300}
          />
          
          <div className="space-y-2">
            <Textarea
              label="Content"
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              placeholder="What are your thoughts?"
              rows={8}
              error={errors.content}
              maxLength={10000}
            />
            <div className="text-sm text-gray-500 text-right">
              {formData.content.length}/10,000 characters
            </div>
          </div>
        </form>
        
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
            className="flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <ApperIcon name="Loader2" size={16} className="animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <ApperIcon name="Send" size={16} />
                Post
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;