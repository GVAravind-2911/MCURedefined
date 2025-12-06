import { useState } from "react";
import { emailSchema } from "@/lib/auth/validation-schemas";
import { authClient } from "@/lib/auth/auth-client";
import { z } from "zod";

export default function ForgotPasswordForm({ onBack, onSuccess }) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [emailSent, setEmailSent] = useState(false);

	async function handleForgotPassword(e) {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		const formData = new FormData(e.currentTarget);
		const email = formData.get("email")?.toString().trim();

		try {
			emailSchema.parse(email);

			const result = await authClient.requestPasswordReset({
				email: email,
				redirectTo: "/auth/reset-password",
			});

			if (result?.error) {
				throw new Error(result.error.message);
			}

			setEmailSent(true);
			onSuccess(email);
		} catch (error) {
			console.error("Reset password error:", error);
			setError(
				error instanceof z.ZodError
					? error.errors[0].message
					: error instanceof Error
						? error.message
						: "Failed to send reset email. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="transition-all duration-300 ease-in-out opacity-100 translate-y-0">
			<h2 className="text-center text-2xl font-bold text-white mb-2.5 uppercase tracking-wide [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] after:content-[''] after:block after:w-20 after:h-1 after:bg-[#ec1d24] after:mx-auto after:mt-3">
				Reset Your Password
			</h2>
			<p className="text-center text-sm text-[rgba(255,255,255,0.7)] mb-5">
				Enter your email address and we&apos;ll send you a reset link.
			</p>

			<form
				onSubmit={handleForgotPassword}
				className="flex flex-col gap-5 relative z-1"
			>
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
						required
						autoComplete="off"
						placeholder="you@example.com"
						className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-solid border-[rgba(255,255,255,0.1)] rounded-md text-base text-white transition-all duration-300 ease-in-out placeholder:text-[rgba(255,255,255,0.4)] placeholder:[-webkit-text-fill-color:rgba(255,255,255,0.4)] focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_2px_rgba(236,29,36,0.25)] [-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#1a1a1a_inset]"
					/>
				</div>

				{error && (
					<div className="p-3 bg-[rgba(239,68,68,0.1)] border border-solid border-[rgba(239,68,68,0.3)] rounded-md text-[#ef4444] text-sm">
						{error}
					</div>
				)}

				<button
					type="submit"
					disabled={isLoading}
					className="p-3 bg-[#ec1d24] text-white border-none rounded-md text-base font-medium cursor-pointer transition-all duration-300 relative overflow-hidden hover:enabled:bg-[#d81921] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_12px_rgba(0,0,0,0.15)] disabled:opacity-70 disabled:cursor-not-allowed"
				>
					<span className={isLoading ? "opacity-0" : ""}>
						{isLoading ? "Sending..." : "Send Reset Link"}
					</span>
					{isLoading && (
						<span className="absolute inset-0 flex items-center justify-center">
							<span className="w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin" />
						</span>
					)}
				</button>

				<button
					onClick={(e) => {
						e.preventDefault();
						onBack();
					}}
					className="block w-full bg-transparent border border-solid border-[rgba(255,255,255,0.3)] text-white py-2.5 rounded-md cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] hover:-translate-y-0.5"
					type="button"
				>
					Back to Sign In
				</button>
			</form>
		</div>
	);
}
