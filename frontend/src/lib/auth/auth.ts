import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession } from "better-auth/plugins";;
import { db } from "@/db"; // your drizzle instance
import { account, session, user, verification } from "@/db/schema";	
import { getUserById } from "@/db/user";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "mysql", "sqlite"
        schema:{
            user,
            account,
            session,
            verification
        }
	}),
	emailAndPassword: {
		enabled: true,
		verifyEmail: true,
		resetPassword: true,
		verifyEmailTemplate: "verify-email",
		resetPasswordTemplate: "reset-password",
	},
	plugins: [
		customSession(async ({user,session}) => {
			const userType = (await getUserById(user.id)).type;
			return {
				user:{
					...user,
					accountType:userType
				},
				session
			}
		})
	]
});
