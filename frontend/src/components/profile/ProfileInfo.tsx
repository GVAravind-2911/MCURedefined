import Image from "next/image";
import { useState, useEffect } from "react";
import { useEditingContext } from "@/contexts/EditingContext";

interface UserProfileData {
	id?: string;
	userId?: string;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface ProfileInfoProps {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	session: any;
	userProfile: UserProfileData | null;
	onProfileUpdate: () => Promise<void>;
	isLoading: boolean;
}

export default function ProfileInfo({
	session,
	userProfile,
	onProfileUpdate,
	isLoading,
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

			if (response.ok) {
				setIsEditing(false); // Use context setter
				await onProfileUpdate();
			} else {
				// Existing error handling...
			}
		} catch (error) {
			console.error("Error updating profile:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<div className="profile-info">
				<div className="profile-avatar-container">
					<div className="profile-avatar-placeholder loading-animation">
						<span />
					</div>
				</div>
				<div className="profile-details loading-animation">
					<div className="loading-text-block" />
					<div className="loading-text-line" />
					<div className="loading-text-line" />
				</div>
			</div>
		);
	}

	return (
		<div className="profile-info">
			<div className="profile-avatar-container">
				{user?.image ? (
					<Image
						src={user.image}
						alt="Profile picture"
						width={120}
						height={120}
						className="profile-avatar"
					/>
				) : (
					<div className="profile-avatar-placeholder">
						<span>{firstLetter}</span>
					</div>
				)}
			</div>

			{!isEditing ? (
				<div className="profile-details">
					<div className="profile-header">
						<h2>{user?.name || "User"}</h2>
						<button
							className="edit-profile-button"
							onClick={() => setIsEditing(true)}
							aria-label="Edit profile"
							type="button"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="16"
								height="16"
								fill="currentColor"
								viewBox="0 0 16 16"
							>
								<title>Edit profile</title>
								<path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z" />
							</svg>
						</button>
					</div>
					<p className="username">
						@
						{user?.username ||
							user?.name?.toLowerCase().replace(/\s+/g, "") ||
							"user"}
					</p>

					<div className="profile-description">
						{userProfile?.description ? (
							<p>{userProfile.description}</p>
						) : (
							<p className="no-description">No description added yet</p>
						)}
					</div>
				</div>
			) : (
				<div className="profile-edit-form">
					<form onSubmit={handleSubmit}>
						<div className="form-group">
							<label htmlFor="name">Name</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								placeholder="Your name"
								required
							/>
							{errors.name && <div className="form-error">{errors.name}</div>}
						</div>

						<div className="form-group">
							<label htmlFor="description">About me</label>
							<textarea
								id="description"
								name="description"
								value={formData.description}
								onChange={handleChange}
								placeholder="Tell us about yourself..."
								rows={4}
								maxLength={2000}
							/>
							<div className="character-count">
								{formData.description.length}/2000
							</div>
							{errors.description && (
								<div className="form-error">{errors.description}</div>
							)}
						</div>

						<div className="form-actions">
							<button
								type="button"
								className="cancel-button"
								onClick={() => setIsEditing(false)}
								disabled={isSubmitting}
							>
								Cancel
							</button>
							<button
								type="submit"
								className="save-button"
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
