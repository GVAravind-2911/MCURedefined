"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import SignInForm from "@/components/auth/signin/SignInForm";
import SignUpForm from "@/components/auth/signup/SignUpForm";
import ForgotPasswordForm from "@/components/auth/resetpassword/ForgotPasswordForm";
import ResetEmailSent from "@/components/auth/resetpassword/ResetEmailSent";
import "@/styles/auth.css";

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
					<div className="auth-toggle">
						<button
							className={authMode === "signin" ? "active" : ""}
							onClick={handleSignInClick}
							type="button"
						>
							Sign In
						</button>
						<button
							className={authMode === "signup" ? "active" : ""}
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
