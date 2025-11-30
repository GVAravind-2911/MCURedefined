import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import ProfileClientWrapper from "@/components/profile/ProfileClientWrapper";
import "@/styles/profile.css";
import { headers } from "next/headers";
import SessionManageTab from "@/components/profile/SessionManageTab";
import type { Session } from 'better-auth/types';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage() {
    try {
        const headersList = await headers();
        const session = await auth.api.getSession({ 
            headers: headersList 
        });

        if (!session) {
            redirect("/login");
        }

        // ✅ Fetch active sessions on server side
        let activeSessions: Session[] = [];
        try {
            const sessionsResponse = await auth.api.listSessions({
                headers: headersList
            });
            
            // Handle different response formats from better-auth
            activeSessions = sessionsResponse || sessionsResponse || [];
            // console.log("Active Sessions:", activeSessions);
        } catch (sessionError) {
            console.error("Error fetching sessions:", sessionError);
            // Continue without sessions rather than failing the entire page
        }

        return (
            <div className="profile-page">
                <ProfileClientWrapper 
                    session={session} 
                    activeSessions={activeSessions}
                    currentSessionId={session.session.id}
                />
            </div>
        );
    } catch (error) {
        console.error("Error in ProfilePage:", error);
        redirect("/login");
    }
}