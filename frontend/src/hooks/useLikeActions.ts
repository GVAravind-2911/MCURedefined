/**
 * Hook for managing like/unlike actions
 */

import { useState } from 'react';

interface UseLikeActionsOptions {
	onSuccess?: (isLiked: boolean) => void;
	onError?: (error: string) => void;
}

export const useLikeActions = (options: UseLikeActionsOptions = {}) => {
	const [isLoading, setIsLoading] = useState(false);

	const toggleLike = async (
		contentType: 'blog' | 'review' | 'project',
		contentId: string,
		currentlyLiked: boolean
	) => {
		if (isLoading) return;

		setIsLoading(true);
		try {
			const endpoint = contentType === 'blog' ? '/api/blogs/like' : 
							contentType === 'review' ? '/api/reviews/like' : 
							'/api/projects/like';

			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ 
					[contentType === 'blog' ? 'blogId' : 
					 contentType === 'review' ? 'reviewId' : 'projectId']: contentId 
				}),
			});

			if (!response.ok) {
				throw new Error(`Failed to ${currentlyLiked ? 'unlike' : 'like'} ${contentType}`);
			}

			const newLikeStatus = !currentlyLiked;
			
			options.onSuccess?.(newLikeStatus);
			
			return newLikeStatus;
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'An error occurred';
			options.onError?.(errorMessage);
			console.error(`Error toggling like for ${contentType}:`, error);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		toggleLike,
		isLoading,
	};
};
