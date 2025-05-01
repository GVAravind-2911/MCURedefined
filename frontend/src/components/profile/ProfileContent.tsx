"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { BlogList } from "@/types/BlogTypes";
import type { Project } from "@/types/ProjectTypes";
import ProfileTabs from "./ProfileTabs";
import BlogComponent from "./blogs/ProfileBlogComponent";
import ProjectsGrid from "./ProjectsGrid";
import ProfileInfo from "./ProfileInfo";
import { BlogProvider } from "./blogs/ProfileBlogContext";
import ErrorMessage from "@/components/ErrorMessage";

interface LikedContentResponse {
  blogs?: BlogList[];
  projects?: Project[];
  total: number;
  total_pages?: number;
}

export default function ProfileContent({ session }) {
  const [activeTab, setActiveTab] = useState<"blogs" | "reviews" | "projects">("blogs");
  const [loading, setLoading] = useState<{[key: string]: boolean}>({
    blogs: true,
    reviews: true,
    projects: true
  });
  const [content, setContent] = useState<{[key: string]: LikedContentResponse}>({
    blogs: { blogs: [], total: 0 },
    reviews: { blogs: [], total: 0 },
    projects: { projects: [], total: 0 }
  });
  const [tags, setTags] = useState<{[key: string]: string[]}>({
    blogs: [],
    reviews: []
  });
  const [authors, setAuthors] = useState<{[key: string]: string[]}>({
    blogs: [],
    reviews: []
  });
  // Add error state for each content type
  const [errors, setErrors] = useState<{[key: string]: boolean}>({
    blogs: false,
    reviews: false,
    projects: false
  });
  
  // Function to reload data for the current tab
  const handleReload = () => {
    setLoading(prev => ({
      ...prev,
      [activeTab]: true
    }));
    setErrors(prev => ({
      ...prev,
      [activeTab]: false
    }));
  };
  
  // Only fetch data for a tab if it hasn't been loaded yet
  useEffect(() => {
    const fetchData = async () => {
      if (!loading[activeTab]) return;
      
      try {
        // Fetch liked content
        const res = await fetch(`/api/user/liked?type=${activeTab}&page=1&limit=5`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch ${activeTab} content. Status: ${res.status}`);
        }
        
        const data = await res.json();
        setContent(prev => ({
          ...prev,
          [activeTab]: data
        }));
        
        // For blogs and reviews, fetch tags and authors from the liked content
        if ((activeTab === "blogs" || activeTab === "reviews") && loading[activeTab]) {
          try {
            // Use the new endpoints for liked tags and authors
            const tagsRes = await fetch(`/api/user/liked/tags?type=${activeTab}`);
            
            if (!tagsRes.ok) {
              throw new Error(`Failed to fetch ${activeTab} tags. Status: ${tagsRes.status}`);
            }
            
            const tagsData = await tagsRes.json();
            setTags(prev => ({
              ...prev,
              [activeTab]: tagsData.tags || []
            }));
            
            const authorsRes = await fetch(`/api/user/liked/authors?type=${activeTab}`);
            
            if (!authorsRes.ok) {
              throw new Error(`Failed to fetch ${activeTab} authors. Status: ${authorsRes.status}`);
            }
            
            const authorsData = await authorsRes.json();
            setAuthors(prev => ({
              ...prev,
              [activeTab]: authorsData.authors || []
            }));
          } catch (error) {
            console.error(`Error fetching ${activeTab} metadata:`, error);
            setErrors(prev => ({
              ...prev,
              [activeTab]: true
            }));
          }
        }
      } catch (error) {
        console.error(`Error fetching liked ${activeTab}:`, error);
        setErrors(prev => ({
          ...prev,
          [activeTab]: true
        }));
      } finally {
        setLoading(prev => ({
          ...prev,
          [activeTab]: false
        }));
      }
    };
    
    fetchData();
  }, [activeTab, loading]);

  return (
    <div className="blogs-container">
      <ProfileInfo session={session} />
      
      <div className="section-title">
        <span className="title-text">Your Liked Content</span>
        <div className="title-line"/>
      </div>
      
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      {loading[activeTab] ? (
        <div className="loading-wrapper">
          <div className="loading-spinner"/>
        </div>
      ) : errors[activeTab] ? (
        <ErrorMessage 
          title={`Error Loading ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
          reasons={[
            "Unable to connect to the server",
            "The server might be temporarily unavailable",
            "Your network connection might be unstable"
          ]}
          onReload={handleReload}
        />
      ) : (
        <div className="liked-content fade-in">
          {activeTab === "blogs" && (
            content.blogs.blogs && content.blogs.blogs.length > 0 ? (
                <BlogProvider initialBlogs={content.blogs.blogs}
                  initialTags={tags.blogs}
                  initialAuthors={authors.blogs}
                  initialTotalPages={content.blogs.total_pages || 1}
                >
                <BlogComponent
                  path="blogs"
                  initialBlogs={content.blogs.blogs}
                  totalPages={content.blogs.total_pages || 1}
                  apiUrl="/api/user/liked?type=blogs"
                  initialTags={tags.blogs}
                  initialAuthors={authors.blogs}
                />
                </BlogProvider>
              ) : (
                <div className="no-results">
                  <div className="no-results-content">
                    <h3>No liked blogs found</h3>
                    <p>Blogs you like will appear here</p>
                  </div>
                </div>
              )
          )}
          
          {activeTab === "reviews" && (
            content.reviews.blogs && content.reviews.blogs.length > 0 ? (
                <BlogProvider initialBlogs={content.reviews.blogs}
                  initialTags={tags.reviews}
                  initialAuthors={authors.reviews}
                  initialTotalPages={content.reviews.total_pages || 1}>
                <BlogComponent
                  path="reviews"
                  initialBlogs={content.reviews.blogs}
                  totalPages={content.reviews.total_pages || 1}
                  apiUrl="/api/user/liked?type=reviews"
                  initialTags={tags.reviews}
                  initialAuthors={authors.reviews}
                />
                </BlogProvider>
              ) : (
                <div className="no-results">
                  <div className="no-results-content">
                    <h3>No liked reviews found</h3>
                    <p>Reviews you like will appear here</p>
                  </div>
                </div>
              )
          )}
          
          {activeTab === "projects" && (
            content.projects.projects && content.projects.projects.length > 0 ? (
                <ProjectsGrid projects={content.projects.projects} />
              ) : (
                <div className="no-results">
                  <div className="no-results-content">
                    <h3>No liked projects found</h3>
                    <p>Projects you like will appear here</p>
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
}