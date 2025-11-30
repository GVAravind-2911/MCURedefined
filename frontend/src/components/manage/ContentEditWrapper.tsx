"use client";

import type { JSX } from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import type { ContentConfig, ContentData, ErrorState } from "@/types/ContentTypes";
import { getApiUrl, getDraftStorageKey, handleApiError, normalizeContentBlocks } from "@/lib/content/utils";
import ContentEditor from "./ContentEditor";
import LoadingSpinner from "@/components/main/LoadingSpinner";
import ErrorMessage from "@/components/main/ErrorMessage";

interface ContentEditWrapperProps {
	config: ContentConfig;
}

export default function ContentEditWrapper({
	config,
}: ContentEditWrapperProps): JSX.Element {
	const params = useParams();
	const id = params?.id as string;

	const [loading, setLoading] = useState(true);
	const [initialData, setInitialData] = useState<ContentData | null>(null);
	const [error, setError] = useState<ErrorState>({
		hasError: false,
		title: "",
		reasons: [],
	});

	useEffect(() => {
		const fetchData = async (): Promise<void> => {
			if (!id) return;

			const storageKey = getDraftStorageKey(config, id);

			try {
				// Try to get data from localStorage first
				const storedContent = localStorage.getItem(storageKey);
				if (storedContent) {
					const contentData = JSON.parse(storedContent) as ContentData;
					// Normalize content blocks
					contentData.content = normalizeContentBlocks(contentData.content || []);
					setInitialData(contentData);
				} else {
					// If not in localStorage, try to fetch from server
					try {
						const response = await axios.get<ContentData>(
							getApiUrl(`${config.apiPath}/${id}`),
							{ timeout: 10000 },
						);
						const contentData = response.data;
						// Normalize content blocks
						contentData.content = normalizeContentBlocks(contentData.content || []);
						setInitialData(contentData);
					} catch (serverError) {
						setError(handleApiError(serverError, config.singularName));
					}
				}
			} catch (localStorageError) {
				setError({
					hasError: true,
					title: "Data Access Error",
					reasons: [
						`Failed to read saved ${config.singularName} data`,
						"There may be an issue with your browser storage",
						"Please try clearing your browser cache",
					],
				});
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id, config]);

	if (loading) {
		return <LoadingSpinner />;
	}

	if (error.hasError) {
		return <ErrorMessage title={error.title} reasons={error.reasons} />;
	}

	return (
		<ContentEditor
			config={config}
			mode="edit"
			id={id}
			initialData={initialData || undefined}
		/>
	);
}
