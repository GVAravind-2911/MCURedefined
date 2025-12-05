"use client";

import React from "react";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/dateUtils";

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

interface TopicPostProps {
	topic: ForumTopic;
	currentUserId?: string;
	isEditing: boolean;
	editTitle: string;
	editContent: string;
	editError: string;
	isSaving: boolean;
	isDeleting: boolean;
	onEditTitleChange: (value: string) => void;
	onEditContentChange: (value: string) => void;
	onSaveEdit: () => void;
	onCancelEdit: () => void;
	onEditClick: () => void;
	onDeleteClick: () => void;
	onLikeToggle: () => void;
	onShowEditHistory: () => void;
}

export function isTopicDeleted(topic: ForumTopic): boolean {
	return topic.deleted || topic.title === "[DELETED]" || topic.content.includes("[This topic has been deleted");
}

function getUserInitials(username: string): string {
	return username
		? username
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "?";
}

export default function TopicPost({
	topic,
	currentUserId,
	isEditing,
	editTitle,
	editContent,
	editError,
	isSaving,
	isDeleting,
	onEditTitleChange,
	onEditContentChange,
	onSaveEdit,
	onCancelEdit,
	onEditClick,
	onDeleteClick,
	onLikeToggle,
	onShowEditHistory,
}: TopicPostProps): React.ReactElement {
	const isDeleted = isTopicDeleted(topic);
	const isAuthor = currentUserId === topic.userId;

	return (
		<div className={`bg-[rgba(40,40,40,0.3)] border rounded-lg mb-8 overflow-hidden backdrop-blur-[10px] relative before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:bg-[linear-gradient(90deg,transparent,#ec1d24,transparent)] ${
			isDeleted 
				? 'bg-[rgba(220,53,69,0.05)] border-[rgba(220,53,69,0.2)] before:bg-[#dc3545]' 
				: 'border-white/10'
		}`}>
			<div className="p-8">
				{isDeleted ? (
					<DeletedTopicView topic={topic} />
				) : (
					<ActiveTopicView
						topic={topic}
						isAuthor={isAuthor}
						isEditing={isEditing}
						editTitle={editTitle}
						editContent={editContent}
						editError={editError}
						isSaving={isSaving}
						isDeleting={isDeleting}
						onEditTitleChange={onEditTitleChange}
						onEditContentChange={onEditContentChange}
						onSaveEdit={onSaveEdit}
						onCancelEdit={onCancelEdit}
						onEditClick={onEditClick}
						onDeleteClick={onDeleteClick}
						onLikeToggle={onLikeToggle}
						onShowEditHistory={onShowEditHistory}
						hasSession={!!currentUserId}
					/>
				)}
			</div>
		</div>
	);
}

function DeletedTopicView({ topic }: { topic: ForumTopic }): React.ReactElement {
	return (
		<>
			<div className="flex items-center gap-3 mb-4 text-[0.95rem] text-white/80">
				<div className="flex items-center gap-2">
					<div className="w-6 h-6 rounded-full bg-[#666] text-white flex items-center justify-center text-[0.8rem] font-[BentonSansBold]">
						❌
					</div>
					<span className="font-[BentonSansBold] text-[#666]">[deleted]</span>
				</div>
				<span>•</span>
				<span>{formatRelativeTime(topic.createdAt)}</span>
				<div className="flex items-center gap-2">
					<span className="text-[0.8rem] py-1 px-2 rounded bg-[rgba(220,53,69,0.2)] text-[#dc3545]">
						🗑️ Deleted
					</span>
				</div>
			</div>
			<h1 className="font-[BentonSansBold] text-[1.8rem] text-[#666] mb-6 leading-tight flex items-center gap-2">
				[Deleted Topic]
			</h1>
			<div className="text-[#666] italic bg-white/5 p-4 rounded-lg border border-white/10">
				This topic has been deleted and is no longer available.
			</div>
		</>
	);
}

interface ActiveTopicViewProps {
	topic: ForumTopic;
	isAuthor: boolean;
	isEditing: boolean;
	editTitle: string;
	editContent: string;
	editError: string;
	isSaving: boolean;
	isDeleting: boolean;
	hasSession: boolean;
	onEditTitleChange: (value: string) => void;
	onEditContentChange: (value: string) => void;
	onSaveEdit: () => void;
	onCancelEdit: () => void;
	onEditClick: () => void;
	onDeleteClick: () => void;
	onLikeToggle: () => void;
	onShowEditHistory: () => void;
}

function ActiveTopicView({
	topic,
	isAuthor,
	isEditing,
	editTitle,
	editContent,
	editError,
	isSaving,
	isDeleting,
	hasSession,
	onEditTitleChange,
	onEditContentChange,
	onSaveEdit,
	onCancelEdit,
	onEditClick,
	onDeleteClick,
	onLikeToggle,
	onShowEditHistory,
}: ActiveTopicViewProps): React.ReactElement {
	return (
		<>
			{/* Topic header with user info and timestamps */}
			<TopicHeader topic={topic} />

			{/* Topic title */}
			{isEditing ? (
				<input
					type="text"
					className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white font-[BentonSansBold] text-2xl mb-4 transition-all duration-200 focus:outline-none focus:border-[#ec1d24]"
					value={editTitle}
					onChange={(e) => onEditTitleChange(e.target.value)}
					placeholder="Topic title"
					maxLength={200}
				/>
			) : (
				<h1 className="font-[BentonSansBold] text-[1.8rem] text-white mb-6 leading-tight flex items-center gap-2">
					{topic.title}
				</h1>
			)}

			{/* Topic content */}
			{isEditing ? (
				<TopicEditForm
					editContent={editContent}
					editError={editError}
					isSaving={isSaving}
					editCount={topic.editCount || 0}
					onEditContentChange={onEditContentChange}
					onSaveEdit={onSaveEdit}
					onCancelEdit={onCancelEdit}
				/>
			) : (
				<div className="text-white/90 leading-relaxed mb-4 whitespace-pre-wrap">
					{topic.content}
				</div>
			)}

			{/* Topic Image (if present) */}
			{topic.imageUrl && !isEditing && (
				<div className="mt-4 mb-4 flex justify-center">
					<Image
						src={topic.imageUrl}
						alt="Topic image"
						width={800}
						height={600}
						className="max-w-full h-auto rounded-lg mt-4 border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
					/>
				</div>
			)}

			{/* Image will be removed warning when editing */}
			{isEditing && topic.imageUrl && (
				<div className="bg-[rgba(255,165,0,0.15)] border border-[rgba(255,165,0,0.3)] text-[#ffa500] py-3 px-4 rounded-lg my-4 text-sm">
					⚠️ The attached image will be removed when you save your edit. Images cannot be edited.
				</div>
			)}

			{/* Topic footer with voting and actions */}
			<TopicFooter
				topic={topic}
				isAuthor={isAuthor}
				isEditing={isEditing}
				isDeleting={isDeleting}
				hasSession={hasSession}
				onLikeToggle={onLikeToggle}
				onShowEditHistory={onShowEditHistory}
				onEditClick={onEditClick}
				onDeleteClick={onDeleteClick}
			/>
		</>
	);
}

function TopicHeader({ topic }: { topic: ForumTopic }): React.ReactElement {
	return (
		<div className="flex items-center gap-3 mb-4 text-[0.95rem] text-white/80">
			<div className="flex items-center gap-2 flex-1">
				{topic.userImage ? (
					<Image
						src={topic.userImage}
						alt={topic.username}
						width={24}
						height={24}
						className="w-6 h-6 rounded-full"
					/>
				) : (
					<div className="w-6 h-6 rounded-full bg-[linear-gradient(135deg,#ec1d24,#ff7f50)] flex items-center justify-center text-white font-[BentonSansBold] text-[0.8rem] border-2 border-[rgba(236,29,36,0.3)]">
						{getUserInitials(topic.username)}
					</div>
				)}
				<span className="font-[BentonSansBold] text-[#ec1d24] text-[0.9rem]">{topic.username}</span>
			</div>
			<span>{formatRelativeTime(topic.createdAt)}</span>
			{topic.updatedAt !== topic.createdAt && (
				<>
					<span>•</span>
					<span>edited {formatRelativeTime(topic.updatedAt)}</span>
				</>
			)}
			{/* Status badges */}
			<div className="flex items-center gap-2">
				{topic.pinned && (
					<span className="text-[0.8rem] py-1 px-2 rounded bg-[rgba(255,193,7,0.2)] text-[#ffc107]">📌 Pinned</span>
				)}
				{topic.locked && (
					<span className="text-[0.8rem] py-1 px-2 rounded bg-[rgba(220,53,69,0.2)] text-[#dc3545]">🔒 Locked</span>
				)}
			</div>
		</div>
	);
}

interface TopicEditFormProps {
	editContent: string;
	editError: string;
	isSaving: boolean;
	editCount: number;
	onEditContentChange: (value: string) => void;
	onSaveEdit: () => void;
	onCancelEdit: () => void;
}

function TopicEditForm({
	editContent,
	editError,
	isSaving,
	editCount,
	onEditContentChange,
	onSaveEdit,
	onCancelEdit,
}: TopicEditFormProps): React.ReactElement {
	return (
		<div className="mb-4">
			<textarea
				className="w-full min-h-[150px] bg-white/5 border border-white/20 rounded-lg p-4 text-white/90 font-[BentonSansRegular] text-base leading-relaxed resize-y transition-all duration-200 focus:outline-none focus:border-[#ec1d24]"
				value={editContent}
				onChange={(e) => onEditContentChange(e.target.value)}
				placeholder="Topic content"
				maxLength={10000}
			/>
			{editError && (
				<div className="text-[#dc3545] text-sm mt-2 p-2 bg-[rgba(220,53,69,0.1)] rounded">{editError}</div>
			)}
			<div className="flex items-center gap-3 mt-4">
				<button
					className="bg-[linear-gradient(135deg,#ec1d24,#d01c22)] border-none text-white py-2 px-6 rounded-md cursor-pointer font-[BentonSansRegular] text-sm transition-all duration-200 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_4px_12px_rgba(236,29,36,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
					onClick={onSaveEdit}
					disabled={isSaving}
				>
					{isSaving ? "Saving..." : "Save Changes"}
				</button>
				<button
					className="bg-white/10 border border-white/20 text-white/80 py-2 px-6 rounded-md cursor-pointer font-[BentonSansRegular] text-sm transition-all duration-200 hover:not-disabled:bg-white/15 hover:not-disabled:border-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={onCancelEdit}
					disabled={isSaving}
				>
					Cancel
				</button>
				<span className="text-white/50 text-sm ml-auto">
					{5 - editCount} edits remaining
				</span>
			</div>
		</div>
	);
}

interface TopicFooterProps {
	topic: ForumTopic;
	isAuthor: boolean;
	isEditing: boolean;
	isDeleting: boolean;
	hasSession: boolean;
	onLikeToggle: () => void;
	onShowEditHistory: () => void;
	onEditClick: () => void;
	onDeleteClick: () => void;
}

function TopicFooter({
	topic,
	isAuthor,
	isEditing,
	isDeleting,
	hasSession,
	onLikeToggle,
	onShowEditHistory,
	onEditClick,
	onDeleteClick,
}: TopicFooterProps): React.ReactElement {
	const isDeleted = isTopicDeleted(topic);

	return (
		<div className="flex items-center gap-4 pt-3 border-t border-white/10 text-sm">
			<div className="flex items-center gap-2">
				<button
					className={`bg-[rgba(236,29,36,0.05)] border border-[rgba(236,29,36,0.3)] text-white/80 py-2 px-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out flex items-center gap-2 text-[0.95rem] font-medium hover:bg-[rgba(236,29,36,0.15)] hover:border-[#ec1d24] hover:text-white hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
						topic.userHasLiked 
							? 'bg-[linear-gradient(135deg,#ec1d24,#d01c22)] border-[#ec1d24] text-white shadow-[0_4px_15px_rgba(236,29,36,0.3)]' 
							: ''
					}`}
					onClick={onLikeToggle}
					disabled={!hasSession || isDeleted}
					title={
						isDeleted 
							? "Cannot like deleted topics"
							: hasSession 
							? "Like this topic" 
							: "Sign in to like"
					}
				>
					<span>{topic.userHasLiked ? "❤️" : "🤍"}</span>
					<span>{topic.likeCount}</span>
				</button>
				{/* Edit history button */}
				{(topic.editCount || 0) > 0 && (
					<button
						className="bg-none border border-white/20 text-white/60 py-1.5 px-3 rounded-md cursor-pointer text-sm transition-all duration-200 flex items-center gap-1 hover:bg-white/5 hover:border-white/30 hover:text-white/80"
						onClick={onShowEditHistory}
						title="View edit history"
					>
						📝 {topic.editCount} edit{(topic.editCount || 0) > 1 ? 's' : ''}
					</button>
				)}
			</div>
			
			{/* Topic actions for author */}
			{isAuthor && !isDeleted && !isEditing && (
				<div className="flex items-center gap-2 ml-auto">
					{topic.canEdit && (
						<button
							className="bg-[rgba(236,29,36,0.1)] border border-[rgba(236,29,36,0.4)] text-[#ec1d24] py-1.5 px-4 rounded-md cursor-pointer transition-all duration-200 flex items-center gap-1.5 text-sm font-[BentonSansRegular] hover:bg-[rgba(236,29,36,0.2)] hover:border-[#ec1d24] hover:text-white hover:-translate-y-0.5"
							onClick={onEditClick}
							title="Edit this topic"
						>
							✏️ Edit
						</button>
					)}
					<button
						className="bg-[rgba(220,53,69,0.1)] border border-[rgba(220,53,69,0.4)] text-[#dc3545] py-1.5 px-4 rounded-md cursor-pointer transition-all duration-200 flex items-center gap-1.5 text-sm font-[BentonSansRegular] hover:not-disabled:bg-[rgba(220,53,69,0.2)] hover:not-disabled:border-[#dc3545] hover:not-disabled:text-white hover:not-disabled:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
						onClick={onDeleteClick}
						disabled={isDeleting}
						title="Delete this topic"
					>
						{isDeleting ? "🔄" : "🗑️"} {isDeleting ? "Deleting..." : "Delete"}
					</button>
				</div>
			)}
		</div>
	);
}
