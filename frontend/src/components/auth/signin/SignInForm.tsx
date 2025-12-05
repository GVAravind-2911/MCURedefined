import { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import {
	emailSchema,
	usernameSchema,
	passwordSchema,
} from "@/lib/auth/validation-schemas";

export default function SignInForm({ onSignUp, onForgotPassword }) {
	const router = useRouter();
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	async function handleSignIn(e) {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		const formData = new FormData(e.currentTarget);
		const identifier = formData.get("identifier")?.toString().trim();
		const password = formData.get("password")?.toString();

		try {
			if (!identifier) throw new Error("Please enter email or username");
			if (!password) throw new Error("Please enter your password");
			passwordSchema.parse(password);

			let signInResult;

			if (identifier.includes("@")) {
				emailSchema.parse(identifier);
				signInResult = await authClient.signIn.email({
					email: identifier,
					password,
				});
			} else {
				usernameSchema.parse(identifier);
				signInResult = await authClient.signIn.username({
					username: identifier,
					password,
				});
			}

			if (signInResult?.error) {
				throw new Error("Invalid credentials");
			}

			router.push("/");
			router.refresh();
		} catch (error) {
			setError(
				error instanceof z.ZodError
					? error.errors[0].message
					: error instanceof Error
						? error.message
						: "An error occurred",
			);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			<form onSubmit={handleSignIn} className="flex flex-col gap-5 relative z-1">
				<div className="flex flex-col gap-2">
					<label htmlFor="identifier" className="text-sm text-white font-medium font-[BentonSansRegular,Arial,sans-serif]">
						Email or Username
					</label>
					<input
						id="identifier"
						name="identifier"
						type="text"
						required
						autoComplete="username email"
						placeholder="you@example.com or cooluser123"
						className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-solid border-[rgba(255,255,255,0.1)] rounded-md text-base text-white transition-all duration-300 ease-in-out placeholder:text-[rgba(255,255,255,0.4)] placeholder:[-webkit-text-fill-color:rgba(255,255,255,0.4)] focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_2px_rgba(236,29,36,0.25)] [-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#1a1a1a_inset]"
					/>
				</div>

				<div className="flex flex-col gap-2">
					<label htmlFor="password" className="text-sm text-white font-medium font-[BentonSansRegular,Arial,sans-serif]">
						Password
					</label>
					<div className="relative w-full">
						<input
							id="password"
							name="password"
							type={showPassword ? "text" : "password"}
							required
							minLength={6}
							autoComplete="current-password"
							placeholder="••••••••"
							className="w-full p-3 pr-20 bg-[rgba(255,255,255,0.05)] border border-solid border-[rgba(255,255,255,0.1)] rounded-md text-base text-white transition-all duration-300 ease-in-out placeholder:text-[rgba(255,255,255,0.4)] placeholder:[-webkit-text-fill-color:rgba(255,255,255,0.4)] focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_2px_rgba(236,29,36,0.25)] [-webkit-text-fill-color:white] [&:-webkit-autofill]:shadow-[0_0_0_1000px_#1a1a1a_inset]"
						/>
						<button
							type="button"
							onClick={() => setShowPassword((prev) => !prev)}
							className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none py-1 px-2 text-[#ec1d24] cursor-pointer text-sm font-medium flex items-center rounded transition-all duration-200 ease-in-out hover:bg-[rgba(236,29,36,0.1)] focus:outline-none focus:shadow-[0_0_0_2px_rgba(236,29,36,0.25)]"
							tabIndex={-1}
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{showPassword ? "Hide" : "Show"}
						</button>
					</div>
				</div>

				{error && (
					<div className="p-3 bg-[rgba(239,68,68,0.1)] border border-solid border-[rgba(239,68,68,0.3)] rounded-md text-[#ef4444] text-sm">
						{error}
					</div>
				)}

				<button
					type="submit"
					disabled={isLoading}
					className={`p-3 bg-[#ec1d24] text-white border-none rounded-md text-base font-medium cursor-pointer transition-all duration-300 ease-in-out relative overflow-hidden hover:enabled:bg-[#d81921] hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_12px_rgba(0,0,0,0.15)] disabled:opacity-70 disabled:cursor-not-allowed before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-linear-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-600 before:ease-in-out hover:enabled:before:left-full`}
				>
					<span className={isLoading ? "opacity-0" : ""}>
						{isLoading ? "Signing in..." : "Sign In"}
					</span>
					{isLoading && (
						<span className="absolute inset-0 flex items-center justify-center">
							<span className="w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin" />
						</span>
					)}
				</button>

				<div className="text-center mt-4">
					<button
						onClick={(e) => {
							e.preventDefault();
							onForgotPassword();
						}}
						className="bg-transparent border-none text-[#ec1d24] underline cursor-pointer text-sm p-0 transition-colors duration-200 hover:text-[#f05a5e]"
						type="button"
					>
						Forgot password?
					</button>
				</div>
			</form>
		</>
	);
}
