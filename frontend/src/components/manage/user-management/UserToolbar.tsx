"use client";

import { useRef, useEffect, useState } from "react";
import { USER_ROLES } from "@/types/UserManagementTypes";
import {
	Search,
	ChevronDown,
	UserPlus,
	X,
	Filter,
	Mail,
	User,
} from "lucide-react";

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
	const [showMobileFilters, setShowMobileFilters] = useState(false);

	const searchFieldRef = useRef<HTMLDivElement>(null);
	const roleFilterRef = useRef<HTMLDivElement>(null);
	const statusFilterRef = useRef<HTMLDivElement>(null);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchFieldRef.current &&
				!searchFieldRef.current.contains(event.target as Node)
			) {
				setSearchFieldOpen(false);
			}
			if (
				roleFilterRef.current &&
				!roleFilterRef.current.contains(event.target as Node)
			) {
				setRoleFilterOpen(false);
			}
			if (
				statusFilterRef.current &&
				!statusFilterRef.current.contains(event.target as Node)
			) {
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
		return (
			USER_ROLES[filterRole as keyof typeof USER_ROLES]?.label || filterRole
		);
	};

	const hasActiveFilters = filterRole || filterBanned;

	const SearchFieldDropdown = () => (
		<div className="relative" ref={searchFieldRef}>
			<button
				type="button"
				className="flex items-center gap-2 h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm cursor-pointer transition-all duration-300 min-w-[100px] hover:bg-white/10 hover:border-white/20"
				onClick={() => setSearchFieldOpen(!searchFieldOpen)}
			>
				{searchField === "email" ? (
					<Mail className="w-4 h-4 text-white/50" />
				) : (
					<User className="w-4 h-4 text-white/50" />
				)}
				<span className="hidden sm:inline">{getSearchFieldLabel()}</span>
				<ChevronDown
					className={`w-4 h-4 text-white/50 transition-transform duration-300 ${searchFieldOpen ? "rotate-180" : ""}`}
				/>
			</button>
			{searchFieldOpen && (
				<div className="absolute top-full left-0 mt-2 min-w-full bg-[rgba(24,24,24,0.98)] backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
					<button
						type="button"
						className={`flex items-center gap-3 w-full py-3 px-4 text-sm text-left transition-all duration-200 ${searchField === "email" ? "bg-[#ec1d24]/15 text-[#ec1d24]" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
						onClick={() => {
							setSearchField("email");
							setSearchFieldOpen(false);
						}}
					>
						<Mail className="w-4 h-4" />
						Email
					</button>
					<button
						type="button"
						className={`flex items-center gap-3 w-full py-3 px-4 text-sm text-left transition-all duration-200 ${searchField === "name" ? "bg-[#ec1d24]/15 text-[#ec1d24]" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
						onClick={() => {
							setSearchField("name");
							setSearchFieldOpen(false);
						}}
					>
						<User className="w-4 h-4" />
						Name
					</button>
				</div>
			)}
		</div>
	);

	const RoleFilterDropdown = ({
		fullWidth = false,
	}: { fullWidth?: boolean }) => (
		<div
			className={`relative ${fullWidth ? "w-full" : ""}`}
			ref={fullWidth ? undefined : roleFilterRef}
		>
			<button
				type="button"
				className={`flex items-center justify-between gap-2 h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/20 ${fullWidth ? "w-full" : "min-w-[130px]"} ${filterRole ? "border-[#ec1d24]/50 bg-[#ec1d24]/10" : ""}`}
				onClick={() => setRoleFilterOpen(!roleFilterOpen)}
			>
				<span className="truncate">{getRoleLabel()}</span>
				<ChevronDown
					className={`w-4 h-4 text-white/50 transition-transform duration-300 shrink-0 ${roleFilterOpen ? "rotate-180" : ""}`}
				/>
			</button>
			{roleFilterOpen && (
				<div className="absolute top-full left-0 right-0 mt-2 min-w-full bg-[rgba(24,24,24,0.98)] backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
					<button
						type="button"
						className={`flex items-center gap-3 w-full py-3 px-4 text-sm text-left transition-all duration-200 ${!filterRole ? "bg-[#ec1d24]/15 text-[#ec1d24]" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
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
							className={`flex items-center gap-3 w-full py-3 px-4 text-sm text-left transition-all duration-200 ${filterRole === key ? "bg-[#ec1d24]/15 text-[#ec1d24]" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
							onClick={() => {
								setFilterRole(key);
								setCurrentPage(1);
								setRoleFilterOpen(false);
							}}
						>
							<span
								className={`w-2 h-2 rounded-full shrink-0 ${value.color}`}
							/>
							{value.label}
						</button>
					))}
				</div>
			)}
		</div>
	);

	const StatusFilterDropdown = ({
		fullWidth = false,
	}: { fullWidth?: boolean }) => (
		<div
			className={`relative ${fullWidth ? "w-full" : ""}`}
			ref={fullWidth ? undefined : statusFilterRef}
		>
			<button
				type="button"
				className={`flex items-center justify-between gap-2 h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm cursor-pointer transition-all duration-300 hover:bg-white/10 hover:border-white/20 ${fullWidth ? "w-full" : "min-w-[130px]"} ${filterBanned ? "border-[#ec1d24]/50 bg-[#ec1d24]/10" : ""}`}
				onClick={() => setStatusFilterOpen(!statusFilterOpen)}
			>
				<span className="truncate">{getStatusLabel()}</span>
				<ChevronDown
					className={`w-4 h-4 text-white/50 transition-transform duration-300 shrink-0 ${statusFilterOpen ? "rotate-180" : ""}`}
				/>
			</button>
			{statusFilterOpen && (
				<div className="absolute top-full left-0 right-0 mt-2 min-w-full bg-[rgba(24,24,24,0.98)] backdrop-blur-xl border border-white/15 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
					<button
						type="button"
						className={`flex items-center gap-3 w-full py-3 px-4 text-sm text-left transition-all duration-200 ${!filterBanned ? "bg-[#ec1d24]/15 text-[#ec1d24]" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
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
						className={`flex items-center gap-3 w-full py-3 px-4 text-sm text-left transition-all duration-200 ${filterBanned === "false" ? "bg-[#ec1d24]/15 text-[#ec1d24]" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
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
						className={`flex items-center gap-3 w-full py-3 px-4 text-sm text-left transition-all duration-200 ${filterBanned === "true" ? "bg-[#ec1d24]/15 text-[#ec1d24]" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
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
	);

	return (
		<div className="space-y-4 mb-6 sm:mb-8">
			{/* Main Toolbar */}
			<div className="bg-white/2 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5">
				<div className="flex flex-col lg:flex-row gap-4">
					{/* Search Section */}
					<form onSubmit={onSearch} className="flex-1 flex gap-2">
						<SearchFieldDropdown />

						{/* Search Input */}
						<div className="flex-1 relative">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 pointer-events-none" />
							<input
								type="text"
								placeholder={`Search by ${searchField}...`}
								value={searchValue}
								onChange={(e) => setSearchValue(e.target.value)}
								className="w-full h-12 pl-12 pr-10 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/40 transition-all duration-300 focus:outline-none focus:border-[#ec1d24]/50 focus:ring-2 focus:ring-[#ec1d24]/20 focus:bg-white/8"
							/>
							{searchValue && (
								<button
									type="button"
									className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
									onClick={() => {
										setSearchValue("");
										setCurrentPage(1);
									}}
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

					{/* Desktop Filters & Actions */}
					<div
						className="hidden lg:flex items-center gap-3"
						ref={roleFilterRef}
					>
						<RoleFilterDropdown />
						<div ref={statusFilterRef}>
							<StatusFilterDropdown />
						</div>

						{/* Create User Button */}
						<button
							type="button"
							className="h-12 px-5 bg-linear-to-br from-[#ec1d24] to-[#c91820] text-white font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#ec1d24]/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 whitespace-nowrap"
							onClick={onCreateUser}
						>
							<UserPlus className="w-4 h-4" />
							Create User
						</button>
					</div>

					{/* Mobile Filter Toggle & Create Button */}
					<div className="flex lg:hidden items-center gap-2">
						<button
							type="button"
							className={`flex-1 h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm transition-all duration-300 flex items-center justify-center gap-2 ${hasActiveFilters ? "border-[#ec1d24]/50 bg-[#ec1d24]/10" : "hover:bg-white/10"}`}
							onClick={() => setShowMobileFilters(!showMobileFilters)}
						>
							<Filter className="w-4 h-4" />
							Filters
							{hasActiveFilters && (
								<span className="w-2 h-2 rounded-full bg-[#ec1d24]" />
							)}
						</button>
						<button
							type="button"
							className="h-12 px-4 bg-linear-to-br from-[#ec1d24] to-[#c91820] text-white font-medium rounded-xl transition-all duration-300 flex items-center gap-2"
							onClick={onCreateUser}
						>
							<UserPlus className="w-4 h-4" />
							<span className="hidden xs:inline">Create</span>
						</button>
					</div>
				</div>

				{/* Mobile Filters Panel */}
				{showMobileFilters && (
					<div className="lg:hidden mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
						<RoleFilterDropdown fullWidth />
						<StatusFilterDropdown fullWidth />

						{hasActiveFilters && (
							<button
								type="button"
								className="col-span-2 h-10 bg-white/5 border border-white/10 rounded-xl text-white/60 text-sm transition-all duration-300 hover:bg-white/10 flex items-center justify-center gap-2"
								onClick={() => {
									setFilterRole("");
									setFilterBanned("");
									setCurrentPage(1);
								}}
							>
								<X className="w-4 h-4" />
								Clear Filters
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
