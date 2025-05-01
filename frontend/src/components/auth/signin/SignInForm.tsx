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
			<form onSubmit={handleSignIn} className="auth-form">
				<div className="form-group">
					<label htmlFor="identifier">Email or Username</label>
					<input
						id="identifier"
						name="identifier"
						type="text"
						required
						autoComplete="username email"
						placeholder="you@example.com or cooluser123"
					/>
				</div>

				<div className="form-group">
					<label htmlFor="password">Password</label>
					<div className="password-input-wrapper">
						<input
							id="password"
							name="password"
							type={showPassword ? "text" : "password"}
							required
							minLength={6}
							autoComplete="current-password"
							placeholder="••••••••"
							className="password-input"
						/>
						<button
							type="button"
							onClick={() => setShowPassword((prev) => !prev)}
							className="password-toggle-btn"
							tabIndex={-1}
							aria-label={showPassword ? "Hide password" : "Show password"}
						>
							{showPassword ? "Hide" : "Show"}
						</button>
					</div>
				</div>

				{error && <div className="error-message">{error}</div>}

				<button
					type="submit"
					disabled={isLoading}
					className={isLoading ? "loading" : ""}
				>
					{isLoading ? "Signing in..." : "Sign In"}
				</button>

				<div className="forgot-password">
					<button
						onClick={(e) => {
							e.preventDefault();
							onForgotPassword();
						}}
						className="forgot-link"
						type="button"
					>
						Forgot password?
					</button>
				</div>
			</form>
		</>
	);
}
