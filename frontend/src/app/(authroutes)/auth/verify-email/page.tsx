"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import Image from "next/image";
import "@/styles/verify-email.css";
import Link from "next/link";
import { emailSchema } from "@/lib/auth/validation-schemas";

export default function VerifyEmailPage() {
	const [email, setEmail] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [resendSuccess, setResendSuccess] = useState(false);
	const [resendError, setResendError] = useState("");
	const [validationError, setValidationError] = useState("");
	const router = useRouter();

	useEffect(() => {
		const checkSession = async () => {
			try {
				const session = await authClient.getSession();

				if (!session?.data?.user) {
					// If no session, redirect to login
					router.replace("/auth");
					return;
				}

				if (session.data.user.emailVerified) {
					// If already verified, redirect to homepage
					router.replace("/");
					return;
				}

				// Validate the email from the session
				try {
					const userEmail = session.data.user.email;
					// Validate email using the imported schema
					emailSchema.parse(userEmail);
					// Email is valid, set it in state
					setEmail(userEmail);
					setIsLoading(false);
				} catch (validationError) {
					console.error("Email validation error:", validationError);
					setResendError(
						"Invalid email format in your account. Please contact support.",
					);
					setIsLoading(false);
				}
			} catch (error) {
				console.error("Error checking session:", error);
				router.replace("/auth");
				return;
			}
		};

		checkSession();
	}, [router]);

	const handleResendVerification = async () => {
		try {
			// Reset previous states
			setResendError("");
			setValidationError("");

			// Get current session
			const session = await authClient.getSession();
			const userEmail = session.data.user.email;

			// Validate email before sending
			try {
				emailSchema.parse(userEmail);
			} catch (error) {
				setValidationError("Invalid email format. Please contact support.");
				return;
			}

			// Send verification email
			const resp = await authClient.sendVerificationEmail({
				email: userEmail,
				callbackURL: "/",
			});

			setResendSuccess(true);
		} catch (error) {
			console.error("Failed to resend verification email:", error);
			setResendError(
				error.response?.data ||
					"Failed to resend verification email. Please try again.",
			);
			setResendSuccess(false);
		}
	};

	const handleRefreshCheck = async () => {
		setIsLoading(true);
		try {
			const session = await authClient.getSession();

			if (session?.data?.user?.emailVerified) {
				router.replace("/");
				return;
			}

			setResendError("Email not verified yet. Please check your inbox.");
		} catch (error) {
			setResendError("Failed to check verification status. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (isLoading) {
		return (
			<div className="loading-container">
				<div className="loading-spinner" />
			</div>
		);
	}

	return (
		<div className="verify-page">
			<div className="verify-container">
				<div className="verify-card">
					{/* Logo */}
					<div className="text-center mb-4">
						<Image
							src="/images/MainLogo.svg"
							alt="MCU Redefined"
							width={120}
							height={60}
						/>
					</div>

					<div className="verify-header">
						<h2 className="verify-title">Verify Your Email</h2>
						<p className="verify-subtitle">
							We've sent a verification link to{" "}
							<span className="email-highlight">{email}</span>
						</p>
					</div>

					<div className="verify-content">
						<div className="verify-info-box">
							<p className="verify-info-text">
								Please check your inbox and click on the verification link to
								complete your registration.
							</p>
							<p className="verify-info-text">
								If you don't see the email, check your spam folder.
							</p>
						</div>

						{validationError && (
							<div className="error-message">{validationError}</div>
						)}

						<div style={{ display: "flex", gap: "10px" }}>
							<button
								onClick={handleResendVerification}
								className="resend-button"
								type="button"
								style={{ flex: "3" }}
								disabled={!!validationError}
							>
								Resend Verification Email
							</button>

							<button
								onClick={handleRefreshCheck}
								className="resend-button"
								type="button"
								style={{ flex: "1" }}
							>
								Refresh
							</button>
						</div>

						{resendSuccess && (
							<div className="success-message" style={{ marginTop: "16px" }}>
								Verification email has been resent. Please check your inbox.
							</div>
						)}

						{resendError && <div className="error-message">{resendError}</div>}

						<Link href="/" className="back-link">
							Back to home
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
