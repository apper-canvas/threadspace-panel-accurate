import React, { useState } from "react";
import { useAuth } from "@/layouts/Root";
import { useSelector } from "react-redux";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";


const Header = ({ onCreatePost }) => {
  const { logout } = useAuth();
  const { user, isAuthenticated } = useSelector((state) => state.user);
return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center">
              <ApperIcon name="MessageSquare" size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">ThreadSpace</h1>
          </div>
          
          <div className="hidden md:block w-96">
            <SearchBar />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onCreatePost}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-full font-medium transition-colors duration-200"
          >
            <ApperIcon name="Plus" size={18} />
            <span>Create Post</span>
          </button>
          
          {isAuthenticated && (
            <button
              onClick={logout}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full font-medium transition-colors duration-200"
            >
              <ApperIcon name="LogOut" size={18} />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-6 pb-4">
        <SearchBar />
      </div>
    </header>
  );
};

export default Header;