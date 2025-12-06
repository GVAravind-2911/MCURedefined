export default function ResetEmailSent({ email, onBack }) {
	return (
		<div className="transition-all duration-300 ease-in-out opacity-100 translate-y-0 text-center py-5">
			<h2 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] after:content-[''] after:block after:w-20 after:h-1 after:bg-[#ec1d24] after:mx-auto after:mt-3">
				Check Your Email
			</h2>
			<p className="text-[rgba(255,255,255,0.7)] mb-2.5">
				We&apos;ve sent a password reset link to{" "}
				<span className="text-[#ec1d24] font-medium">{email}</span>.
			</p>
			<p className="text-sm p-4 bg-[rgba(255,255,255,0.05)] border border-solid border-[rgba(255,255,255,0.1)] rounded-md my-5 text-[rgba(255,255,255,0.7)]">
				Please check your inbox and click the link to reset your password. If
				you don&apos;t see it, check your spam folder.
			</p>

			<button
				onClick={onBack}
				className="block w-full bg-transparent border border-solid border-[rgba(255,255,255,0.3)] text-white py-2.5 rounded-md cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] hover:-translate-y-0.5"
				type="button"
			>
				Back to Sign In
			</button>
		</div>
	);
}
