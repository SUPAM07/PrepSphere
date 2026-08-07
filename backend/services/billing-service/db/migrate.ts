import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

async function runMigrations() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

  const db = drizzle(pool);

  console.log("🔄 Running database migrations...");

  await migrate(db, {
    migrationsFolder: path.resolve(process.cwd(), "drizzle"),
  });

  console.log("✅ Migrations complete.");
  await pool.end();
}

runMigrations().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});

