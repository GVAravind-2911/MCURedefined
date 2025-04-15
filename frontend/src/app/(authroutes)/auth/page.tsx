"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import Image from "next/image";
import "@/styles/auth.css";

export default function Auth() {
	const router = useRouter();
	const searchParams = useSearchParams();
	// const callbackURL = searchParams.get("callbackUrl");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isSignUp, setIsSignUp] = useState(false);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		const formData = new FormData(e.currentTarget);
		const data = {
			email: (formData.get("email") as string).trim(),
			password: formData.get("password") as string,
			confirmPassword: formData.get("confirmPassword") as string,
			name: isSignUp ? (formData.get("name") as string).trim() : undefined,
		};

		if (isSignUp) {
			if (
				!data.email ||
				!data.password ||
				!data.name ||
				!data.confirmPassword
			) {
				setError("All fields are required");
				setIsLoading(false);
				return;
			}

			if (data.password.length < 6) {
				setError("Password must be at least 6 characters");
				setIsLoading(false);
				return;
			}

			if (data.password !== data.confirmPassword) {
				setError("Passwords do not match");
				setIsLoading(false);
				return;
			}

			try {
				const resp = await authClient.signUp.email({
					email: data.email,
					password: data.password,
					name: data.name,
				});
				if (resp?.error) {
					console.error("Signup error:", error);
				}
		
				console.log({ success: true }, { status: 201 });
			} catch (error) {
				console.error("Signup error:", error);
				console.log({ error: "Error creating user" }, { status: 500 });
			}
		}

		try {
			const signInResult = await authClient.signIn.email({
				email: data.email,
				password: data.password,
			})

			if (signInResult?.error) {
				throw new Error("Invalid credentials");
			}

			router.push("/");
			router.refresh();
		} catch (error) {
			setError(error instanceof Error ? error.message : "An error occurred");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="auth-overlay">
			<div className="auth-container">
				<div className="auth-box">
					<Image
						src="/images/MainLogo.svg"
						className="mainlogo"
						alt="Logo"
						width={100}
						height={100}
					/>
					<div className="auth-toggle">
						<button
							className={!isSignUp ? "active" : ""}
							onClick={() => setIsSignUp(false)}
							type="button"
						>
							Sign In
						</button>
						<button
							className={isSignUp ? "active" : ""}
							onClick={() => setIsSignUp(true)}
							type="button"
						>
							Sign Up
						</button>
					</div>
					<form onSubmit={handleSubmit} className="auth-form">
						{isSignUp && (
							<div className="form-group">
								<label htmlFor="name">Name</label>
								<input
									id="name"
									name="name"
									type="text"
									placeholder="John Doe"
								/>
							</div>
						)}

						<div className="form-group">
							<label htmlFor="email">Email</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								autoComplete="off"
								placeholder="you@example.com"
							/>
						</div>

						<div className="form-group">
							<label htmlFor="password">Password</label>
							<input
								id="password"
								name="password"
								type="password"
								required
								minLength={6}
								placeholder="••••••••"
							/>
						</div>

						{isSignUp && (
							<div className="form-group">
								<label htmlFor="confirmPassword">Confirm Password</label>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									required
									minLength={6}
									placeholder="••••••••"
								/>
							</div>
						)}

						{error && <div className="error-message">{error}</div>}

						<button
							type="submit"
							disabled={isLoading}
							className={isLoading ? "loading" : ""}
						>
							{isLoading
								? isSignUp
									? "Signing up..."
									: "Signing in..."
								: isSignUp
									? "Sign Up"
									: "Sign In"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
