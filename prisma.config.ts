import "dotenv/config";
import { defineConfig } from "prisma/config";
import * as process from "process";
import * as fs from "fs";
import * as path from "path";

// Load .env.local if it exists (for development)
const envLocalPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envLocalPath)) {
    const envLocal = fs.readFileSync(envLocalPath, "utf-8");
    envLocal.split("\n").forEach((line) => {
        const [key, ...valueParts] = line.split("=");
        if (key && !key.startsWith("#")) {
            const value = valueParts.join("=").replace(/^"/, "").replace(/"$/, "");
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
}

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    engine: "classic",
    datasource: {
        url: process.env.DATABASE_URL || "",
    },
});
