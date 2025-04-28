"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import Image from "next/image";
import "@/styles/reset-password.css";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Extract token from URL on client-side
    const urlToken = new URLSearchParams(window.location.search).get("token");
    
    if (!urlToken) {
      setError("Missing reset token. Please request a new password reset link.");
      return;
    }
    
    setToken(urlToken);
    setIsTokenValid(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!token) {
      setError("Invalid or missing token. Please try again with a valid reset link.");
      return;
    }

    // Basic validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
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
      setError(err.message || "An error occurred while resetting your password");
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
                {error || "Missing or invalid reset token. Please request a new password reset link."}
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
                Your password has been successfully reset. You will be redirected to the login page.
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
                  <label htmlFor="password">New Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="password-field"
                    placeholder="Enter your new password"
                  />
                </div>
                
                <div className="form-item">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="password-field"
                    placeholder="Confirm your new password"
                  />
                </div>
              </div>
              
              {error && (
                <div className="reset-error">
                  {error}
                </div>
              )}
              
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