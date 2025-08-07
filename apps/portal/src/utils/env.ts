import { z } from "zod";
import { loadEnvConfig } from "@next/env";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const envSchema = z.object({
	DHIS2_BASE_URL: z.string(),
	DHIS2_BASE_PAT_TOKEN: z.string(),
	CONTEXT_PATH: z.string().optional(),
});

const parsedEnv = envSchema.safeParse(process.env).data ?? {
	DHIS2_BASE_URL: "http://localhost:8080",
	DHIS2_BASE_PAT_TOKEN: "d2_pat-placeholder",
};

// Debug logging (remove this after fixing the issue)
console.log("Environment variables loaded:", {
	DHIS2_BASE_URL: parsedEnv.DHIS2_BASE_URL,
	DHIS2_BASE_PAT_TOKEN: parsedEnv.DHIS2_BASE_PAT_TOKEN ? "***SET***" : "***NOT SET***",
	CONTEXT_PATH: parsedEnv.CONTEXT_PATH,
});

export const env = parsedEnv;
