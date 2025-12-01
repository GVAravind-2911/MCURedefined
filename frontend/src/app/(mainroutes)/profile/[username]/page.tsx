"use server";

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import axios from "axios";
import "@/styles/profile.css";
import { getBackendUrl } from "@/lib/config/backend";
import UnifiedProfileClient from "@/components/profile/UnifiedProfileClient";
import type { Session } from 'better-auth/types';

interface PageProps {
	params: Promise<{
		username: string;
	}>;
}

interface ContentItem {
	id: number;
	title: string;
	thumbnail_path: { link: string };
	created_at: string;
	description?: string;
}

async function getUserByUsername(username: string) {
	const [foundUser] = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			username: user.username,
			displayUsername: user.displayUsername,
			image: user.image,
			createdAt: user.createdAt,
			role: user.role,
		})
		.from(user)
		.where(eq(user.username, username.toLowerCase()))
		.limit(1);

	return foundUser || null;
}

async function getUserBlogs(authorId: string): Promise<ContentItem[]> {
	try {
		const response = await axios.get(getBackendUrl("blogs/search"), {
			params: { author_id: authorId, limit: 20 },
			timeout: 5000,
		});
		return response.data?.blogs || [];
	} catch {
		return [];
	}
}

async function getUserReviews(authorId: string): Promise<ContentItem[]> {
	try {
		const response = await axios.get(getBackendUrl("reviews/search"), {
			params: { author_id: authorId, limit: 20 },
			timeout: 5000,
		});
		return response.data?.reviews || [];
	} catch {
		return [];
	}
}

export default async function ProfilePage({ params }: PageProps) {
	const { username } = await params;
	const profileUser = await getUserByUsername(username);

	if (!profileUser) {
		notFound();
	}

	// Check if current user is viewing their own profile
	const headersList = await headers();
	let currentSession: any = null;
	let activeSessions: Session[] = [];
	let isOwnProfile = false;

	try {
		currentSession = await auth.api.getSession({ headers: headersList });
		if (currentSession?.user?.id === profileUser.id) {
			isOwnProfile = true;
			
			// Fetch active sessions for own profile
			try {
				const sessionsResponse = await auth.api.listSessions({
					headers: headersList
				});
				activeSessions = sessionsResponse || [];
			} catch {
				// Continue without sessions
			}
		}
	} catch {
		// Not logged in, just show public profile
	}

	// Fetch published content
	const [blogs, reviews] = await Promise.all([
		getUserBlogs(profileUser.id),
		getUserReviews(profileUser.id),
	]);

	return (
		<div className="profile-page">
			<UnifiedProfileClient
				profileUser={{
					id: profileUser.id,
					name: profileUser.name,
					email: profileUser.email,
					username: profileUser.username,
					displayUsername: profileUser.displayUsername,
					image: profileUser.image,
					createdAt: profileUser.createdAt.toISOString(),
					role: profileUser.role,
				}}
				blogs={blogs}
				reviews={reviews}
				isOwnProfile={isOwnProfile}
				session={currentSession}
				activeSessions={activeSessions}
			/>
		</div>
	);
}
