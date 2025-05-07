"use client";

import { EditingProvider } from "@/contexts/EditingContext";
import ProfileContent from "./ProfileContent";

export default function ProfileClientWrapper({ session }) {
	return (
		<EditingProvider>
			<ProfileContent session={session} />
		</EditingProvider>
	);
}
