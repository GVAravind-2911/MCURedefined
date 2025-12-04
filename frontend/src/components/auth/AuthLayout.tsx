// AuthLayout.jsx
import Image from "next/image";

export default function AuthLayout({ children }) {
	return (
		<div className="fixed inset-0 bg-[#121212] bg-linear-to-r from-[rgba(236,29,36,0.2)] to-[rgba(0,0,0,0.9)] z-9999">
			<div className="w-full h-screen flex items-center justify-center p-4">
				<div className="w-full max-w-[400px] p-6 sm:p-8 bg-[#1a1a1a] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-t-4 border-t-[#ec1d24] relative overflow-hidden animate-[fadeIn_0.3s_ease-out] after:content-[''] after:absolute after:top-0 after:right-0 after:w-[100px] after:h-[100px] after:bg-[radial-gradient(circle_at_top_right,rgba(236,29,36,0.15),transparent_70%)] after:z-0">
					<Image
						src="/images/MainLogo.svg"
						className="w-4/5 mx-auto block mb-8 relative z-1"
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
