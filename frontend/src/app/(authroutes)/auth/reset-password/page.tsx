"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import Image from "next/image";
import { resetPasswordSchema } from "@/lib/auth/validation-schemas";

export default function ResetPasswordPage() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [error, setError] = useState("");
	const [token, setToken] = useState<string | null>(null);
	const [isTokenValid, setIsTokenValid] = useState(false);
	const [validationErrors, setValidationErrors] = useState<{
		password?: string;
		confirmPassword?: string;
	}>({});
	const [passwordStrength, setPasswordStrength] = useState({
		score: 0,
		hasLength: false,
		hasUppercase: false,
		hasLowercase: false,
		hasNumber: false,
		hasSpecial: false,
	});
	const router = useRouter();

	useEffect(() => {
		const urlToken = new URLSearchParams(window.location.search).get("token");

		if (!urlToken) {
			setError(
				"Missing reset token. Please request a new password reset link.",
			);
			return;
		}

		setToken(urlToken);
		setIsTokenValid(true);
	}, []);

	useEffect(() => {
		const strength = {
			score: 0,
			hasLength: password.length >= 8,
			hasUppercase: /[A-Z]/.test(password),
			hasLowercase: /[a-z]/.test(password),
			hasNumber: /[0-9]/.test(password),
			hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
		};

		strength.score =
			(strength.hasLength ? 1 : 0) +
			(strength.hasUppercase ? 1 : 0) +
			(strength.hasLowercase ? 1 : 0) +
			(strength.hasNumber ? 1 : 0) +
			(strength.hasSpecial ? 1 : 0);

		setPasswordStrength(strength);
	}, [password]);

	const generateRandomPassword = () => {
		const lowercase = "abcdefghijklmnopqrstuvwxyz";
		const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const numbers = "0123456789";
		const special = "!@#$%^&*()_+-=[]{};'\"\\|,.<>/?";

		let password =
			lowercase.charAt(Math.floor(Math.random() * lowercase.length)) +
			uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
			numbers.charAt(Math.floor(Math.random() * numbers.length)) +
			special.charAt(Math.floor(Math.random() * special.length));

		const allChars = lowercase + uppercase + numbers + special;
		const length = Math.floor(Math.random() * 5) + 12;

		for (let i = 4; i < length; i++) {
			password += allChars.charAt(Math.floor(Math.random() * allChars.length));
		}

		password = password
			.split("")
			.sort(() => 0.5 - Math.random())
			.join("");

		setPassword(password);
		setConfirmPassword(password);
	};

	const validateForm = () => {
		try {
			resetPasswordSchema.parse({
				password,
				confirmPassword,
			});
			setValidationErrors({});
			return true;
		} catch (error) {
			if (error instanceof Error) {
				try {
					const formattedErrors = JSON.parse((error as any).message);
					const newErrors: { [key: string]: string } = {};

					for (const err of formattedErrors as {
						path: string[];
						message: string;
					}[]) {
						const path = err.path[0];
						newErrors[path] = err.message;
					}

					setValidationErrors(newErrors);
				} catch {
					setError((error as Error).message);
				}
			}
			return false;
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!token) {
			setError(
				"Invalid or missing token. Please try again with a valid reset link.",
			);
			return;
		}

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const { data, error } = await authClient.resetPassword({
				newPassword: password,
				token,
			});

			if (error) {
				throw new Error(error.message || "Failed to reset password");
			}

			setIsSuccess(true);

			setTimeout(() => {
				router.push("/auth");
			}, 3000);

		} catch (err: any) {
			console.error("Reset password error:", err);
			setError(
				err.message || "An error occurred while resetting your password",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const getStrengthColor = (score: number) => {
		const colors = ["transparent", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-green-600"];
		return colors[score] || "transparent";
	};

	const getStrengthText = (score: number) => {
		const texts = ["No password", "Very weak", "Weak", "Medium", "Strong", "Very strong"];
		return texts[score] || "";
	};

	if (!isTokenValid) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0a0a0a] bg-linear-to-r from-[rgba(236,29,36,0.2)] to-[rgba(0,0,0,0.9)]">
				<div className="max-w-md w-full mx-auto">
					<div className="bg-[#1a1a1a] rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-8 mb-8 border-t-4 border-[#ec1d24] relative overflow-hidden after:content-[''] after:absolute after:top-0 after:right-0 after:w-[100px] after:h-[100px] after:bg-[radial-gradient(circle_at_top_right,rgba(236,29,36,0.15),transparent_70%)] after:z-0">
						<div className="text-center mb-6 relative z-10">
							<Image
								src="/images/MainLogo.svg"
								alt="MCU Redefined"
								width={120}
								height={60}
							/>
						</div>

						<div className="text-center mb-6 relative z-10">
							<h2 className="font-['BentonSansBold'] text-3xl font-extrabold text-white mb-2 uppercase tracking-wider [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] after:content-[''] after:block after:w-20 after:h-1 after:bg-[#ec1d24] after:mx-auto after:mt-3">
								Invalid Token
							</h2>
						</div>

						<div className="mt-8 relative z-10">
							<div className="text-sm text-red-400 p-3 bg-red-500/10 rounded-md border border-red-500/30 mb-4">
								{error || "Missing or invalid reset token. Please request a new password reset link."}
							</div>

							<a href="/auth" className="block text-center mt-5 text-white/70 font-['BentonSansRegular'] text-sm no-underline transition-colors duration-200 hover:text-[#ec1d24]">
								Back to login
							</a>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (isSuccess) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0a0a0a] bg-linear-to-r from-[rgba(236,29,36,0.2)] to-[rgba(0,0,0,0.9)]">
				<div className="max-w-md w-full mx-auto">
					<div className="bg-[#1a1a1a] rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-8 mb-8 border-t-4 border-[#ec1d24] relative overflow-hidden after:content-[''] after:absolute after:top-0 after:right-0 after:w-[100px] after:h-[100px] after:bg-[radial-gradient(circle_at_top_right,rgba(236,29,36,0.15),transparent_70%)] after:z-0">
						<div className="text-center mb-6 relative z-10">
							<Image
								src="/images/MainLogo.svg"
								alt="MCU Redefined"
								width={120}
								height={60}
							/>
						</div>

						<div className="text-center mb-6 relative z-10">
							<h2 className="font-['BentonSansBold'] text-3xl font-extrabold text-white mb-2 uppercase tracking-wider [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] after:content-[''] after:block after:w-20 after:h-1 after:bg-[#ec1d24] after:mx-auto after:mt-3">
								Password Reset Successful
							</h2>
						</div>

						<div className="mt-8 relative z-10">
							<div className="text-sm text-emerald-500 p-4 bg-emerald-500/10 rounded-md border border-emerald-500/30">
								Your password has been successfully reset. You will be redirected to the login page.
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0a0a0a] bg-linear-to-r from-[rgba(236,29,36,0.2)] to-[rgba(0,0,0,0.9)]">
			<div className="max-w-md w-full mx-auto">
				<div className="bg-[#1a1a1a] rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-8 mb-8 border-t-4 border-[#ec1d24] relative overflow-hidden after:content-[''] after:absolute after:top-0 after:right-0 after:w-[100px] after:h-[100px] after:bg-[radial-gradient(circle_at_top_right,rgba(236,29,36,0.15),transparent_70%)] after:z-0 md:p-6">
					<div className="text-center mb-6 relative z-10">
						<Image
							src="/images/MainLogo.svg"
							alt="MCU Redefined"
							width={120}
							height={60}
						/>
					</div>

					<div className="text-center mb-6 relative z-10">
						<h2 className="font-['BentonSansBold'] text-3xl font-extrabold text-white mb-2 uppercase tracking-wider [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] after:content-[''] after:block after:w-20 after:h-1 after:bg-[#ec1d24] after:mx-auto after:mt-3 md:text-2xl">
							Reset Your Password
						</h2>
						<p className="font-['BentonSansRegular'] text-sm text-white/70 mt-2 leading-relaxed">
							Please enter your new password below
						</p>
					</div>

					<div className="mt-8 relative z-10">
						<form onSubmit={handleSubmit} className="w-full">
							<div className="mb-6">
								<div className="mb-4">
									<div className="flex justify-between items-center mb-2">
										<label htmlFor="password" className="block font-['BentonSansRegular'] text-sm text-white/80">
											New Password
										</label>
										<button
											type="button"
											className="bg-transparent border-none text-[#ec1d24] text-xs cursor-pointer transition-colors duration-200 p-0 underline hover:text-[#f43f46]"
											onClick={generateRandomPassword}
										>
											Generate Password
										</button>
									</div>
									<div className="relative flex items-center">
										<input
											type="password"
											id="password"
											name="new-password"
											autoComplete="new-password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											className={`w-full py-3 px-3 bg-white/5 border rounded-md text-white font-['BentonSansRegular'] text-sm transition-all duration-300 focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_2px_rgba(236,29,36,0.25)] placeholder:text-white/30 ${validationErrors.password ? "border-red-400" : "border-white/10"}`}
											placeholder="Enter your new password"
										/>
										<button
											type="button"
											className="absolute right-3 bg-transparent border-none text-white/50 text-xs cursor-pointer transition-colors duration-200 p-0 hover:text-white/80"
											onClick={() => {
												const input = document.getElementById("password") as HTMLInputElement;
												if (input) {
													input.type = input.type === "password" ? "text" : "password";
												}
											}}
										>
											Show
										</button>
									</div>

									<div className="mt-2.5 mb-2.5">
										<div className="h-1.5 bg-white/10 rounded-sm mb-1.5 overflow-hidden">
											<div
												className={`h-full rounded-sm transition-all duration-300 ${getStrengthColor(passwordStrength.score)}`}
												style={{ width: `${passwordStrength.score * 20}%` }}
											/>
										</div>
										<div className="text-xs text-white/70 text-right">
											{getStrengthText(passwordStrength.score)}
										</div>
									</div>

									<div className="grid grid-cols-2 gap-1.5 mt-2 mb-3 text-xs text-white/60 sm:grid-cols-1">
										<div className={`flex items-center gap-1 transition-colors duration-300 ${passwordStrength.hasLength ? "text-green-500" : ""}`}>
											{passwordStrength.hasLength ? "✓" : "○"} At least 8 characters
										</div>
										<div className={`flex items-center gap-1 transition-colors duration-300 ${passwordStrength.hasUppercase ? "text-green-500" : ""}`}>
											{passwordStrength.hasUppercase ? "✓" : "○"} Uppercase letter
										</div>
										<div className={`flex items-center gap-1 transition-colors duration-300 ${passwordStrength.hasLowercase ? "text-green-500" : ""}`}>
											{passwordStrength.hasLowercase ? "✓" : "○"} Lowercase letter
										</div>
										<div className={`flex items-center gap-1 transition-colors duration-300 ${passwordStrength.hasNumber ? "text-green-500" : ""}`}>
											{passwordStrength.hasNumber ? "✓" : "○"} Number
										</div>
										<div className={`flex items-center gap-1 transition-colors duration-300 ${passwordStrength.hasSpecial ? "text-green-500" : ""}`}>
											{passwordStrength.hasSpecial ? "✓" : "○"} Special character
										</div>
									</div>

									{validationErrors.password && (
										<div className="text-red-400 text-xs mt-1.5">
											{validationErrors.password}
										</div>
									)}
								</div>

								<div className="mb-4">
									<label htmlFor="confirmPassword" className="block mb-2 font-['BentonSansRegular'] text-sm text-white/80">
										Confirm Password
									</label>
									<div className="relative flex items-center">
										<input
											type="password"
											id="confirmPassword"
											name="confirm-password"
											autoComplete="new-password"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											required
											className={`w-full py-3 px-3 bg-white/5 border rounded-md text-white font-['BentonSansRegular'] text-sm transition-all duration-300 focus:outline-none focus:border-[#ec1d24] focus:shadow-[0_0_0_2px_rgba(236,29,36,0.25)] placeholder:text-white/30 ${validationErrors.confirmPassword ? "border-red-400" : "border-white/10"}`}
											placeholder="Confirm your new password"
										/>
										<button
											type="button"
											className="absolute right-3 bg-transparent border-none text-white/50 text-xs cursor-pointer transition-colors duration-200 p-0 hover:text-white/80"
											onClick={() => {
												const input = document.getElementById("confirmPassword") as HTMLInputElement;
												if (input) {
													input.type = input.type === "password" ? "text" : "password";
												}
											}}
										>
											Show
										</button>
									</div>
									{confirmPassword && password !== confirmPassword && (
										<div className="text-red-400 text-xs mt-1.5 flex items-center gap-1 before:content-['✗']">
											Passwords don&apos;t match
										</div>
									)}
									{validationErrors.confirmPassword && (
										<div className="text-red-400 text-xs mt-1.5">
											{validationErrors.confirmPassword}
										</div>
									)}
								</div>
							</div>

							{error && (
								<div className="text-sm text-red-400 mt-2 p-3 bg-red-500/10 rounded-md border border-red-500/30 mb-4">
									{error}
								</div>
							)}

							<button
								type="submit"
								className={`w-full flex justify-center py-3.5 px-5 bg-[#ec1d24] text-white border-none rounded-lg font-['BentonSansBold'] text-sm font-medium cursor-pointer shadow-md transition-all duration-300 relative overflow-hidden hover:bg-[#d81921] hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-[3px] focus:ring-[rgba(236,29,36,0.5)] disabled:bg-gray-500 disabled:cursor-not-allowed disabled:translate-y-0 ${isLoading ? "text-transparent" : ""}`}
								disabled={isLoading}
							>
								{isLoading ? (
									<span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 border-2 border-transparent border-t-white rounded-full animate-spin" />
								) : null}
								{isLoading ? "Processing..." : "Reset Password"}
							</button>
						</form>

						<a href="/auth" className="block text-center mt-5 text-white/70 font-['BentonSansRegular'] text-sm no-underline transition-colors duration-200 hover:text-[#ec1d24]">
							Back to login
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
