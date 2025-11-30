import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";
import { db } from "@/db";
import { account, session, user, verification } from "@/db/schema";
import { getUserById } from "@/db/user";
import { username, admin } from "better-auth/plugins";
import transporter from "../mail/test";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: {
			user,
			account,
			session,
			verification,
		},
	}),
	emailAndPassword: {
		enabled: true,
		verifyEmail: true,
		resetPassword: true,
		verifyEmailTemplate: "verify-email",
		resetPasswordTemplate: "reset-password",
		// Redirect to verification page after signup
		signupRedirectUrl: "/auth/verify-email",
		// Redirect to homepage after password reset
		sendResetPassword: async ({ user, url, token }, request) => {
			const emailContent = {
				from: '"MCU Redefined" <noreply@mcuredefined.com>',
				to: user.email,
				subject: "Reset Your MCU Redefined Password",
				text: `Hello ${user.name},\n\nTo reset your password, please click the link below:\n${url}\n\nIf you didn't request this, please ignore this email.`,
				html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                        <h2 style="color: #d32f2f;">Reset Your MCU Redefined Password</h2>
                        <p>Hello ${user.name},</p>
                        <p>We received a request to reset your password. If this was you, please click the button below to create a new password:</p>
                        <p style="margin: 20px 0;">
                            <a href="${url}" style="background-color: #d32f2f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Reset Password
                            </a>
                        </p>
                        <p>If you didn't request this password reset, you can safely ignore this email. Your account will remain secure.</p>
                        <p>This password reset link will expire in 24 hours.</p>
                        <p style="font-size: 12px; color: #666; margin-top: 30px;">This is an automated message, please do not reply to this email.</p>
                    </div>
                `,
			};

			// Send the email
			try {
				const info = await transporter.sendMail(emailContent);
				console.log("Password reset email sent: %s", info.messageId);
			} catch (error) {
				console.error("Error sending password reset email:", error);
			}
		},
	},
	plugins: [username(), admin()],
	emailVerification: {
		sendVerificationEmail: async ({ user, url, token }) => {
			// Create email content
			const emailContent = {
				from: '"MCU Redefined" <noreply@mcuredefined.com>',
				to: user.email,
				subject: "Verify Your MCU Redefined Account",
				text: `Welcome to MCU Redefined! Please verify your email address by clicking this link: ${url}`,
				html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                        <h2 style="color: #d32f2f;">Welcome to MCU Redefined!</h2>
                        <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
                        <p style="margin: 20px 0;">
                            <a href="${url}" style="background-color: #d32f2f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Verify Email Address
                            </a>
                        </p>
                        <p>If you didn't create an account, you can safely ignore this email.</p>
                        <p>This verification link will expire in 24 hours.</p>
                    </div>
                `,
			};

			// Send the email
			try {
				const info = await transporter.sendMail(emailContent);
				console.log("Verification email sent: %s", info.messageId);
			} catch (error) {
				console.error("Error sending verification email:", error);
			}
		},
		sendOnSignUp: true,
		autoSignInAfterVerification: true,
		redirectAfterVerification: "/",
	},

	advanced: {
		ipAddress: {
			ipAddressHeaders: ["x-forwarded-for", "x-client-ip"],
			ipAddressHeaderFallback: "x-real-ip",
			disableIpTracking: false,
		},
	},
	// rateLimit: {
	//     customRules: {
	//         '/api/user/verify-email' : {
	//             window: 86400,
	//             max: 3
	//         }
	//     }
	// }
});
