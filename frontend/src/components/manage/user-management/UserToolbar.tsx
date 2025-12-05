"use client";

import { useRef, useEffect, useState } from "react";
import { USER_ROLES } from "@/types/UserManagementTypes";

interface UserToolbarProps {
	searchValue: string;
	setSearchValue: (value: string) => void;
	searchField: "email" | "name";
	setSearchField: (field: "email" | "name") => void;
	filterRole: string;
	setFilterRole: (role: string) => void;
	filterBanned: string;
	setFilterBanned: (banned: string) => void;
	onSearch: (e: React.FormEvent) => void;
	onCreateUser: () => void;
	setCurrentPage: (page: number) => void;
}

export default function UserToolbar({
	searchValue,
	setSearchValue,
	searchField,
	setSearchField,
	filterRole,
	setFilterRole,
	filterBanned,
	setFilterBanned,
	onSearch,
	onCreateUser,
	setCurrentPage,
}: UserToolbarProps) {
	const [searchFieldOpen, setSearchFieldOpen] = useState(false);
	const [roleFilterOpen, setRoleFilterOpen] = useState(false);
	const [statusFilterOpen, setStatusFilterOpen] = useState(false);
	
	const searchFieldRef = useRef<HTMLDivElement>(null);
	const roleFilterRef = useRef<HTMLDivElement>(null);
	const statusFilterRef = useRef<HTMLDivElement>(null);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (searchFieldRef.current && !searchFieldRef.current.contains(event.target as Node)) {
				setSearchFieldOpen(false);
			}
			if (roleFilterRef.current && !roleFilterRef.current.contains(event.target as Node)) {
				setRoleFilterOpen(false);
			}
			if (statusFilterRef.current && !statusFilterRef.current.contains(event.target as Node)) {
				setStatusFilterOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const getSearchFieldLabel = () => {
		return searchField === "email" ? "Email" : "Name";
	};

	const getStatusLabel = () => {
		if (filterBanned === "true") return "Banned";
		if (filterBanned === "false") return "Active";
		return "All Status";
	};

	const getRoleLabel = () => {
		if (!filterRole) return "All Roles";
		return USER_ROLES[filterRole as keyof typeof USER_ROLES]?.label || filterRole;
	};

	return (
		<div className="flex flex-wrap gap-4 mb-6 p-6 bg-[rgba(18,18,18,0.95)] rounded-[14px] border border-white/10 backdrop-blur-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
			<form onSubmit={onSearch} className="flex items-center gap-3 flex-1 min-w-[300px]">
				{/* Custom Search Field Dropdown */}
				<div className="relative min-w-[120px]" ref={searchFieldRef}>
					<button
						type="button"
						className="flex items-center justify-between gap-3 py-3.5 px-4 bg-black/40 border border-white/10 rounded-[10px] text-white text-[0.9rem] cursor-pointer transition-all duration-[0.25s] min-w-[130px] whitespace-nowrap hover:border-white/20 hover:bg-white/5"
						onClick={() => setSearchFieldOpen(!searchFieldOpen)}
					>
						<span>{getSearchFieldLabel()}</span>
						<svg
							className={`transition-transform duration-200 opacity-60 ${searchFieldOpen ? "rotate-180" : ""}`}
							width="12"
							height="12"
							viewBox="0 0 12 12"
						>
							<path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" fill="none" />
						</svg>
					</button>
					{searchFieldOpen && (
						<div className="absolute top-[calc(100%+6px)] left-0 min-w-full bg-[rgba(30,30,30,0.95)] border border-white/20 rounded-[10px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-100 overflow-hidden animate-[dropdownFadeIn_0.2s_ease]">
							<button
								type="button"
								className={`flex items-center gap-2 w-full py-3 px-4 bg-transparent border-none text-white/70 text-[0.9rem] text-left cursor-pointer transition-all duration-[0.25s] hover:bg-white/5 hover:text-white ${searchField === "email" ? "bg-[#ec1d24]/15 text-[#ec1d24]" : ""}`}
								onClick={() => {
									setSearchField("email");
									setSearchFieldOpen(false);
								}}
							>
								Email
							</button>
							<button
								type="button"
								className={`flex items-center gap-2 w-full py-3 px-4 bg-transparent border-none text-white/70 text-[0.9rem] text-left cursor-pointer transition-all duration-[0.25s] hover:bg-white/5 hover:text-white ${searchField === "name" ? "bg-[#ec1d24]/15 text-[#ec1d24]" : ""}`}
								onClick={() => {
									setSearchField("name");
									setSearchFieldOpen(false);
								}}
							>
								Name
							</button>
						</div>
					)}
				</div>

				<div className="relative flex-1 flex items-center">
					<svg className="absolute left-3.5 text-white/50 pointer-events-none z-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<input
						type="text"
						placeholder={`Search by ${searchField}...`}
						value={searchValue}
						onChange={(e) => setSearchValue(e.target.value)}
						className="w-full py-3.5 pr-10 pl-12 bg-black/40 border border-white/10 rounded-[10px] text-white text-[0.95rem] transition-all duration-[0.25s] placeholder:text-white/50 focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_3px_rgba(236,29,36,0.15)] focus:bg-black/60"
					/>
					{searchValue && (
						<button
							type="button"
							className="absolute right-3 p-1 bg-transparent border-none text-white/50 cursor-pointer rounded-full flex items-center justify-center transition-all duration-[0.25s] hover:text-white hover:bg-white/5"
							onClick={() => {
								setSearchValue("");
								setCurrentPage(1);
							}}
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					)}
				</div>
				<button type="submit" className="py-3.5 px-6 bg-linear-to-br from-[#ec1d24] to-[#c91820] text-white border-none rounded-[10px] font-semibold text-[0.95rem] cursor-pointer transition-all duration-[0.25s] whitespace-nowrap hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(236,29,36,0.4)]">
					Search
				</button>
			</form>

			<div className="flex items-center gap-3 flex-wrap">
				{/* Role Filter Dropdown */}
				<div className="relative min-w-[120px]" ref={roleFilterRef}>
					<button
						type="button"
						className="flex items-center justify-between gap-3 py-3.5 px-4 bg-black/40 border border-white/10 rounded-[10px] text-white text-[0.9rem] cursor-pointer transition-all duration-[0.25s] min-w-[130px] whitespace-nowrap hover:border-white/20 hover:bg-white/5"
						onClick={() => setRoleFilterOpen(!roleFilterOpen)}
					>
						<span>{getRoleLabel()}</span>
						<svg
							className={`transition-transform duration-200 opacity-60 ${roleFilterOpen ? "rotate-180" : ""}`}
							width="12"
							height="12"
							viewBox="0 0 12 12"
						>
							<path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" fill="none" />
						</svg>
					</button>
					{roleFilterOpen && (
						<div className="absolute top-[calc(100%+6px)] left-0 min-w-full bg-[rgba(30,30,30,0.95)] border border-white/20 rounded-[10px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-100 overflow-hidden animate-[dropdownFadeIn_0.2s_ease]">
							<button
								type="button"
								className={`flex items-center gap-2 w-full py-3 px-4 bg-transparent border-none text-white/70 text-[0.9rem] text-left cursor-pointer transition-all duration-[0.25s] hover:bg-white/5 hover:text-white ${!filterRole ? "bg-[#ec1d24]/15 text-[#ec1d24]" : ""}`}
								onClick={() => {
									setFilterRole("");
									setCurrentPage(1);
									setRoleFilterOpen(false);
								}}
							>
								All Roles
							</button>
							{Object.entries(USER_ROLES).map(([key, value]) => (
								<button
									type="button"
									key={key}
									className={`flex items-center gap-2 w-full py-3 px-4 bg-transparent border-none text-white/70 text-[0.9rem] text-left cursor-pointer transition-all duration-[0.25s] hover:bg-white/5 hover:text-white ${filterRole === key ? "bg-[#ec1d24]/15 text-[#ec1d24]" : ""}`}
									onClick={() => {
										setFilterRole(key);
										setCurrentPage(1);
										setRoleFilterOpen(false);
									}}
								>
									<span className={`w-2 h-2 rounded-full shrink-0 ${value.color}`} />
									{value.label}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Status Filter Dropdown */}
				<div className="relative min-w-[120px]" ref={statusFilterRef}>
					<button
						type="button"
						className="flex items-center justify-between gap-3 py-3.5 px-4 bg-black/40 border border-white/10 rounded-[10px] text-white text-[0.9rem] cursor-pointer transition-all duration-[0.25s] min-w-[130px] whitespace-nowrap hover:border-white/20 hover:bg-white/5"
						onClick={() => setStatusFilterOpen(!statusFilterOpen)}
					>
						<span>{getStatusLabel()}</span>
						<svg
							className={`transition-transform duration-200 opacity-60 ${statusFilterOpen ? "rotate-180" : ""}`}
							width="12"
							height="12"
							viewBox="0 0 12 12"
						>
							<path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" fill="none" />
						</svg>
					</button>
					{statusFilterOpen && (
						<div className="absolute top-[calc(100%+6px)] left-0 min-w-full bg-[rgba(30,30,30,0.95)] border border-white/20 rounded-[10px] shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-100 overflow-hidden animate-[dropdownFadeIn_0.2s_ease]">
							<button
								type="button"
								className={`flex items-center gap-2 w-full py-3 px-4 bg-transparent border-none text-white/70 text-[0.9rem] text-left cursor-pointer transition-all duration-[0.25s] hover:bg-white/5 hover:text-white ${!filterBanned ? "bg-[#ec1d24]/15 text-[#ec1d24]" : ""}`}
								onClick={() => {
									setFilterBanned("");
									setCurrentPage(1);
									setStatusFilterOpen(false);
								}}
							>
								All Status
							</button>
							<button
								type="button"
								className={`flex items-center gap-2 w-full py-3 px-4 bg-transparent border-none text-white/70 text-[0.9rem] text-left cursor-pointer transition-all duration-[0.25s] hover:bg-white/5 hover:text-white ${filterBanned === "false" ? "bg-[#ec1d24]/15 text-[#ec1d24]" : ""}`}
								onClick={() => {
									setFilterBanned("false");
									setCurrentPage(1);
									setStatusFilterOpen(false);
								}}
							>
								<span className="w-2 h-2 rounded-full shrink-0 bg-green-500" />
								Active
							</button>
							<button
								type="button"
								className={`flex items-center gap-2 w-full py-3 px-4 bg-transparent border-none text-white/70 text-[0.9rem] text-left cursor-pointer transition-all duration-[0.25s] hover:bg-white/5 hover:text-white ${filterBanned === "true" ? "bg-[#ec1d24]/15 text-[#ec1d24]" : ""}`}
								onClick={() => {
									setFilterBanned("true");
									setCurrentPage(1);
									setStatusFilterOpen(false);
								}}
							>
								<span className="w-2 h-2 rounded-full shrink-0 bg-red-500" />
								Banned
							</button>
						</div>
					)}
				</div>

				<button
					type="button"
					className="flex items-center gap-2 py-3.5 px-5 bg-linear-to-br from-[#ec1d24] to-[#c91820] text-white border-none rounded-[10px] font-semibold text-[0.9rem] cursor-pointer transition-all duration-[0.25s] whitespace-nowrap hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(236,29,36,0.4)]"
					onClick={onCreateUser}
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
						<circle cx="9" cy="7" r="4" />
						<line x1="19" y1="8" x2="19" y2="14" />
						<line x1="22" y1="11" x2="16" y2="11" />
					</svg>
					<span>Create User</span>
				</button>
			</div>
		</div>
	);
}
