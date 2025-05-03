import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import ProfileClientWrapper from "@/components/profile/ProfileClientWrapper";
import "@/styles/profile.css";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage() {
    const session = await auth.api.getSession({ headers: await headers() });

    // Redirect to login if no session
    if (!session) {
        redirect("/login");
    }

    return (
        <div className="profile-page">
            <div className="profile-hero">
                <div className="profile-hero-overlay" />
                <div className="hero-content">
                    <h1 className="hero-title">My Profile</h1>
                    <p className="hero-description">
                        View your profile information and manage your liked content
                    </p>
                </div>
            </div>

            <ProfileClientWrapper session={session} />
        </div>
    );
}