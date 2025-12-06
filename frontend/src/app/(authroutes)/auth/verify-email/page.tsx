"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import Image from "next/image";
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
			<div className="flex justify-center items-center min-h-screen bg-[#0a0a0a]">
				<div className="w-12 h-12 rounded-full border-2 border-transparent border-t-[#ec1d24] border-b-[#ec1d24] animate-spin" />
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#0a0a0a] bg-linear-to-r from-[rgba(236,29,36,0.2)] to-[rgba(0,0,0,0.9)]">
			<div className="max-w-md w-full mx-auto">
				<div className="bg-[#1a1a1a] rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-8 mb-8 border-t-4 border-[#ec1d24]">
					{/* Logo */}
					<div className="text-center mb-4">
						<Image
							src="/images/MainLogo.svg"
							alt="MCU Redefined"
							width={120}
							height={60}
						/>
					</div>

					<div className="text-center mb-6">
						<h2 className="font-['BentonSansBold'] text-3xl font-extrabold text-white mb-2 uppercase tracking-wider [text-shadow:2px_2px_4px_rgba(0,0,0,0.5)] after:content-[''] after:block after:w-20 after:h-1 after:bg-[#ec1d24] after:mx-auto after:mt-3">
							Verify Your Email
						</h2>
						<p className="font-['BentonSansRegular'] text-sm text-white/70 mt-2 leading-relaxed">
							We&apos;ve sent a verification link to{" "}
							<span className="font-medium text-[#ec1d24]">{email}</span>
						</p>
					</div>

					<div className="mt-8">
						<div className="rounded-md bg-white/5 border border-white/10 p-4 mb-6">
							<p className="font-['BentonSansRegular'] text-sm text-white/80 mb-4">
								Please check your inbox and click on the verification link to
								complete your registration.
							</p>
							<p className="font-['BentonSansRegular'] text-sm text-white/80">
								If you don&apos;t see the email, check your spam folder.
							</p>
						</div>

						{validationError && (
							<div className="font-['BentonSansRegular'] text-sm text-red-400 mt-2 p-3 bg-red-500/10 rounded-md border border-red-500/30">
								{validationError}
							</div>
						)}

						<div className="flex gap-2.5">
							<button
								onClick={handleResendVerification}
								className="flex-3 flex justify-center py-3 px-5 bg-[#ec1d24] text-white border-none rounded-lg font-['BentonSansBold'] text-sm font-medium cursor-pointer shadow-md transition-all duration-300 hover:bg-[#d81921] hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-[3px] focus:ring-[rgba(236,29,36,0.5)]"
								type="button"
								disabled={!!validationError}
							>
								Resend Verification Email
							</button>

							<button
								onClick={handleRefreshCheck}
								className="flex-1 flex justify-center py-3 px-5 bg-[#ec1d24] text-white border-none rounded-lg font-['BentonSansBold'] text-sm font-medium cursor-pointer shadow-md transition-all duration-300 hover:bg-[#d81921] hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-[3px] focus:ring-[rgba(236,29,36,0.5)]"
								type="button"
							>
								Refresh
							</button>
						</div>

						{resendSuccess && (
							<div className="font-['BentonSansRegular'] text-sm text-emerald-500 p-3 bg-emerald-500/10 rounded-md border border-emerald-500/30 mt-4">
								Verification email has been resent. Please check your inbox.
							</div>
						)}

						{resendError && (
							<div className="font-['BentonSansRegular'] text-sm text-red-400 mt-2 p-3 bg-red-500/10 rounded-md border border-red-500/30">
								{resendError}
							</div>
						)}

						<Link
							href="/"
							className="block text-center mt-4 text-white/70 font-['BentonSansRegular'] text-sm no-underline transition-colors duration-200 hover:text-[#ec1d24]"
						>
							Back to home
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
