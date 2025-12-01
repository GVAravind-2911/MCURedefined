"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react";

interface UserProfileData {
	id?: string;
	userId?: string;
	name?: string;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
}

interface LikedContentOverview {
	blogs: { items: any[]; total: number };
	reviews: { items: any[]; total: number };
	projects: { items: any[]; total: number };
}

interface ProfileMetadata {
	blogs: { tags: string[]; authors: string[] };
	reviews: { tags: string[]; authors: string[] };
}

interface ProfileContextData {
	// Profile data
	userProfile: UserProfileData | null;
	profileUser: any;
	
	// Liked content overview
	likedContent: LikedContentOverview | null;
	metadata: ProfileMetadata | null;
	
	// Loading states
	isLoading: boolean;
	isUpdating: boolean;
	
	// Actions
	updateProfile: (data: Partial<UserProfileData>) => Promise<void>;
	refreshProfile: () => Promise<void>;
	refreshLikedContent: () => Promise<void>;
	
	// Error handling
	error: string | null;
	clearError: () => void;
}

const ProfileContext = createContext<ProfileContextData | null>(null);

interface ProfileProviderProps {
	children: ReactNode;
	session: any;
	initialData?: any;
}

export const ProfileProvider = ({ children, session, initialData }: ProfileProviderProps) => {
	const [userProfile, setUserProfile] = useState<UserProfileData | null>(
		initialData?.profile || null
	);
	const [profileUser, setProfileUser] = useState(initialData?.user || session?.user);
	const [likedContent, setLikedContent] = useState<LikedContentOverview | null>(
		initialData?.likedContent || null
	);
	const [metadata, setMetadata] = useState<ProfileMetadata | null>(
		initialData?.metadata || null
	);
	const [isLoading, setIsLoading] = useState(!initialData);
	const [isUpdating, setIsUpdating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const clearError = useCallback(() => setError(null), []);

	const fetchCompleteProfile = useCallback(async (includeContent = false) => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch(
				`/api/user/profile/complete?content=${includeContent}`
			);

			if (!response.ok) {
				throw new Error(`Failed to fetch profile: ${response.status}`);
			}

			const data = await response.json();
			
			setUserProfile(data.profile);
			setProfileUser(data.user);
			
			if (includeContent && data.likedContent) {
				setLikedContent(data.likedContent);
				setMetadata(data.metadata || null);
			}
		} catch (err) {
			console.error("Error fetching complete profile:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch profile");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const updateProfile = useCallback(async (data: Partial<UserProfileData>) => {
		try {
			setIsUpdating(true);
			setError(null);

			const response = await fetch("/api/user/profile", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to update profile");
			}

			// Optimistically update local state
			if (data.description !== undefined) {
				setUserProfile(prev => prev ? { ...prev, description: data.description } : null);
			}
			
			// Refresh profile data from server
			await fetchCompleteProfile(false);
		} catch (err) {
			console.error("Error updating profile:", err);
			setError(err instanceof Error ? err.message : "Failed to update profile");
			throw err; // Re-throw to allow component error handling
		} finally {
			setIsUpdating(false);
		}
	}, [fetchCompleteProfile]);

	const refreshProfile = useCallback(async () => {
		await fetchCompleteProfile(false);
	}, [fetchCompleteProfile]);

	const refreshLikedContent = useCallback(async () => {
		await fetchCompleteProfile(true);
	}, [fetchCompleteProfile]);

	// Initial load
	useEffect(() => {
		if (!userProfile && session?.user?.id) {
			fetchCompleteProfile(false);
		}
	}, [session?.user?.id, userProfile, fetchCompleteProfile]);

	// Memoize context value to prevent unnecessary re-renders
	const value = useMemo<ProfileContextData>(() => ({
		userProfile,
		profileUser,
		likedContent,
		metadata,
		isLoading,
		isUpdating,
		updateProfile,
		refreshProfile,
		refreshLikedContent,
		error,
		clearError,
	}), [
		userProfile,
		profileUser,
		likedContent,
		metadata,
		isLoading,
		isUpdating,
		updateProfile,
		refreshProfile,
		refreshLikedContent,
		error,
		clearError,
	]);

	return (
		<ProfileContext.Provider value={value}>
			{children}
		</ProfileContext.Provider>
	);
};

export const useProfile = () => {
	const context = useContext(ProfileContext);
	if (!context) {
		throw new Error("useProfile must be used within a ProfileProvider");
	}
	return context;
};
