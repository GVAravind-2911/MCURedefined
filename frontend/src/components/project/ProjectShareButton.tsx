"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { formatNumber } from "@/lib/utils/formatNumber";

interface ProjectShareButtonProps {
    projectId: number;
    initialCount: number;
}

export default function ProjectShareButton({
    projectId,
    initialCount,
}: ProjectShareButtonProps) {
    const [count, setCount] = useState(initialCount);
    const [shared, setShared] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [animateCount, setAnimateCount] = useState(false);

    const handleShare = async () => {
        if (isPending) return;
        
        // Get the current URL to share
        const url = window.location.href;

        // Copy to clipboard
        try {
            await navigator.clipboard.writeText(url);

            // Optimistic update
            setShared(true);
            setCount((prev) => prev + 1);
            setAnimateCount(true);
            setIsPending(true);

            // Call API to increment share count
            await axios.post("/api/project/share", { projectId });

            // Show "Copied!" temporarily
            setTimeout(() => {
                setShared(false);
            }, 2000);
        } catch (err) {
            console.error("Failed to share project:", err);
            // No need to revert count - sharing can be done multiple times
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

    return (
        <div className="flex flex-col items-center mx-1">
			<motion.button
				type="button"
				className={`flex items-center justify-center gap-2.5 py-2.5 px-5 max-md:py-2 max-md:px-4 max-[480px]:py-1.5 max-[480px]:px-3.5 rounded-[30px] border-2 border-transparent cursor-pointer font-[BentonSansRegular] font-medium text-base max-md:text-[15px] max-[480px]:text-sm w-[140px] max-md:w-[120px] max-[480px]:w-[110px] h-[42px] max-md:h-[38px] max-[480px]:h-9 shadow-[0_4px_12px_rgba(0,0,0,0.15)] relative overflow-hidden origin-center transition-all duration-300 bg-[#333] text-white hover:bg-[#444] ${shared ? "animate-[pulse-green_1.5s_cubic-bezier(0.175,0.885,0.32,1.275)]" : ""}`}
				onClick={handleShare}
				disabled={isPending}
				whileTap={{ 
					scale: 0.95
				}}
				whileHover={{ 
					y: -2,
					boxShadow: "0 6px 14px rgba(0, 0, 0, 0.3)",
				}}
				animate={shared ? { 
					backgroundColor: ["#333", "#2e7d32", "#333"],
				} : {}}
				transition={{ 
					type: "spring", 
					stiffness: 500, 
					damping: 17,
					backgroundColor: { duration: 1 }
				}}
				title={`${count.toLocaleString()} shares`}
				layout="position"
			>
                <motion.svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-[18px] h-[18px] max-md:w-4 max-md:h-4 min-w-[18px] min-h-[18px] max-md:min-w-4 max-md:min-h-4 shrink-0 block transition-all duration-300 stroke-[2px] stroke-round"
                    animate={shared ? { 
                        scale: [1, 1.3, 1],
                        rotate: [0, 45, 0],
                    } : {}}
                    transition={{ duration: 0.5 }}
                >
                    <title>Share</title>
                    <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 6.65685 16.3431 8 18 8Z" />
                    <path d="M6 15C7.65685 15 9 13.6569 9 12C9 10.3431 7.65685 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15Z" />
                    <path d="M18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C16.3431 16 15 17.3431 15 19C15 20.6569 16.3431 22 18 22Z" />
                    <path d="M8.59 13.51L15.42 17.49" />
                    <path d="M15.41 6.51L8.59 10.49" />
                </motion.svg>
                
                <div className="flex items-center gap-1.5 max-md:gap-1.5 max-[480px]:gap-1 relative h-[22px] tracking-[0.02em] whitespace-nowrap">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={shared ? "copied" : "share"}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-[15px] max-[480px]:text-[13px]"
                        >
                            {shared ? "Copied!" : "Share"}
                        </motion.span>
                    </AnimatePresence>
                    
                    <motion.span 
                        className="inline-flex items-center ml-1.5 max-md:ml-1 text-[0.9em] max-[480px]:text-[0.85em] font-normal opacity-95 bg-white/15 py-0.5 max-[480px]:py-px px-2 max-[480px]:px-1.5 rounded-[10px]"
                        animate={animateCount ? {
                            y: [0, -10, 0],
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