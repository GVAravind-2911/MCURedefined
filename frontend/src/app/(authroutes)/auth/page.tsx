"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import SignInForm from "@/components/auth/signin/SignInForm";
import SignUpForm from "@/components/auth/signup/SignUpForm";
import ForgotPasswordForm from "@/components/auth/resetpassword/ForgotPasswordForm";
import ResetEmailSent from "@/components/auth/resetpassword/ResetEmailSent";

export default function Auth() {
	const router = useRouter();
	const [authMode, setAuthMode] = useState("signin"); // "signin", "signup", "forgot", "reset-sent"
	const [resetEmail, setResetEmail] = useState("");

	const handleSignUpClick = () => {
		setAuthMode("signup");
	};

	const handleSignInClick = () => {
		setAuthMode("signin");
	};

	const handleForgotClick = () => {
		setAuthMode("forgot");
	};

	const handleResetSuccess = (email) => {
		setResetEmail(email);
		setAuthMode("reset-sent");
	};

	const handleBackToSignIn = () => {
		setAuthMode("signin");
	};

	return (
		<AuthLayout>
			{authMode !== "signup" &&
				authMode !== "forgot" &&
				authMode !== "reset-sent" && (
					<div className="flex gap-4 mb-8 relative z-1">
						<button
							className={`flex-1 py-3 border border-solid rounded-md text-white text-base cursor-pointer transition-all duration-300 ${
								authMode === "signin"
									? "bg-[#ec1d24] border-[#ec1d24] shadow-[0_0_15px_rgba(236,29,36,0.4)]"
									: "bg-transparent border-[rgba(255,255,255,0.1)] hover:border-[#ec1d24] hover:shadow-[0_0_10px_rgba(236,29,36,0.2)]"
							}`}
							onClick={handleSignInClick}
							type="button"
						>
							Sign In
						</button>
						<button
							className={`flex-1 py-3 border border-solid rounded-md text-white text-base cursor-pointer transition-all duration-300 ${
								authMode === "signup"
									? "bg-[#ec1d24] border-[#ec1d24] shadow-[0_0_15px_rgba(236,29,36,0.4)]"
									: "bg-transparent border-[rgba(255,255,255,0.1)] hover:border-[#ec1d24] hover:shadow-[0_0_10px_rgba(236,29,36,0.2)]"
							}`}
							onClick={handleSignUpClick}
							type="button"
						>
							Sign Up
						</button>
					</div>
				)}

			{authMode === "signin" && (
				<SignInForm
					onSignUp={handleSignUpClick}
					onForgotPassword={handleForgotClick}
				/>
			)}

			{authMode === "signup" && <SignUpForm onCancel={handleBackToSignIn} />}

			{authMode === "forgot" && (
				<ForgotPasswordForm
					onBack={handleBackToSignIn}
					onSuccess={handleResetSuccess}
				/>
			)}

			{authMode === "reset-sent" && (
				<ResetEmailSent email={resetEmail} onBack={handleBackToSignIn} />
			)}
		</AuthLayout>
	);
}
