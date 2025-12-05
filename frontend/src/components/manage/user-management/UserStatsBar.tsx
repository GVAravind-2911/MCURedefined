"use client";

import type { ManagedUser } from "./types";

interface UserStatsBarProps {
	total: number;
	users: ManagedUser[];
}

export default function UserStatsBar({ total, users }: UserStatsBarProps) {
	return (
		<div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 mb-6">
			<div className="bg-[rgba(18,18,18,0.95)] border border-white/10 rounded-[14px] py-5 px-6 flex flex-col gap-1 transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(236,29,36,0.1)]">
				<span className="text-[2rem] font-bold text-white font-[BentonSansBold]">{total}</span>
				<span className="text-[0.85rem] text-white/50 uppercase tracking-[0.5px]">Total Users</span>
			</div>
			<div className="bg-[rgba(18,18,18,0.95)] border border-white/10 rounded-[14px] py-5 px-6 flex flex-col gap-1 transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(236,29,36,0.1)]">
				<span className="text-[2rem] font-bold text-white font-[BentonSansBold]">
					{users.filter((u) => u.role === "admin").length}
				</span>
				<span className="text-[0.85rem] text-white/50 uppercase tracking-[0.5px]">Admins</span>
			</div>
			<div className="bg-[rgba(18,18,18,0.95)] border border-white/10 rounded-[14px] py-5 px-6 flex flex-col gap-1 transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(236,29,36,0.1)]">
				<span className="text-[2rem] font-bold text-white font-[BentonSansBold]">
					{users.filter((u) => u.banned).length}
				</span>
				<span className="text-[0.85rem] text-white/50 uppercase tracking-[0.5px]">Banned</span>
			</div>
			<div className="bg-[rgba(18,18,18,0.95)] border border-white/10 rounded-[14px] py-5 px-6 flex flex-col gap-1 transition-all duration-[0.25s] hover:border-[#ec1d24] hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(236,29,36,0.1)]">
				<span className="text-[2rem] font-bold text-white font-[BentonSansBold]">
					{users.filter((u) => !u.emailVerified).length}
				</span>
				<span className="text-[0.85rem] text-white/50 uppercase tracking-[0.5px]">Unverified</span>
			</div>
		</div>
	);
}
