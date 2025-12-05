import type React from "react";
import UserManagement from "@/components/manage/UserManagement";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ManageUsersPage(): Promise<React.ReactElement> {
	return (
		<div className="flex flex-col w-full max-w-full items-center">
			<div className="relative w-full max-w-[1400px] h-[280px] bg-linear-to-r from-[#ec1d24]/80 to-black/80 bg-cover bg-center mb-8 flex items-center justify-center overflow-hidden rounded-lg">
				<div className="absolute inset-0 bg-black/40" />
				<div className="relative z-2 text-center px-4 max-w-[800px]">
					<h1 className="font-[BentonSansBold] text-[clamp(28px,5vw,48px)] text-white mb-4 uppercase tracking-[1px] [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] after:content-[''] after:block after:w-[100px] after:h-1 after:bg-[#ec1d24] after:mx-auto after:mt-3">User Management</h1>
					<p className="font-[BentonSansRegular] text-[clamp(16px,2vw,18px)] text-white/80 max-w-[600px] mx-auto leading-relaxed">Manage users, roles, and permissions for your application.</p>
				</div>
			</div>
			<UserManagement />
		</div>
	);
}
