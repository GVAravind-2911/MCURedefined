"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "@/lib/utils/formatNumber";
import type { ContentType } from "@/types/ContentTypes";

interface ContentLikeButtonProps {
  contentId: number;
  contentType: ContentType;
  initialCount: number;
  userHasLiked: boolean;
  isLoggedIn: boolean;
  iconSize?: number;
}

export default function ContentLikeButton({
  contentId,
  contentType,
  initialCount,
  userHasLiked,
  isLoggedIn,
  iconSize = 24,
}: ContentLikeButtonProps) {
  const [liked, setLiked] = useState(userHasLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, setIsPending] = useState(false);
  const [animateCount, setAnimateCount] = useState(false);

  const apiPath = contentType === "blogs" ? "/api/blog" : "/api/review";
  const idKey = contentType === "blogs" ? "blogId" : "reviewId";

  const handleLike = async () => {
    if (isPending) return;

    // Optimistic update
    setLiked(true);
    setCount((prev) => prev + 1);
    setAnimateCount(true);
    setIsPending(true);

    try {
      await axios.post(`${apiPath}/like`, { [idKey]: contentId });
      // Success - already updated UI optimistically
    } catch (err) {
      // Revert on error
      console.error(`Failed to like ${contentType}:`, err);
      setLiked(false);
      setCount((prev) => prev - 1);
    } finally {
      setIsPending(false);
    }
  };

  const handleUnlike = async () => {
    if (isPending) return;

    // Optimistic update
    setLiked(false);
    setCount((prev) => prev - 1);
    setAnimateCount(true);
    setIsPending(true);

    try {
      await axios.post(`${apiPath}/unlike`, { [idKey]: contentId });
      // Success - already updated UI optimistically
    } catch (err) {
      // Revert on error
      console.error(`Failed to unlike ${contentType}:`, err);
      setLiked(true);
      setCount((prev) => prev + 1);
    } finally {
      setIsPending(false);
    }
  };

  useEffect(() => {
    if (animateCount) {
      const timer = setTimeout(() => setAnimateCount(false), 500);
      return () => clearTimeout(timer);
    }
  }, [animateCount]);

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-center mx-[5px]">
        <motion.div
          className="flex items-center justify-center gap-2.5 py-2.5 px-5 rounded-[30px] border-none cursor-not-allowed font-[BentonSansRegular] text-base min-w-[130px] h-[42px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] relative overflow-hidden bg-[#777] text-[#ddd] opacity-80"
          title={`${count} likes`}
          initial={{ opacity: 0.9 }}
          animate={{ opacity: 1 }}
          whileHover={{
            scale: 1.03,
            boxShadow: "0 6px 12px rgba(236, 29, 36, 0.2)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width={iconSize}
            height={iconSize}
            className="transition-all duration-400 fill-current opacity-60"
          >
            <title>Like</title>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="flex items-center gap-1.5 relative h-[22px] tracking-[0.02em]">{formatNumber(count)}</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mx-[5px]">
      <motion.button
        type="button"
        className={liked 
          ? "flex items-center justify-center gap-2.5 py-2.5 px-5 rounded-[30px] border-2 border-[#ec1d24] cursor-pointer font-[BentonSansRegular] text-base min-w-[130px] h-[42px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] relative overflow-hidden bg-white/95 text-[#ec1d24] font-bold transition-all duration-300" 
          : "flex items-center justify-center gap-2.5 py-2.5 px-5 rounded-[30px] border-2 border-transparent cursor-pointer font-[BentonSansRegular] text-base min-w-[130px] h-[42px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] relative overflow-hidden bg-[#ec1d24] text-white font-medium transition-all duration-300"
        }
        onClick={liked ? handleUnlike : handleLike}
        disabled={isPending}
        whileTap={{ scale: 0.9 }}
        whileHover={{
          scale: 1.05,
          boxShadow: "0 6px 14px rgba(236, 29, 36, 0.4)",
          y: -2,
        }}
        title={`${count.toLocaleString()} likes`}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 17,
        }}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={liked ? "0" : "2"}
          width={iconSize}
          height={iconSize}
          className={liked ? "transition-all duration-400 fill-[#ec1d24] drop-shadow-[0_0_2px_rgba(236,29,36,0.3)]" : "transition-all duration-400 fill-current"}
          animate={
            liked
              ? {
                  scale: [1, 1.3, 1],
                  fill: ["#fff", "#ec1d24", "#ec1d24"],
                }
              : {}
          }
          transition={{
            duration: 0.4,
            ease: "easeInOut",
          }}
        >
          <title>{liked ? "Unlike" : "Like"}</title>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </motion.svg>

        <div className="flex items-center gap-1.5 relative h-[22px] tracking-[0.02em]">
          <AnimatePresence mode="wait">
            <motion.span
              key={liked ? "liked" : "like"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {liked ? "Liked" : "Like"}
            </motion.span>
          </AnimatePresence>

          <motion.span
            className={liked 
              ? "inline-flex items-center ml-1.5 text-[0.9em] font-normal opacity-95 bg-[#ec1d24]/10 py-0.5 px-2 rounded-[10px]" 
              : "inline-flex items-center ml-1.5 text-[0.9em] font-normal opacity-95 bg-white/15 py-0.5 px-2 rounded-[10px]"
            }
            animate={
              animateCount
                ? {
                    y: [0, -10, 0],
                    color: liked
                      ? ["#ec1d24", "#ff4d4d", "#ec1d24"]
                      : ["#fff", "#eee", "#fff"],
                    scale: [1, 1.2, 1],
                  }
                : {}
            }
            transition={{ duration: 0.5 }}
          >
            {formatNumber(count)}
          </motion.span>
        </div>

        {isPending && (
          <motion.span
            className="absolute"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 0.8,
              ease: "linear",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Loading</title>
              <path
                d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 9.27455 20.9097 6.80375 19.1414 5"
                strokeWidth="2.5"
                strokeLinecap="round"
                stroke="currentColor"
              />
            </svg>
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}
