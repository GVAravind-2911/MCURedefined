import Image from "next/image";
import { useState, useEffect } from "react";
import { useEditingContext } from "@/contexts/EditingContext";

interface UserProfileData {
	id?: string;
	userId?: string;
	name?: string;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface ProfileInfoProps {
	session: {
		user: {
			id: string;
			name: string;
			email: string;
			image?: string;
		};
		session: {
			id: string;
			userId: string;
			expiresAt: Date;
			token: string;
			createdAt: Date;
			updatedAt: Date;
		};
	};
	userProfile: UserProfileData | null;
	onProfileUpdate: () => Promise<void>;
	isLoading: boolean;
	isUpdating?: boolean;
	onUpdate?: (data: Partial<UserProfileData>) => Promise<void>;
}

export default function ProfileInfo({
	session,
	userProfile,
	onProfileUpdate,
	isLoading,
	isUpdating = false,
	onUpdate,
}: ProfileInfoProps) {
	const { user } = session;
	const firstLetter = user?.name ? user.name[0].toUpperCase() : "?";
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errors, setErrors] = useState<{ [key: string]: string }>({});
	const [formData, setFormData] = useState({
		name: user?.name || "",
		description: userProfile?.description || "",
	});

	const { isEditing, setIsEditing } = useEditingContext();

	// Update form data when userProfile changes
	useEffect(() => {
		if (userProfile) {
			setFormData((prev) => ({
				...prev,
				description: userProfile.description || "",
			}));
		}
	}, [userProfile]);

	// Update name when user changes
	useEffect(() => {
		if (user) {
			setFormData((prev) => ({
				...prev,
				name: user.name || "",
			}));
		}
	}, [user]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setErrors({});

		try {
			// Use optimized update function if available
			if (onUpdate) {
				await onUpdate({
					name: formData.name,
					description: formData.description,
				});
			} else {
				// Fallback to direct API call
				const response = await fetch("/api/user/profile", {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						name: formData.name,
						description: formData.description,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					if (errorData.details) {
						const fieldErrors: { [key: string]: string } = {};
						for (const error of errorData.details) {
							fieldErrors[error.path[0]] = error.message;
						}
						setErrors(fieldErrors);
					} else {
						setErrors({ general: errorData.error || "Failed to update profile" });
					}
					return;
				}

				await onProfileUpdate();
			}

			setIsEditing(false);
		} catch (error) {
			console.error("Error updating profile:", error);
			setErrors({ general: "Failed to update profile" });
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center bg-white/5 rounded-xl p-6 md:p-8 border border-white/10 transition-all duration-300">
				<div className="mr-6 md:mr-8 shrink-0">
					<div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-linear-to-r from-white/5 via-white/10 to-white/5 bg-size-[200%_100%] animate-[shimmer_1.5s_infinite]" />
				</div>
				<div className="flex-1 space-y-3">
					<div className="h-7 w-3/5 rounded bg-linear-to-r from-white/5 via-white/10 to-white/5 bg-size-[200%_100%] animate-[shimmer_1.5s_infinite]" />
					<div className="h-4 w-4/5 rounded bg-linear-to-r from-white/5 via-white/10 to-white/5 bg-size-[200%_100%] animate-[shimmer_1.5s_infinite]" />
					<div className="h-4 w-1/2 rounded bg-linear-to-r from-white/5 via-white/10 to-white/5 bg-size-[200%_100%] animate-[shimmer_1.5s_infinite]" />
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col md:flex-row items-center md:items-start bg-white/5 rounded-xl p-6 md:p-8 border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-white/20">
			<div className="mr-0 md:mr-8 mb-6 md:mb-0 shrink-0">
				{user?.image ? (
					<Image
						src={user.image}
						alt="Profile picture"
						width={120}
						height={120}
						className="w-24 h-24 md:w-28 md:h-28 rounded-full border-3 border-[#ec1d24] object-cover"
					/>
				) : (
					<div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-3 border-[#ec1d24] bg-linear-to-br from-[#ec1d24] to-[#ff7f50] flex items-center justify-center">
						<span className="font-[BentonSansBold] text-4xl text-white">{firstLetter}</span>
					</div>
				)}
			</div>

			{!isEditing ? (
				<div className="flex-1 text-center md:text-left text-white">
					<div className="flex flex-col md:flex-row items-center md:items-start md:justify-between mb-2">
						<h2 className="font-[BentonSansBold] text-2xl md:text-3xl m-0">{user?.name || "User"}</h2>
						<button
							className="mt-2 md:mt-0 p-2 bg-transparent border-none text-white/50 cursor-pointer transition-all duration-200 flex items-center justify-center hover:text-[#ec1d24] hover:scale-110"
							onClick={() => setIsEditing(true)}
							aria-label="Edit profile"
							type="button"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								fill="currentColor"
								viewBox="0 0 16 16"
							>
								<title>Edit profile</title>
								<path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
							</svg>
						</button>
					</div>
					<p className="text-[#ec1d24] font-[BentonSansRegular] text-base md:text-lg m-0 mb-1">
						@{user?.name?.toLowerCase().replace(/\s+/g, "") || "user"}
					</p>

					<div className="mt-4 text-white/80 leading-relaxed text-sm md:text-base max-w-lg">
						{userProfile?.description ? (
							<p>{userProfile.description}</p>
						) : (
							<p className="text-white/50 italic">No description added yet</p>
						)}
					</div>
				</div>
			) : (
				<div className="flex-1 w-full">
					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label htmlFor="name" className="block mb-2 text-white/80 font-[BentonSansRegular] text-sm">
								Name
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								placeholder="Your name"
								required
								className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-[BentonSansRegular] text-base transition-all duration-200 focus:bg-white/10 focus:border-[#ec1d24] focus:outline-none placeholder:text-white/40"
							/>
							{errors.name && <div className="text-red-400 text-sm mt-1">{errors.name}</div>}
						</div>

						<div>
							<label htmlFor="description" className="block mb-2 text-white/80 font-[BentonSansRegular] text-sm">
								About me
							</label>
							<textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder="Tell us about yourself..."
								rows={4}
								maxLength={2000}
								className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white font-[BentonSansRegular] text-base transition-all duration-200 focus:bg-white/10 focus:border-[#ec1d24] focus:outline-none resize-y min-h-[100px] placeholder:text-white/40"
							/>
							<div className="text-right text-xs text-white/70 mt-1">
								{formData.description.length}/2000
							</div>
							{errors.description && (
								<div className="text-red-400 text-sm mt-1">{errors.description}</div>
							)}
						</div>

						<div className="flex gap-3 justify-end pt-2">
							<button
								type="button"
								className="px-5 py-2.5 rounded-lg font-[BentonSansRegular] cursor-pointer transition-all duration-300 border-none bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
								onClick={() => setIsEditing(false)}
								disabled={isSubmitting}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="px-5 py-2.5 rounded-lg font-[BentonSansBold] cursor-pointer transition-all duration-300 border-none bg-[#ec1d24] text-white hover:bg-[#ff2c33] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
								disabled={isSubmitting}
							>
								{isSubmitting ? "Saving..." : "Save Changes"}
							</button>
						</div>
					</form>
				</div>
			)}
		</div>
	);
}
