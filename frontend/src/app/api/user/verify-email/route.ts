import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
    try{
        const session = (await auth.api.getSession({headers: await headers()}));
        if (!session || !session.user) {
            return new Response("Unauthorized", { status: 401 });
        }

        const { email } = session.user;

        // Send verification email
        await auth.api.sendVerificationEmail({
            body:{
                email,
                callbackURL: `${req.url}`,
            }
        });

        return new Response("Verification email sent", { status: 200 });
    }
    catch (error) {
        console.error("Error in verify-email route:", error);
        return new Response(error.message, { status: error.status });
    }
}