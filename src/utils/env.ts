import { z } from "zod";

// Schema for required core configuration
export const CoreConfigSchema = z
  .object({
    ORIGIN: z.string().url(),
    API_KEY: z.string().min(1),
    DB: z.string().min(1),
  })
  .strict();

// Schema for optional Umami Analytics configuration
export const UmamiConfigSchema = z
  .object({
    UMAMI_SCRIPT_URL: z.string().url(),
    UMAMI_WEBSITE_ID: z.string().uuid(),
  })
  .strict();

// Combined schema for all environment variables
export const EnvSchema = z
  .object({
    ...CoreConfigSchema.shape,
    ...UmamiConfigSchema.partial().shape,
  })
  .strict();

// Types
export type CoreConfig = z.infer<typeof CoreConfigSchema>;
export type UmamiConfig = z.infer<typeof UmamiConfigSchema>;
export type Env = z.infer<typeof EnvSchema>;

// Validate core configuration (required variables)
export function getCoreConfig(
  env: Record<string, string | undefined>,
): CoreConfig {
  try {
    return CoreConfigSchema.parse({
      ORIGIN: env.ORIGIN,
      API_KEY: env.API_KEY,
      DB: env.DB,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors
        .filter((e) => e.code === "invalid_type" && e.received === "undefined")
        .map((e) => e.path.join("."));

      if (missingVars.length > 0) {
        throw new Error(
          `Missing required environment variables: ${missingVars.join(", ")}`,
        );
      }
    }
    throw error;
  }
}

// Parse and validate Umami configuration (optional variables)
export function getUmamiConfig(
  env: Record<string, string | undefined>,
): UmamiConfig | null {
  try {
    return UmamiConfigSchema.parse({
      UMAMI_SCRIPT_URL: env.UMAMI_SCRIPT_URL,
      UMAMI_WEBSITE_ID: env.UMAMI_WEBSITE_ID,
    });
  } catch (error) {
    // If any environment variable is missing, return null
    if (error instanceof z.ZodError) {
      const missingFields = error.errors.some(
        (e) => e.code === "invalid_type" && e.received === "undefined",
      );
      if (missingFields) {
        return null;
      }
    }
    // If there's a validation error (e.g. invalid URL or UUID format), throw the error
    throw error;
  }
}

// Validate all environment variables
export function validateEnv(env: Record<string, string | undefined>): Env {
  return EnvSchema.parse(env);
}
