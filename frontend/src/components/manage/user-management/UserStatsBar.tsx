"use client";

import type { ManagedUser } from "./types";
import { Users, Shield, Ban, MailX } from "lucide-react";

interface UserStatsBarProps {
	total: number;
	users: ManagedUser[];
}

export default function UserStatsBar({ total, users }: UserStatsBarProps) {
	const stats = [
		{
			label: "Total Users",
			value: total,
			icon: Users,
			gradient: "from-blue-500/20 to-blue-600/5",
			iconColor: "text-blue-400",
			borderHover: "hover:border-blue-500/50",
		},
		{
			label: "Admins",
			value: users.filter((u) => u.role === "admin").length,
			icon: Shield,
			gradient: "from-[#ec1d24]/20 to-[#ec1d24]/5",
			iconColor: "text-[#ec1d24]",
			borderHover: "hover:border-[#ec1d24]/50",
		},
		{
			label: "Banned",
			value: users.filter((u) => u.banned).length,
			icon: Ban,
			gradient: "from-red-500/20 to-red-600/5",
			iconColor: "text-red-400",
			borderHover: "hover:border-red-500/50",
		},
		{
			label: "Unverified",
			value: users.filter((u) => !u.emailVerified).length,
			icon: MailX,
			gradient: "from-amber-500/20 to-amber-600/5",
			iconColor: "text-amber-400",
			borderHover: "hover:border-amber-500/50",
		},
	];

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
			{stats.map((stat) => {
				const Icon = stat.icon;
				return (
					<div
						key={stat.label}
						className={`relative overflow-hidden bg-linear-to-br ${stat.gradient} backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 transition-all duration-300 ${stat.borderHover} hover:-translate-y-1 hover:shadow-lg group`}
					>
						{/* Background Glow */}
						<div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-white/5 blur-2xl group-hover:bg-white/10 transition-all duration-500" />

						{/* Icon */}
						<div
							className={`relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-black/30 ${stat.iconColor}`}
						>
							<Icon className="w-5 h-5 sm:w-6 sm:h-6" />
						</div>

						{/* Content */}
						<div className="relative flex flex-col gap-0.5">
							<span className="text-xl sm:text-2xl md:text-3xl font-bold text-white font-[BentonSansBold] leading-none">
								{stat.value.toLocaleString()}
							</span>
							<span className="text-[0.7rem] sm:text-xs text-white/50 uppercase tracking-wider font-medium">
								{stat.label}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}
