"use client";

import type React from "react";
import { useState, useRef, useEffect, memo, useCallback } from "react";
import { Search, X, ChevronDown, Filter, ArrowUpDown } from "lucide-react";

interface ForumFiltersProps {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	sortBy: string;
	sortOptions: Array<{ value: string; label: string }>;
	onSortChange: (sort: string) => void;
	onSearch: (e: React.FormEvent) => void;
	onClearSearch: () => void;
	hasActiveFilters: boolean;
}

const ForumFilters: React.FC<ForumFiltersProps> = memo(
	({
		searchQuery,
		setSearchQuery,
		sortBy,
		sortOptions,
		onSortChange,
		onSearch,
		onClearSearch,
		hasActiveFilters,
	}) => {
		const [showSortDropdown, setShowSortDropdown] = useState(false);
		const [showMobileFilters, setShowMobileFilters] = useState(false);
		const sortDropdownRef = useRef<HTMLDivElement>(null);

		// Handle clicks outside sort dropdown to close it
		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (
					sortDropdownRef.current &&
					!sortDropdownRef.current.contains(event.target as Node)
				) {
					setShowSortDropdown(false);
				}
			};

			document.addEventListener("mousedown", handleClickOutside);
			return () => {
				document.removeEventListener("mousedown", handleClickOutside);
			};
		}, []);

		const handleFormSubmit = (e: React.FormEvent) => {
			e.preventDefault();
			onSearch(e);
		};

		const SortDropdown = ({ fullWidth = false }: { fullWidth?: boolean }) => (
			<div
				className={`relative z-60 ${fullWidth ? "w-full" : ""}`}
				ref={fullWidth ? undefined : sortDropdownRef}
			>
				<button
					type="button"
					className={`flex items-center justify-between gap-2 h-12 px-4 bg-linear-to-r from-white/5 to-white/2 border border-white/15 rounded-xl text-white text-sm cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/25 hover:shadow-lg hover:shadow-black/20 ${fullWidth ? "w-full" : "min-w-40"}`}
					onClick={() => setShowSortDropdown(!showSortDropdown)}
				>
					<div className="flex items-center gap-2">
						<ArrowUpDown className="w-4 h-4 text-white/50" />
						<span className="truncate">
							{sortOptions.find((opt) => opt.value === sortBy)?.label ||
								"Latest"}
						</span>
					</div>
					<ChevronDown
						className={`w-4 h-4 text-white/50 transition-transform duration-300 shrink-0 ${showSortDropdown ? "rotate-180 text-[#ec1d24]" : ""}`}
					/>
				</button>
				{showSortDropdown && (
					<div className="absolute top-full left-0 right-0 mt-2 min-w-[180px] overflow-hidden bg-linear-to-b from-[#1f1f1f] to-[#151515] border border-white/20 rounded-xl shadow-[0_15px_50px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] z-100">
						{/* Header */}
						<div className="py-3 px-4 bg-linear-to-r from-[#252525] to-[#1f1f1f] border-b border-white/10">
							<span className="text-sm text-white font-[BentonSansBold]">
								Sort By
							</span>
						</div>

						{/* Options List */}
						<div className="max-h-[260px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
							{sortOptions.map((option) => (
								<button
									key={option.value}
									type="button"
									className={`flex items-center gap-3 w-full py-3 px-4 text-sm text-left transition-all duration-200 border-b border-white/5 last:border-b-0 ${
										sortBy === option.value
											? "bg-linear-to-r from-[#ec1d24]/20 to-[#ec1d24]/10 text-white"
											: "text-white/70 hover:bg-white/8 hover:text-white"
									}`}
									onClick={() => {
										onSortChange(option.value);
										setShowSortDropdown(false);
									}}
								>
									<div
										className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${sortBy === option.value ? "bg-[#ec1d24] shadow-[0_0_8px_rgba(236,29,36,0.5)]" : "bg-white/30"}`}
									/>
									<span className="font-[BentonSansRegular]">
										{option.label}
									</span>
								</button>
							))}
						</div>
					</div>
				)}
			</div>
		);

		return (
			<div className="relative z-40 mb-6 sm:mb-8 animate-[fadeIn_0.5s_ease]">
				{/* Section Header */}
				<h2 className="flex items-center mb-6 sm:mb-8 font-[BentonSansBold] text-white">
					<span className="text-xl sm:text-2xl md:text-[28px] mr-3 sm:mr-4 whitespace-nowrap">
						Browse Topics
					</span>
					<div className="grow h-0.5 sm:h-[3px] bg-linear-to-r from-[#ec1d24] to-transparent" />
				</h2>

				{/* Main Toolbar */}
				<div className="relative bg-linear-to-br from-white/4 via-white/2 to-transparent backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
					<div className="flex flex-col lg:flex-row gap-4">
						{/* Search Section */}
						<form onSubmit={handleFormSubmit} className="flex-1 flex gap-2">
							{/* Search Input */}
							<div className="flex-1 relative">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Search topics..."
									className="search-input w-full h-12 pl-12 pr-10 bg-linear-to-r from-white/5 to-white/2 border border-white/15 rounded-xl text-white text-sm placeholder:text-white/35 transition-all duration-300 focus:outline-none focus:border-[#ec1d24]/60 focus:ring-2 focus:ring-[#ec1d24]/25 focus:bg-white/8 focus:shadow-[0_0_20px_rgba(236,29,36,0.1)] font-[BentonSansRegular]"
									aria-label="Search topics"
								/>
								{searchQuery && (
									<button
										type="button"
										className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
										onClick={onClearSearch}
										aria-label="Clear search"
									>
										<X className="w-4 h-4" />
									</button>
								)}
							</div>

							{/* Search Button */}
							<button
								type="submit"
								className="h-12 px-6 bg-linear-to-br from-[#ec1d24] to-[#c91820] text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#ec1d24]/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
							>
								<Search className="w-4 h-4" />
								<span className="hidden sm:inline">Search</span>
							</button>
						</form>

						{/* Desktop Filters */}
						<div className="hidden lg:flex items-center gap-3">
							<div ref={sortDropdownRef}>
								<SortDropdown />
							</div>

							{hasActiveFilters && (
								<button
									type="button"
									className="h-12 px-4 bg-white/5 border border-white/15 rounded-xl text-white/70 text-sm transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 flex items-center gap-2"
									onClick={onClearSearch}
								>
									<X className="w-4 h-4" />
									Clear
								</button>
							)}
						</div>

						{/* Mobile Filter Toggle */}
						<div className="flex lg:hidden items-center gap-2">
							<button
								type="button"
								className={`flex-1 h-12 px-4 bg-linear-to-r from-white/5 to-white/2 border border-white/15 rounded-xl text-white text-sm transition-all duration-300 flex items-center justify-center gap-2 ${hasActiveFilters ? "border-[#ec1d24]/60 bg-linear-to-r from-[#ec1d24]/15 to-[#ec1d24]/5 shadow-[0_0_20px_rgba(236,29,36,0.15)]" : "hover:bg-white/10 hover:border-white/25"}`}
								onClick={() => setShowMobileFilters(!showMobileFilters)}
							>
								<Filter
									className={`w-4 h-4 ${hasActiveFilters ? "text-[#ec1d24]" : ""}`}
								/>
								Sort & Filter
								{hasActiveFilters && (
									<span className="w-2 h-2 rounded-full bg-[#ec1d24] shadow-[0_0_8px_rgba(236,29,36,0.5)]" />
								)}
							</button>
						</div>
					</div>

					{/* Mobile Filters Panel */}
					{showMobileFilters && (
						<div className="lg:hidden mt-4 pt-4 border-t border-white/10 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
							<div className="flex flex-col gap-3">
								<div className="flex items-center gap-2 text-white/70 text-sm">
									<ArrowUpDown className="w-4 h-4" />
									<span>Sort By</span>
								</div>
								<SortDropdown fullWidth />
							</div>

							{hasActiveFilters && (
								<button
									type="button"
									className="h-10 bg-white/5 border border-white/15 rounded-xl text-white/70 text-sm transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 flex items-center justify-center gap-2"
									onClick={onClearSearch}
								>
									<X className="w-4 h-4" />
									Clear Search
								</button>
							)}
						</div>
					)}
				</div>

				{/* Active Filters Display */}
				{searchQuery && (
					<div className="flex flex-wrap items-center mt-4 py-3 px-4 bg-linear-to-r from-white/4 to-transparent backdrop-blur-sm border border-white/15 rounded-xl gap-2">
						<span className="font-[BentonSansBold] mr-2 text-white/80 text-xs sm:text-sm">
							Searching:
						</span>
						<div className="flex flex-wrap gap-2">
							<span className="flex items-center bg-linear-to-r from-[#ec1d24]/20 to-[#ec1d24]/10 border border-[#ec1d24]/40 text-white text-sm py-1.5 px-3 rounded-full font-[BentonSansRegular] gap-1.5 shadow-[0_0_12px_rgba(236,29,36,0.15)]">
								<span className="text-[#ec1d24] text-xs uppercase font-[BentonSansBold]">
									Query:
								</span>
								<span className="font-medium">{searchQuery}</span>
								<button
									onClick={onClearSearch}
									className="flex items-center justify-center text-white/60 ml-1 cursor-pointer p-1 rounded-full hover:text-white hover:bg-white/15 active:scale-90 transition-all duration-200"
									aria-label="Remove search filter"
									type="button"
								>
									<X className="w-3.5 h-3.5" />
								</button>
							</span>
						</div>
					</div>
				)}
			</div>
		);
	},
);

ForumFilters.displayName = "ForumFilters";

export default ForumFilters;
