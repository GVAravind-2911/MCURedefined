import { auth } from "@/lib/auth/auth";
import axios from "axios";
import { headers } from "next/headers";
import { getBackendUrl } from "@/lib/config/backend";

export async function GET(
	req: Request,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Authenticate user and check admin privileges
		const session = await auth.api.getSession({ headers: await headers() });
		if (!session) {
			return new Response(JSON.stringify({ error: "Unauthorized" }), {
				status: 401,
			});
		}

		// Only admins can view other users' stats
		if (session.user.role !== "admin") {
			return new Response(JSON.stringify({ error: "Forbidden" }), {
				status: 403,
			});
		}

		const { id } = await params;

		// Fetch user stats from backend
		try {
			// Get liked content counts
			const [blogsResp, reviewsResp, timelineResp] = await Promise.all([
				axios.post(getBackendUrl("user/liked"), {
					user_id: id,
					type: "blogs",
					page: 1,
					limit: 1,
				}).catch(() => ({ data: { total: 0 } })),
				axios.post(getBackendUrl("user/liked"), {
					user_id: id,
					type: "reviews",
					page: 1,
					limit: 1,
				}).catch(() => ({ data: { total: 0 } })),
				axios.post(getBackendUrl("user/liked"), {
					user_id: id,
					type: "timeline",
					page: 1,
					limit: 1,
				}).catch(() => ({ data: { total: 0 } })),
			]);

			// Get user's content counts (blogs written, reviews written, etc.)
			const [userBlogsResp, userReviewsResp] = await Promise.all([
				axios.get(getBackendUrl(`blogs/user/${id}?page=1&limit=1`)).catch(() => ({ data: { total: 0 } })),
				axios.get(getBackendUrl(`reviews/user/${id}?page=1&limit=1`)).catch(() => ({ data: { total: 0 } })),
			]);

			const stats = {
				likedBlogs: blogsResp.data?.total || 0,
				likedReviews: reviewsResp.data?.total || 0,
				likedTimeline: timelineResp.data?.total || 0,
				blogsWritten: userBlogsResp.data?.total || 0,
				reviewsWritten: userReviewsResp.data?.total || 0,
			};

			return new Response(JSON.stringify(stats), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (backendError) {
			console.error("Backend error fetching user stats:", backendError);
			// Return empty stats if backend fails
			return new Response(JSON.stringify({
				likedBlogs: 0,
				likedReviews: 0,
				likedTimeline: 0,
				blogsWritten: 0,
				reviewsWritten: 0,
			}), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}
	} catch (error) {
		console.error("Error fetching user stats:", error);
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
		});
	}
}
