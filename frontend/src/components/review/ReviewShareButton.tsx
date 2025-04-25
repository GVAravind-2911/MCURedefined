"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

interface ReviewShareButtonProps {
  reviewId: number;
  initialCount: number;
}

export default function ReviewShareButton({
  reviewId,
  initialCount,
}: ReviewShareButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [shared, setShared] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleShare = async () => {
    // Get the current URL to share
    const url = window.location.href;

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      
      // Optimistic update
      setShared(true);
      setCount((prev) => prev + 1);
      setIsPending(true);

      // Call API to increment share count
      await axios.post("/api/review/share", { reviewId });

      // Show "Shared!" temporarily
      setTimeout(() => {
        setShared(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to share review:", err);
      // No need to revert count - sharing can be done multiple times
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="review-share-container">
      <motion.button
        type="button"
        className="share"
        onClick={handleShare}
        disabled={isPending}
        whileTap={{ scale: 0.9 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <title>Share</title>
          <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z"/>
          <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z"/>
          <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z"/>
          <path d="M8.59 13.51L15.42 17.49"/>
          <path d="M15.41 6.51L8.59 10.49"/>
        </svg>
        <span>{shared ? "Copied!" : "Share"}</span>
      </motion.button>
      <motion.span 
        className="share-count"
        key={count}
        animate={{ y: [0, -20, 0], opacity: [1, 0.8, 1] }}
        transition={{ duration: 0.5 }}
      >
        {count}
      </motion.span>
    </div>
  );
}