import { useState } from "react";
import { emailSchema } from "@/lib/auth/validation-schemas";
import { authClient } from "@/lib/auth/auth-client";
import { z } from "zod";

export default function ForgotPasswordForm({ onBack, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  async function handleForgotPassword(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString().trim();

    try {
      emailSchema.parse(email);
      
      const result = await authClient.forgetPassword({
        email: email,
        redirectTo: "/auth/reset-password",
      });

      if (result?.error) {
        throw new Error(result.error.message);
      }

      setEmailSent(true);
      onSuccess(email);
    } catch (error) {
      console.error("Reset password error:", error);
      setError(error instanceof z.ZodError 
        ? error.errors[0].message 
        : error instanceof Error 
          ? error.message 
          : "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fade-transition fade-in">
      <h2 className="forgot-title">Reset Your Password</h2>
      <p className="forgot-subtitle">
        Enter your email address and we'll send you a reset link.
      </p>
      
      <form onSubmit={handleForgotPassword} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
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
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
          className="back-button"
          type="button"
        >
          Back to Sign In
        </button>
      </form>
    </div>
  );
}
