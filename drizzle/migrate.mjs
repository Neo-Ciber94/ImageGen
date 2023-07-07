import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import path from "path";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql);

await migrate(db, {
  migrationsFolder: path.join(process.cwd(), "drizzle", "migrations"),
});
