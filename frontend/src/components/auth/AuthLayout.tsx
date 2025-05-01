// AuthLayout.jsx
import Image from "next/image";

export default function AuthLayout({ children }) {
	return (
		<div className="auth-overlay">
			<div className="auth-container">
				<div className="auth-box">
					<Image
						src="/images/MainLogo.svg"
						className="mainlogo"
						alt="Logo"
						width={100}
						height={100}
					/>
					{children}
				</div>
			</div>
		</div>
	);
}
