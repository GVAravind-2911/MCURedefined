import type { Project } from "@/types/ProjectTypes";
import type { AxiosError } from "axios";
import type { ReactElement } from "react";
import ProjectsPage from "@/components/project/Projects";
import ErrorMessage from "@/components/main/ErrorMessage";
import axios from "axios";

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
				"The projects server appears to be offline",
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
	} else {
		return {
			hasError: true,
			title: "Unable to Load Release Schedule",
			reasons: [
				"The release schedule service may be temporarily unavailable",
				"Server may be undergoing maintenance",
				"Please try again later",
			],
		};
	}
};

async function getProjects(): Promise<Project[] | ErrorState> {
	try {
		const response = await axios.get("http://127.0.0.1:4000/release-slate", {
			timeout: 10000, // 10 second timeout
			headers: {
				"Cache-Control": "no-cache",
				Pragma: "no-cache",
				Expires: "0",
			},
		});
		return response.data;
	} catch (error) {
		return handleApiError(error);
	}
}

export default async function ReleasePage(): Promise<ReactElement> {
	const result = await getProjects();

	// Check if we got an error
	if ("hasError" in result) {
		return <ErrorMessage title={result.title} reasons={result.reasons} />;
	}

	// If no error, result contains the projects
	return <ProjectsPage projects={result} />;
}
