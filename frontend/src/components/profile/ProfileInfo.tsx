import Image from "next/image";

export default function ProfileInfo({ session }) {
	const { user } = session;
	const firstLetter = user?.name ? user.name[0].toUpperCase() : "?";

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

			<div className="profile-details">
				<h2>{user?.name || "User"}</h2>
				<p className="username">
					@{user?.name?.toLowerCase().replace(/\s+/g, "") || "user"}
				</p>
				<p className="email">{user?.email || "No email provided"}</p>
			</div>
		</div>
	);
}
