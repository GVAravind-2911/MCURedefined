"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import Image from "next/image";
import "@/styles/verify-email.css";
import Link from "next/link";
import axios from "axios";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
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

        // User is logged in but not verified
        setEmail(session.data.user.email);
        setIsLoading(false);
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
      const session = await authClient.getSession();
      setResendError("");
      const resp = await authClient.sendVerificationEmail({email:session.data.user.email,callbackURL:"/"});
      setResendSuccess(true);
    } catch (error) {
      console.error("Failed to resend verification email:", error);
      setResendError(error.response?.data || "Failed to resend verification email. Please try again.");
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
          {/* You can add a logo here */}
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
              We've sent a verification link to <span className="email-highlight">{email}</span>
            </p>
          </div>

          <div className="verify-content">
            <div className="verify-info-box">
              <p className="verify-info-text">
                Please check your inbox and click on the verification link to complete your registration.
              </p>
              <p className="verify-info-text">
                If you don't see the email, check your spam folder.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleResendVerification}
                className="resend-button"
                type="button"
                style={{ flex: '3' }}
              >
                Resend Verification Email
              </button>
              
              <button
                onClick={handleRefreshCheck}
                className="resend-button"
                type="button"
                style={{ flex: '1' }}
              >
                Refresh
              </button>
            </div>

            {resendSuccess && (
              <div className="success-message" style={{ marginTop: '16px' }}>
                Verification email has been resent. Please check your inbox.
              </div>
            )}

            {resendError && (
              <div className="error-message">
                {resendError}
              </div>
            )}
            
            <Link href="/" className="back-link">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}