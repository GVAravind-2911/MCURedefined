"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import Image from "next/image";
import "@/styles/reset-password.css";
import { resetPasswordSchema } from "@/lib/auth/validation-schemas"; // Update with the correct path

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
		// Extract token from URL on client-side
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

	// Check password strength on password change
	useEffect(() => {
		const strength = {
			score: 0,
			hasLength: password.length >= 8,
			hasUppercase: /[A-Z]/.test(password),
			hasLowercase: /[a-z]/.test(password),
			hasNumber: /[0-9]/.test(password),
			hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
		};

		// Calculate score based on criteria met
		strength.score =
			(strength.hasLength ? 1 : 0) +
			(strength.hasUppercase ? 1 : 0) +
			(strength.hasLowercase ? 1 : 0) +
			(strength.hasNumber ? 1 : 0) +
			(strength.hasSpecial ? 1 : 0);

		setPasswordStrength(strength);
	}, [password]);

	// Generate a secure random password
	const generateRandomPassword = () => {
		const lowercase = "abcdefghijklmnopqrstuvwxyz";
		const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const numbers = "0123456789";
		const special = "!@#$%^&*()_+-=[]{};'\"\\|,.<>/?";

		// Ensure at least one of each character type
		let password =
			lowercase.charAt(Math.floor(Math.random() * lowercase.length)) +
			uppercase.charAt(Math.floor(Math.random() * uppercase.length)) +
			numbers.charAt(Math.floor(Math.random() * numbers.length)) +
			special.charAt(Math.floor(Math.random() * special.length));

		// Add additional random characters for length (12-16 characters total)
		const allChars = lowercase + uppercase + numbers + special;
		const length = Math.floor(Math.random() * 5) + 12; // Length between 12-16 chars

		for (let i = 4; i < length; i++) {
			password += allChars.charAt(Math.floor(Math.random() * allChars.length));
		}

		// Shuffle the password
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
					// Try to parse Zod validation errors
					// biome-ignore lint/suspicious/noExplicitAny: <explanation>
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
					// If parsing fails, show generic error
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

		// Use Zod validation
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

			// Redirect to login after 3 seconds
			setTimeout(() => {
				router.push("/auth");
			}, 3000);

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		} catch (err: any) {
			console.error("Reset password error:", err);
			setError(
				err.message || "An error occurred while resetting your password",
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (!isTokenValid) {
		return (
			<div className="reset-page">
				<div className="reset-container">
					<div className="reset-card">
						<div className="reset-logo">
							<Image
								src="/images/MainLogo.svg"
								alt="MCU Redefined"
								width={120}
								height={60}
							/>
						</div>

						<div className="reset-header">
							<h2 className="reset-title">Invalid Token</h2>
						</div>

						<div className="reset-content">
							<div className="reset-error">
								{error ||
									"Missing or invalid reset token. Please request a new password reset link."}
							</div>

							<a href="/auth" className="reset-link">
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
			<div className="reset-page">
				<div className="reset-container">
					<div className="reset-card">
						<div className="reset-logo">
							<Image
								src="/images/MainLogo.svg"
								alt="MCU Redefined"
								width={120}
								height={60}
							/>
						</div>

						<div className="reset-header">
							<h2 className="reset-title">Password Reset Successful</h2>
						</div>

						<div className="reset-content">
							<div className="reset-success">
								Your password has been successfully reset. You will be
								redirected to the login page.
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="reset-page">
			<div className="reset-container">
				<div className="reset-card">
					<div className="reset-logo">
						<Image
							src="/images/MainLogo.svg"
							alt="MCU Redefined"
							width={120}
							height={60}
						/>
					</div>

					<div className="reset-header">
						<h2 className="reset-title">Reset Your Password</h2>
						<p className="reset-subtitle">
							Please enter your new password below
						</p>
					</div>

					<div className="reset-content">
						<form onSubmit={handleSubmit} className="reset-form">
							<div className="password-section">
								<div className="form-item">
									<div className="password-header">
										<label htmlFor="password">New Password</label>
										<button
											type="button"
											className="generate-password-btn"
											onClick={generateRandomPassword}
										>
											Generate Password
										</button>
									</div>
									<div className="password-input-wrapper">
										<input
											type="password"
											id="password"
											name="new-password" // For password manager compatibility
											autoComplete="new-password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											className={`password-field ${validationErrors.password ? "error" : ""}`}
											placeholder="Enter your new password"
										/>
										<button
											type="button"
											className="toggle-password-btn"
											onClick={() => {
												const input = document.getElementById(
													"password",
												) as HTMLInputElement;
												if (input) {
													input.type =
														input.type === "password" ? "text" : "password";
												}
											}}
										>
											Show
										</button>
									</div>

									<div className="password-strength-meter">
										<div className="password-strength-bar">
											<div
												className={`strength-bar-fill strength-${passwordStrength.score}`}
												style={{ width: `${passwordStrength.score * 20}%` }}
											/>
										</div>
										<div className="password-strength-text">
											{passwordStrength.score === 0 && "No password"}
											{passwordStrength.score === 1 && "Very weak"}
											{passwordStrength.score === 2 && "Weak"}
											{passwordStrength.score === 3 && "Medium"}
											{passwordStrength.score === 4 && "Strong"}
											{passwordStrength.score === 5 && "Very strong"}
										</div>
									</div>

									<div className="password-requirements">
										<div
											className={`requirement ${passwordStrength.hasLength ? "met" : ""}`}
										>
											{passwordStrength.hasLength ? "✓" : "○"} At least 8
											characters
										</div>
										<div
											className={`requirement ${passwordStrength.hasUppercase ? "met" : ""}`}
										>
											{passwordStrength.hasUppercase ? "✓" : "○"} Uppercase
											letter
										</div>
										<div
											className={`requirement ${passwordStrength.hasLowercase ? "met" : ""}`}
										>
											{passwordStrength.hasLowercase ? "✓" : "○"} Lowercase
											letter
										</div>
										<div
											className={`requirement ${passwordStrength.hasNumber ? "met" : ""}`}
										>
											{passwordStrength.hasNumber ? "✓" : "○"} Number
										</div>
										<div
											className={`requirement ${passwordStrength.hasSpecial ? "met" : ""}`}
										>
											{passwordStrength.hasSpecial ? "✓" : "○"} Special
											character
										</div>
									</div>

									{validationErrors.password && (
										<div className="validation-error">
											{validationErrors.password}
										</div>
									)}
								</div>

								<div className="form-item">
									<label htmlFor="confirmPassword">Confirm Password</label>
									<div className="password-input-wrapper">
										<input
											type="password"
											id="confirmPassword"
											name="confirm-password" // For password manager compatibility
											autoComplete="new-password"
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											required
											className={`password-field ${validationErrors.confirmPassword ? "error" : ""}`}
											placeholder="Confirm your new password"
										/>
										<button
											type="button"
											className="toggle-password-btn"
											onClick={() => {
												const input = document.getElementById(
													"confirmPassword",
												) as HTMLInputElement;
												if (input) {
													input.type =
														input.type === "password" ? "text" : "password";
												}
											}}
										>
											Show
										</button>
									</div>
									{confirmPassword && password !== confirmPassword && (
										<div className="validation-error match-error">
											Passwords don't match
										</div>
									)}
									{validationErrors.confirmPassword && (
										<div className="validation-error">
											{validationErrors.confirmPassword}
										</div>
									)}
								</div>
							</div>

							{error && <div className="reset-error">{error}</div>}

							<button
								type="submit"
								className={`reset-button ${isLoading ? "loading" : ""}`}
								disabled={isLoading}
							>
								{isLoading ? "Processing..." : "Reset Password"}
							</button>
						</form>

						<a href="/auth" className="reset-link">
							Back to login
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
