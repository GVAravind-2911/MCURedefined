import "dotenv/config";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create postgres connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL is not defined");
}

// For server-side usage (Node.js environment)
const client = postgres(connectionString);
export const db: PostgresJsDatabase<typeof schema> = drizzle(client, {
	schema,
});
