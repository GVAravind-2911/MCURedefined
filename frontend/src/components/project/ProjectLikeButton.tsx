"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "@/lib/utils/formatNumber";

interface ProjectLikeButtonProps {
    projectId: number;
    initialCount: number;
    userHasLiked: boolean;
    isLoggedIn: boolean;
}

export default function ProjectLikeButton({
    projectId,
    initialCount,
    userHasLiked,
    isLoggedIn,
}: ProjectLikeButtonProps) {
    const [liked, setLiked] = useState(userHasLiked);
    const [count, setCount] = useState(initialCount);
    const [isPending, setIsPending] = useState(false);
    const [animateCount, setAnimateCount] = useState(false);

    const handleLike = async () => {
        if (isPending) return;
        
        // Optimistic update
        setLiked(true);
        setCount((prev) => prev + 1);
        setAnimateCount(true);
        setIsPending(true);

        try {
            await axios.post("/api/project/like", { projectId });
            // Success - already updated UI optimistically
        } catch (err) {
            // Revert on error
            console.error("Failed to like project:", err);
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
            await axios.post("/api/project/unlike", { projectId });
            // Success - already updated UI optimistically
        } catch (err) {
            // Revert on error
            console.error("Failed to unlike project:", err);
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
            <div className="flex flex-col items-center mx-1">
                <motion.div 
                    className="flex items-center justify-center gap-2.5 py-2.5 px-5 rounded-[30px] border-none cursor-not-allowed font-[BentonSansRegular] text-base w-[140px] max-md:w-[120px] max-[480px]:w-[110px] h-[42px] max-md:h-[38px] max-[480px]:h-9 shadow-[0_4px_12px_rgba(0,0,0,0.15)] relative overflow-hidden origin-center bg-[#777] text-[#ddd] opacity-80 pointer-events-auto" 
                    title={`${count} likes`}
                    initial={{ opacity: 0.9 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ 
                        scale: 1.03,
                        boxShadow: "0 6px 12px rgba(236, 29, 36, 0.2)" 
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-[18px] h-[18px] max-md:w-4 max-md:h-4 min-w-[18px] min-h-[18px] max-md:min-w-4 max-md:min-h-4 shrink-0 block transition-all duration-300 opacity-60"
                    >
                        <title>Like</title>
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="flex items-center gap-1.5 relative h-[22px] tracking-[0.02em] whitespace-nowrap text-[15px] max-[480px]:text-[13px] max-[480px]:gap-1">{formatNumber(count)}</span>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center mx-1">
			<motion.button
				type="button"
				className={`flex items-center justify-center gap-2.5 py-2.5 px-5 max-md:py-2 max-md:px-4 max-[480px]:py-1.5 max-[480px]:px-3.5 rounded-[30px] border-2 cursor-pointer font-[BentonSansRegular] text-base max-md:text-[15px] max-[480px]:text-sm w-[140px] max-md:w-[120px] max-[480px]:w-[110px] h-[42px] max-md:h-[38px] max-[480px]:h-9 shadow-[0_4px_12px_rgba(0,0,0,0.15)] relative overflow-hidden origin-center transition-all duration-300 ${
					liked 
						? "bg-white/95 text-[#ec1d24] border-[#ec1d24] font-bold hover:bg-white hover:border-[#ff3d44] hover:text-[#ff3d44]" 
						: "bg-[#ec1d24] text-white border-transparent font-medium hover:bg-[#d11920]"
				}`}
				onClick={liked ? handleUnlike : handleLike}
				disabled={isPending}
				whileTap={{ 
					scale: 0.95
				}}
				whileHover={{ 
					y: -2,
					boxShadow: "0 6px 14px rgba(236, 29, 36, 0.4)",
				}}
				title={`${count.toLocaleString()} likes`}
				transition={{ 
					type: "spring", 
					stiffness: 500, 
					damping: 17 
				}}
				layout="position"
			>
                <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={liked ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth={liked ? "0" : "2"}
                    className={`w-[18px] h-[18px] max-md:w-4 max-md:h-4 min-w-[18px] min-h-[18px] max-md:min-w-4 max-md:min-h-4 shrink-0 block transition-all duration-400 stroke-[2px] stroke-round ${liked ? "fill-[#ec1d24] stroke-[#ec1d24] drop-shadow-[0_0_2px_rgba(236,29,36,0.3)]" : "fill-none stroke-current"}`}
                    animate={liked ? { 
                        scale: [1, 1.3, 1],
                        fill: ["#fff", "#ec1d24", "#ec1d24"], 
                    } : {}}
                    transition={{ 
                        duration: 0.4,
                        ease: "easeInOut" 
                    }}
                >
                    <title>{liked ? "Unlike" : "Like"}</title>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </motion.svg>
                
                <div className="flex items-center gap-1.5 max-md:gap-1.5 max-[480px]:gap-1 relative h-[22px] tracking-[0.02em] whitespace-nowrap">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={liked ? "liked" : "like"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-[15px] max-[480px]:text-[13px]"
                        >
                            {liked ? "Liked" : "Like"}
                        </motion.span>
                    </AnimatePresence>
                    
                    <motion.span 
                        className={`inline-flex items-center ml-1.5 max-md:ml-1 text-[0.9em] max-[480px]:text-[0.85em] font-normal opacity-95 py-0.5 max-[480px]:py-px px-2 max-[480px]:px-1.5 rounded-[10px] ${liked ? "bg-[#ec1d24]/10" : "bg-white/15"}`}
                        animate={animateCount ? {
                            y: [0, -10, 0],
                            color: liked ? ["#ec1d24", "#ff4d4d", "#ec1d24"] : ["#fff", "#eee", "#fff"],
                            scale: [1, 1.2, 1],
                        } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        {formatNumber(count)}
                    </motion.span>
                </div>
                
                {isPending && (
                    <motion.span 
                        className="ml-1.5 inline-flex items-center"
                        animate={{ rotate: 360 }}
                        transition={{ 
                            repeat: Number.POSITIVE_INFINITY, 
                            duration: 0.8,
                            ease: "linear" 
                        }}
                    >
                        <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            className="opacity-80"
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