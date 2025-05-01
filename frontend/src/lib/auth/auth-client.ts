import { createAuthClient } from "better-auth/react";
import { usernameClient, adminClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({
	baseURL: "http://localhost:3000",
	plugins: [usernameClient(), adminClient()],
});
