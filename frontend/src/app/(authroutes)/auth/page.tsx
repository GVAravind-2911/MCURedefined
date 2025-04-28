"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import axios from "axios";
import Image from "next/image";
import "@/styles/auth.css";

export default function Auth() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [forgotPassword, setForgotPassword] = useState(false);
    const [resetEmailSent, setResetEmailSent] = useState(false);
    const [resetEmail, setResetEmail] = useState("");

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

    async function handleForgotPassword(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);
        const email = (formData.get("email") as string)?.trim();

        if (!email) {
            setError("Please enter your email address");
            setIsLoading(false);
            return;
        }

        try {
            const result = await authClient.forgetPassword({
				email: email,
				redirectTo: "/auth/reset-password",
			  });

            if (result?.error) {
                throw new Error(result.error.message);
            }

            setResetEmailSent(true);
            setResetEmail(email);
        } catch (error) {
            console.error("Reset password error:", error);
            setError(error instanceof Error 
                ? error.message 
                : "Failed to send reset email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    // If reset email was sent successfully, show success message
    if (resetEmailSent) {
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
                        
                        <div className="reset-success">
                            <h2>Check Your Email</h2>
                            <p>
                                We've sent a password reset link to <span className="email-highlight">{resetEmail}</span>
                            </p>
                            <p className="reset-info">
                                Please check your inbox and click the link to reset your password. 
                                If you don't see it, please check your spam folder.
                            </p>
                            
                            <button 
                                onClick={() => {
                                    setForgotPassword(false);
                                    setResetEmailSent(false);
                                }}
                                className="back-button"
                                type="button"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If in forgot password mode, show the reset password form
    if (forgotPassword) {
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
                        
                        <h2 className="forgot-title">Reset Your Password</h2>
                        <p className="forgot-subtitle">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                        
                        <form onSubmit={handleForgotPassword} className="auth-form">
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

                            {error && <div className="error-message">{error}</div>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={isLoading ? "loading" : ""}
                            >
                                {isLoading ? "Sending..." : "Send Reset Link"}
                            </button>
                            
                            <button 
                                onClick={() => setForgotPassword(false)}
                                className="back-button"
                                type="button"
                            >
                                Back to Sign In
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Normal login/signup form
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
                        
                        {/* Add forgot password link - only show for sign in */}
                        {!isSignUp && (
                            <div className="forgot-password">
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setForgotPassword(true);
                                    }}
                                    className="forgot-link"
                                    type="button"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}