"use client";

import React from "react";
import dynamic from "next/dynamic";
import { isTopicDeleted } from "./TopicPost";

const RedditCommentSection = dynamic(
	() => import("@/components/forum/RedditCommentSection"),
	{ loading: () => <div className="py-8 text-center text-white/60">Loading comments...</div> }
);

interface ForumTopic {
	id: string;
	title: string;
	content: string;
	userId: string;
	username: string;
	userImage: string | null;
	createdAt: string;
	updatedAt: string;
	deleted: boolean;
	pinned: boolean;
	locked: boolean;
	likeCount: number;
	userHasLiked: boolean;
	editCount?: number;
	canEdit?: boolean;
	imageUrl?: string | null;
	imageKey?: string | null;
}

interface TopicCommentsProps {
	topic: ForumTopic;
	topicId: string;
}

export default function TopicComments({ topic, topicId }: TopicCommentsProps): React.ReactElement {
	const isDeleted = isTopicDeleted(topic);

	return (
		<div className="mt-4">
			{topic.locked && !isDeleted ? (
				<div className="text-center p-8 bg-[rgba(40,40,40,0.3)] border border-white/10 rounded-lg mt-4">
					<h3 className="text-white/60 mb-2">🔒 This topic is locked</h3>
					<p className="text-white/40">Comments have been disabled for this topic.</p>
				</div>
			) : (
				<>
					{isDeleted && (
						<div className="py-3 px-4 bg-[rgba(220,53,69,0.1)] rounded-lg mb-4 text-[#dc3545] text-sm">
							⚠️ This topic has been deleted. You can still view existing comments but cannot add new ones.
						</div>
					)}
					<RedditCommentSection 
						contentId={topicId} 
						contentType="forum" 
						disabled={isDeleted}
					/>
				</>
			)}
		</div>
	);
}
