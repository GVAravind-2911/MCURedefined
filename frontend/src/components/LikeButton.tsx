"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; // Add framer-motion for animations

interface LikeButtonProps {
    blogId: number;
    initialCount: number;
    userHasLiked: boolean;
    isLoggedIn: boolean;
}

export default function LikeButton({
    blogId,
    initialCount,
    userHasLiked,
    isLoggedIn,
}: LikeButtonProps) {
    const [liked, setLiked] = useState(userHasLiked);
    const [count, setCount] = useState(initialCount);
    const [isPending, setIsPending] = useState(false);

    const handleLike = async () => {
        // Optimistic update
        setLiked(true);
        setCount((prev) => prev + 1);
        setIsPending(true);

        try {
            await axios.post("/api/blog/like", { blogId });
            // Success - already updated UI optimistically
        } catch (err) {
            // Revert on error
            console.error("Failed to like blog:", err);
            setLiked(false);
            setCount((prev) => prev - 1);
        } finally {
            setIsPending(false);
        }
    };

    const handleUnlike = async () => {
        // Optimistic update
        setLiked(false);
        setCount((prev) => prev - 1);
        setIsPending(true);

        try {
            await axios.post("/api/blog/unlike", { blogId });
            // Success - already updated UI optimistically
        } catch (err) {
            // Revert on error
            console.error("Failed to unlike blog:", err);
            setLiked(true);
            setCount((prev) => prev + 1);
        } finally {
            setIsPending(false);
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="likes">
                <div className="like-button disabled" title="Log in to like blogs">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                        <title>Like</title>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </div>
                <span className="likes-count">{count}</span>
            </div>
        );
    }

    return (
        <div className="likes">
            <motion.button
                type="button"
                className={liked ? "liked-button" : "like-button"}
                onClick={liked ? handleUnlike : handleLike}
                disabled={isPending}
                whileTap={{ scale: 0.9 }}
                animate={{ scale: [1, liked ? 1.2 : 1, 1] }}
                transition={{ duration: 0.3 }}
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill={liked ? "currentColor" : "none"}
                    stroke="currentColor" 
                    strokeWidth={liked ? "0" : "2"} 
                    width="24" 
                    height="24"
                    className="heart-icon"
                >
                    <title>{liked ? "Unlike" : "Like"}</title>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>{liked ? "Liked" : "Like"}</span>
            </motion.button>
            <motion.span 
                className="likes-count"
                key={count}
                animate={{ y: [0, -20, 0], opacity: [1, 0.8, 1] }}
                transition={{ duration: 0.5 }}
            >
                {count}
            </motion.span>
        </div>
    );
}