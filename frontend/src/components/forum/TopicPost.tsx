"use client";

import React from "react";
import Image from "next/image";
import { formatRelativeTime } from "@/lib/dateUtils";
import {
	User,
	Calendar,
	Heart,
	Edit3,
	Trash2,
	History,
	Pin,
	Lock,
	X,
	Save,
	AlertTriangle,
} from "lucide-react";

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
	return (
		topic.deleted ||
		topic.title === "[DELETED]" ||
		topic.content.includes("[This topic has been deleted")
	);
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
		<div
			className={`bg-white/2 backdrop-blur-sm border rounded-2xl mb-8 overflow-hidden transition-all duration-300 ${
				isDeleted
					? "bg-[rgba(220,53,69,0.05)] border-[rgba(220,53,69,0.2)]"
					: "border-white/8"
			}`}
		>
			<div className="p-5 sm:p-6 md:p-8">
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

function DeletedTopicView({
	topic,
}: { topic: ForumTopic }): React.ReactElement {
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
		<div className="flex flex-wrap items-center gap-3 mb-4">
			{/* Author info */}
			<div className="flex items-center gap-2">
				{topic.userImage ? (
					<Image
						src={topic.userImage}
						alt={topic.username}
						width={32}
						height={32}
						className="w-8 h-8 rounded-full object-cover border border-[#ec1d24]/30"
					/>
				) : (
					<div className="w-8 h-8 rounded-full bg-[#ec1d24]/10 flex items-center justify-center">
						<User className="w-4 h-4 text-[#ec1d24]" />
					</div>
				)}
				<span className="font-[BentonSansBold] text-[#ec1d24] text-sm">
					{topic.username}
				</span>
			</div>

			<span className="hidden sm:block w-px h-4 bg-white/15" />

			{/* Date */}
			<div className="flex items-center gap-1.5 text-white/50">
				<Calendar className="w-3.5 h-3.5" />
				<span className="text-sm font-[BentonSansRegular]">
					{formatRelativeTime(topic.createdAt)}
				</span>
			</div>

			{topic.updatedAt !== topic.createdAt && (
				<>
					<span className="hidden sm:block w-px h-4 bg-white/15" />
					<div className="flex items-center gap-1.5 text-white/40">
						<Edit3 className="w-3.5 h-3.5" />
						<span className="text-xs font-[BentonSansRegular]">
							edited {formatRelativeTime(topic.updatedAt)}
						</span>
					</div>
				</>
			)}

			{/* Status badges */}
			<div className="flex items-center gap-2 ml-auto">
				{topic.pinned && (
					<span className="inline-flex items-center gap-1 bg-[#fbbf24]/10 text-[#fbbf24] text-xs py-1 px-2.5 rounded-full border border-[#fbbf24]/20 font-[BentonSansBold]">
						<Pin className="w-3 h-3" />
						Pinned
					</span>
				)}
				{topic.locked && (
					<span className="inline-flex items-center gap-1 bg-white/10 text-white/70 text-xs py-1 px-2.5 rounded-full border border-white/20 font-[BentonSansBold]">
						<Lock className="w-3 h-3" />
						Locked
					</span>
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
				className="w-full min-h-[150px] bg-linear-to-r from-white/5 to-white/2 border border-white/15 rounded-xl p-4 text-white/90 font-[BentonSansRegular] text-base leading-relaxed resize-y transition-all duration-300 focus:outline-none focus:border-[#ec1d24]/60 focus:ring-2 focus:ring-[#ec1d24]/25 focus:bg-white/8"
				value={editContent}
				onChange={(e) => onEditContentChange(e.target.value)}
				placeholder="Topic content"
				maxLength={10000}
			/>
			{editError && (
				<div className="flex items-center gap-2 text-[#dc3545] text-sm mt-3 p-3 bg-[rgba(220,53,69,0.1)] rounded-lg border border-[#dc3545]/20">
					<AlertTriangle className="w-4 h-4 shrink-0" />
					{editError}
				</div>
			)}
			<div className="flex flex-wrap items-center gap-3 mt-4">
				<button
					className="inline-flex items-center gap-2 bg-linear-to-br from-[#ec1d24] to-[#c91820] text-white py-2.5 px-5 rounded-xl font-[BentonSansBold] text-sm transition-all duration-300 hover:enabled:shadow-lg hover:enabled:shadow-[#ec1d24]/25 hover:enabled:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={onSaveEdit}
					disabled={isSaving}
					type="button"
				>
					<Save className="w-4 h-4" />
					{isSaving ? "Saving..." : "Save Changes"}
				</button>
				<button
					className="inline-flex items-center gap-2 bg-white/5 border border-white/15 text-white/70 py-2.5 px-5 rounded-xl font-[BentonSansRegular] text-sm transition-all duration-300 hover:enabled:bg-white/10 hover:enabled:border-white/25 hover:enabled:text-white disabled:opacity-50 disabled:cursor-not-allowed"
					onClick={onCancelEdit}
					disabled={isSaving}
					type="button"
				>
					<X className="w-4 h-4" />
					Cancel
				</button>
				<span className="text-white/50 text-sm ml-auto font-[BentonSansRegular]">
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
		<div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-4 border-t border-white/8">
			{/* Like button */}
			<button
				className={`flex items-center gap-2 py-2 px-4 rounded-xl transition-all duration-300 ${
					topic.userHasLiked
						? "bg-[#ec1d24]/15 text-[#ec1d24] border border-[#ec1d24]/30"
						: "bg-white/5 text-white/60 border border-white/10 hover:enabled:bg-[#ec1d24]/10 hover:enabled:text-[#ec1d24] hover:enabled:border-[#ec1d24]/20"
				} disabled:opacity-50 disabled:cursor-not-allowed`}
				onClick={onLikeToggle}
				disabled={!hasSession || isDeleted}
				title={
					isDeleted
						? "Cannot like deleted topics"
						: hasSession
							? "Like this topic"
							: "Sign in to like"
				}
				type="button"
			>
				<Heart
					className={`w-4 h-4 ${topic.userHasLiked ? "fill-current" : ""}`}
				/>
				<span className="text-sm font-[BentonSansRegular]">
					{topic.likeCount}
				</span>
			</button>

			{/* Edit history button */}
			{(topic.editCount || 0) > 0 && (
				<button
					className="flex items-center gap-2 py-2 px-3 bg-white/5 border border-white/10 text-white/60 rounded-xl text-sm transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:text-white/80"
					onClick={onShowEditHistory}
					title="View edit history"
					type="button"
				>
					<History className="w-4 h-4" />
					<span className="font-[BentonSansRegular]">
						{topic.editCount} edit{(topic.editCount || 0) > 1 ? "s" : ""}
					</span>
				</button>
			)}

			{/* Topic actions for author */}
			{isAuthor && !isDeleted && !isEditing && (
				<div className="flex items-center gap-2 ml-auto">
					{topic.canEdit && (
						<button
							className="flex items-center gap-2 py-2 px-4 bg-[#ec1d24]/10 border border-[#ec1d24]/30 text-[#ec1d24] rounded-xl text-sm font-[BentonSansRegular] transition-all duration-300 hover:bg-[#ec1d24]/20 hover:border-[#ec1d24]/50 hover:-translate-y-0.5"
							onClick={onEditClick}
							title="Edit this topic"
							type="button"
						>
							<Edit3 className="w-4 h-4" />
							Edit
						</button>
					)}
					<button
						className="flex items-center gap-2 py-2 px-4 bg-[#dc3545]/10 border border-[#dc3545]/30 text-[#dc3545] rounded-xl text-sm font-[BentonSansRegular] transition-all duration-300 hover:enabled:bg-[#dc3545]/20 hover:enabled:border-[#dc3545]/50 hover:enabled:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
						onClick={onDeleteClick}
						disabled={isDeleting}
						title="Delete this topic"
						type="button"
					>
						<Trash2 className="w-4 h-4" />
						{isDeleting ? "Deleting..." : "Delete"}
					</button>
				</div>
			)}
		</div>
	);
}
