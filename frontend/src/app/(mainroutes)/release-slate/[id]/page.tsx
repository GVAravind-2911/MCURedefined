import type { Project } from "@/types/ProjectTypes";
import type { AxiosError } from "axios";
import type { JSX } from "react";
import { notFound } from "next/navigation";
import axios from "axios";
import IndividualProject from "@/components/project/IndividualProject";
import ErrorMessage from "@/components/main/ErrorMessage";

interface ErrorState {
	hasError: boolean;
	title: string;
	reasons: string[];
}

// Common error handling function
const handleApiError = (error: unknown): ErrorState => {
	const axiosError = error as AxiosError;

	if (axiosError.code === "ECONNREFUSED") {
		return {
			hasError: true,
			title: "Connection Failed",
			reasons: [
				"The project server appears to be offline",
				"Unable to establish connection to the API",
				"Please try again later",
			],
		};
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else if (
		axiosError.code === "ETIMEDOUT" ||
		axiosError.message?.includes("timeout")
	) {
		return {
			hasError: true,
			title: "Connection Timeout",
			reasons: [
				"The server took too long to respond",
				"This may be due to high traffic or server load",
				"Please try refreshing the page",
			],
		};
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else if (axiosError.response?.status === 404) {
		return {
			hasError: true,
			title: "Project Not Found",
			reasons: [
				"The requested project does not exist",
				"It may have been removed or the ID is incorrect",
				"Please check the URL and try again",
			],
		};
		// biome-ignore lint/style/noUselessElse: <explanation>
	} else {
		return {
			hasError: true,
			title: "Unable to Load Project Details",
			reasons: [
				"The project service may be temporarily unavailable",
				"Server may be undergoing maintenance",
				"Please try again later",
			],
		};
	}
};

async function getProjectData(id: number): Promise<Project | ErrorState> {
	try {
		const response = await axios.get<Project>(
			`http://127.0.0.1:4000/release-slate/${id}`,
			{
				timeout: 10000, // 10 second timeout
				headers: {
					"Cache-Control": "no-cache",
					Pragma: "no-cache",
					Expires: "0",
				},
			},
		);
		return response.data;
	} catch (error) {
		return handleApiError(error);
	}
}

export default async function ProjectPage({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<JSX.Element> {
	const id = Number.parseInt((await params).id, 10);
	const result = await getProjectData(id);

	// Check if we got an error
	if ("hasError" in result) {
		return <ErrorMessage title={result.title} reasons={result.reasons} />;
	}

	// If we have a valid project, render the component
	return <IndividualProject project={result} />;
}
