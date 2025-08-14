import { z } from 'zod';

// Environment schema
const envSchema = z.object({
  // Required environment variables
  VITE_OPENAI_API_KEY: z
    .string()
    .min(1, 'OpenAI API key is required')
    .startsWith('sk-', 'OpenAI API key must start with sk-'),
  
  // Optional environment variables with defaults
  VITE_OPENAI_MODEL: z
    .string()
    .optional()
    .default('gpt-4o-mini'),
  
  MODE: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  
  DEV: z
    .boolean()
    .default(false),
  
  PROD: z
    .boolean()
    .default(false),
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse({
      VITE_OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
      VITE_OPENAI_MODEL: import.meta.env.VITE_OPENAI_MODEL,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join('\n');
      
      throw new Error(
        `Environment validation failed:\n${errorMessages}\n\n` +
        'Please check your environment variables in .env.local'
      );
    }
    throw error;
  }
}

// Export validated environment variables
export const env = validateEnv();

// Type for environment variables
export type Env = z.infer<typeof envSchema>;

// Environment checkers
export const isDevelopment = env.MODE === 'development';
export const isProduction = env.MODE === 'production';
export const isTest = env.MODE === 'test';

// Configuration object for easy access
export const config = {
  openai: {
    apiKey: env.VITE_OPENAI_API_KEY,
    model: env.VITE_OPENAI_MODEL,
  },
  app: {
    mode: env.MODE,
    isDevelopment,
    isProduction,
    isTest,
  },
} as const;