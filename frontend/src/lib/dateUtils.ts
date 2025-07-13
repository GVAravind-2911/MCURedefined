import { formatDistanceToNow } from "date-fns";

/**
 * Formats a date string to show relative time (e.g., "2 hours ago")
 * Handles timezone issues and invalid dates gracefully
 */
export const formatRelativeTime = (dateString: string | Date): string => {
	try {
		if (!dateString) {
			return "Recently";
		}

		// Convert the input to a proper date
		let date: Date;
		
		// If it's already a Date object, use it directly
		if (dateString instanceof Date) {
			date = dateString;
		} else {
			// Parse as string
			date = new Date(dateString);
		}
		
		// Check if the date is valid
		if (isNaN(date.getTime())) {
			return "Recently";
		}
		
		const now = new Date();
		const diffInMilliseconds = date.getTime() - now.getTime();
		const diffInMinutes = diffInMilliseconds / (1000 * 60);
		
		// If the date is significantly in the future (more than 1 hour),
		// assume it's a timezone parsing issue and treat it as current time
		if (diffInMinutes > 60) {
			// This likely means the date was stored in one timezone but being interpreted in another
			// Assume it should be "recently" instead of showing a future time
			return "Recently";
		}
		
		// If it's slightly in the future (less than 5 minutes), it might be server clock skew
		if (diffInMinutes > 0 && diffInMinutes <= 5) {
			return "Just now";
		}
		
		// Use formatDistanceToNow for normal cases
		return formatDistanceToNow(date, { 
			addSuffix: true,
			includeSeconds: false
		});
	} catch (error) {
		console.error("Error formatting date:", error, dateString);
		return "Recently";
	}
};

/**
 * Formats a date to a readable string (e.g., "Jan 15, 2025 at 3:45 PM")
 */
export const formatFullDate = (dateString: string | Date): string => {
	try {
		const date = dateString instanceof Date ? dateString : new Date(dateString);
		if (isNaN(date.getTime())) {
			return "Invalid date";
		}
		
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
			hour12: true
		});
	} catch {
		return "Invalid date";
	}
};
