// AuthLayout.jsx
import Image from "next/image";

export default function AuthLayout({ children }) {
	return (
		<div className="fixed inset-0 bg-[#121212] z-9999">
			{/* Gradient layer with more color stops for smoother transition */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(236,29,36,0.2)_0%,rgba(118,14,18,0.15)_25%,rgba(60,7,9,0.1)_50%,rgba(0,0,0,0.5)_75%,rgba(0,0,0,0.9)_100%)]" />
			{/* Noise overlay to reduce banding */}
			<div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20200%20200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cfilter%20id%3D%22noise%22%3E%3CfeTurbulence%20type%3D%22fractalNoise%22%20baseFrequency%3D%220.85%22%20numOctaves%3D%224%22%20stitchTiles%3D%22stitch%22%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url%28%23noise%29%22%2F%3E%3C%2Fsvg%3E')]" />
			<div className="relative w-full h-screen flex items-center justify-center p-4">
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
