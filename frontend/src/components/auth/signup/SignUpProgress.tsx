export default function SignUpProgress({ currentStep }) {
	return (
		<div className="flex items-center justify-center mb-8 relative z-1">
			<div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white border-2 border-solid transition-all duration-300 ${currentStep >= 1 ? "bg-[#ec1d24] border-[#ec1d24] shadow-[0_0_15px_rgba(236,29,36,0.4)]" : "bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.2)]"}`}>
				1
			</div>
			<div className="flex-1 h-0.5 bg-[rgba(255,255,255,0.2)] mx-2.5" />
			<div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white border-2 border-solid transition-all duration-300 ${currentStep >= 2 ? "bg-[#ec1d24] border-[#ec1d24] shadow-[0_0_15px_rgba(236,29,36,0.4)]" : "bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.2)]"}`}>
				2
			</div>
			<div className="flex-1 h-0.5 bg-[rgba(255,255,255,0.2)] mx-2.5" />
			<div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-white border-2 border-solid transition-all duration-300 ${currentStep >= 3 ? "bg-[#ec1d24] border-[#ec1d24] shadow-[0_0_15px_rgba(236,29,36,0.4)]" : "bg-[rgba(255,255,255,0.1)] border-[rgba(255,255,255,0.2)]"}`}>
				3
			</div>
		</div>
	);
}
