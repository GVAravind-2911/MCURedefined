import { USER_ROLES } from "@/types/UserManagementTypes";

export const formatDate = (date: Date | string) => {
	return new Date(date).toLocaleDateString("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
};

export const getRoleBadgeClass = (role: string) => {
	const roleConfig = USER_ROLES[role as keyof typeof USER_ROLES];
	return roleConfig?.color || "bg-gray-500";
};
