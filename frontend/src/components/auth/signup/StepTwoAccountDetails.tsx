export default function StepTwoAccountDetails({
	data,
	onChange,
	onNext,
	onBack,
	error,
}) {
	const handleSubmit = (e) => {
		e.preventDefault();
		onNext(e);
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-1">
			<h2 className="text-center text-2xl font-bold text-white mb-6 uppercase tracking-wide [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)]">
				Account Details
			</h2>

			<div className="flex flex-col gap-2">
				<label
					htmlFor="email"
					className="text-sm text-white font-medium font-[BentonSansRegular,Arial,sans-serif]"
				>
					Email Address
				</label>
				<input
					id="email"
					name="email"
					type="email"
					value={data.email}
					onChange={onChange}
					required
					placeholder="you@example.com"
					className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-solid border-[rgba(255,255,255,0.1)] rounded-md text-base text-white transition-all duration-300 ease-in-out placeholder:text-[rgba(255,255,255,0.4)] placeholder:[-webkit-text-fill-color:rgba(255,255,255,0.4)] focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_2px_rgba(236,29,36,0.25)] [-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#1a1a1a_inset]"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<label
					htmlFor="username"
					className="text-sm text-white font-medium font-[BentonSansRegular,Arial,sans-serif]"
				>
					Username
				</label>
				<input
					id="username"
					name="username"
					type="text"
					value={data.username}
					onChange={onChange}
					required
					placeholder="cooluser123"
					className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-solid border-[rgba(255,255,255,0.1)] rounded-md text-base text-white transition-all duration-300 ease-in-out placeholder:text-[rgba(255,255,255,0.4)] placeholder:[-webkit-text-fill-color:rgba(255,255,255,0.4)] focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_2px_rgba(236,29,36,0.25)] [-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#1a1a1a_inset]"
				/>
			</div>

			{error && (
				<div className="p-3 bg-[rgba(239,68,68,0.1)] border border-solid border-[rgba(239,68,68,0.3)] rounded-md text-[#ef4444] text-sm">
					{error}
				</div>
			)}

			<div className="flex gap-4 mt-2">
				<button
					onClick={onBack}
					className="flex-[0.4] block w-full bg-transparent border border-solid border-[rgba(255,255,255,0.3)] text-white py-2.5 rounded-md cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] hover:-translate-y-0.5"
					type="button"
				>
					Back
				</button>
				<button
					type="submit"
					className="flex-[0.6] p-3 bg-[#ec1d24] text-white border-none rounded-md text-base font-medium cursor-pointer transition-all duration-300 hover:bg-[#d81921] hover:-translate-y-0.5 hover:shadow-[0_6px_12px_rgba(0,0,0,0.15)]"
				>
					Next
				</button>
			</div>
		</form>
	);
}
