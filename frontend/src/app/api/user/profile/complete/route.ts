import { auth } from "@/lib/auth/auth";
import { db } from "@/db";
import { user, userProfile } from "@/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import axios from "axios";

/**
 * Optimized endpoint that fetches complete user profile data including:
 * - User profile information
 * - Liked content counts
 * - Quick preview of each content type
 * This reduces multiple API calls to a single request
 */
export async function GET(req: Request) {
	try {
		const session = await auth.api.getSession({ headers: await headers() });

		if (!session?.user?.id) {
			return new Response("Unauthorized", { status: 401 });
		}

		const userId = session.user.id;
		const url = new URL(req.url);
		const includeContent = url.searchParams.get("content") === "true";

		// Fetch user profile data from database
		const profile = await db
			.select()
			.from(userProfile)
			.where(eq(userProfile.userId, userId))
			.limit(1);

		const profileData = profile.length > 0 ? profile[0] : null;

		// Prepare response data
		const responseData: any = {
			profile: profileData,
			user: session.user,
		};

        console.log("Profile Data:", profileData);

		// If requested, fetch liked content overview
		if (includeContent) {
			try {
				// Fetch counts and preview data for all content types in parallel
				const [blogsData, reviewsData, projectsData] = await Promise.all([
					axios.post("http://localhost:4000/user/liked", {
						user_id: userId,
						type: "blogs",
						page: 1,
						limit: 3, // Small preview
					}).catch(() => ({ data: { blogs: [], total: 0 } })),
					
					axios.post("http://localhost:4000/user/liked", {
						user_id: userId,
						type: "reviews",
						page: 1,
						limit: 3, // Small preview
					}).catch(() => ({ data: { reviews: [], total: 0 } })),
					
					axios.post("http://localhost:4000/user/liked", {
						user_id: userId,
						type: "projects",
						page: 1,
						limit: 3, // Small preview
					}).catch(() => ({ data: { projects: [], total: 0 } })),
				]);

                console.log("Blogs Data:", blogsData.data);
                console.log("Reviews Data:", reviewsData.data);

				responseData.likedContent = {
					blogs: {
						items: blogsData.data.blogs || [],
						total: blogsData.data.total || 0,
					},
					reviews: {
						items: reviewsData.data.reviews || [],
						total: reviewsData.data.total || 0,
					},
					projects: {
						items: projectsData.data.projects || [],
						total: projectsData.data.total || 0,
					},
				};

				// Fetch tags and authors for blogs and reviews in parallel if there's content
				if (blogsData.data.total > 0 || reviewsData.data.total > 0) {
					const [blogTags, blogAuthors, reviewTags, reviewAuthors] = await Promise.all([
						blogsData.data.total > 0 ? 
							axios.post("http://localhost:4000/user/liked/tags", { user_id: userId, type: "blogs" })
								.catch(() => ({ data: { tags: [] } })) : { data: { tags: [] } },
						
						blogsData.data.total > 0 ? 
							axios.post("http://localhost:4000/user/liked/authors", { user_id: userId, type: "blogs" })
								.catch(() => ({ data: { authors: [] } })) : { data: { authors: [] } },
						
						reviewsData.data.total > 0 ? 
							axios.post("http://localhost:4000/user/liked/tags", { user_id: userId, type: "reviews" })
								.catch(() => ({ data: { tags: [] } })) : { data: { tags: [] } },
						
						reviewsData.data.total > 0 ? 
							axios.post("http://localhost:4000/user/liked/authors", { user_id: userId, type: "reviews" })
								.catch(() => ({ data: { authors: [] } })) : { data: { authors: [] } },
					]);

					responseData.metadata = {
						blogs: {
							tags: blogTags.data.tags || [],
							authors: blogAuthors.data.authors || [],
						},
						reviews: {
							tags: reviewTags.data.tags || [],
							authors: reviewAuthors.data.authors || [],
						},
					};
				}
			} catch (error) {
				console.error("Error fetching liked content overview:", error);
				// Don't fail the entire request if liked content fails
				responseData.likedContent = {
					blogs: { items: [], total: 0 },
					reviews: { items: [], total: 0 },
					projects: { items: [], total: 0 },
				};
			}
		}

		return new Response(JSON.stringify(responseData), {
			status: 200,
			headers: { 
				"Content-Type": "application/json"
			},
		});
	} catch (error) {
		console.error("Error fetching complete profile:", error);
		return new Response(
			JSON.stringify({ error: "Failed to fetch profile data" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
