import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import Header from "./Header";

async function HeaderWrapper() {
  // Fetch session on the server
  const session = await auth.api.getSession({headers: await headers()});
  
  // Pass the session to the client component
  return <Header session={session} />;
}

export default HeaderWrapper;