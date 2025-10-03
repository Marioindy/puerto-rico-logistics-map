import OpenAI from 'openai';

/**
 * OpenRouter Client Configuration
 *
 * OpenRouter provides a unified API for accessing multiple LLM providers
 * with automatic fallback and load balancing.
 *
 * Advantages:
 * - Single API for multiple providers
 * - Automatic fallback if primary provider fails
 * - Built-in rate limiting
 * - Cost tracking and analytics
 * - No vendor lock-in
 */

export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'X-Title': 'Puerto Rico Logistics Grid',
  },
});

/**
 * Model Configuration
 *
 * We use different models for different agents based on their needs:
 * - Fabiola (Public): Claude 3 Haiku - Fast and cost-effective
 * - Jaynette (Admin): Claude 3.5 Sonnet - More capable for complex operations
 */
export const MODELS = {
  FABIOLA: 'anthropic/claude-3-haiku',
  JAYNETTE: 'anthropic/claude-3.5-sonnet-20241022',
} as const;

/**
 * Model metadata for cost tracking and selection
 */
export const MODEL_INFO = {
  [MODELS.FABIOLA]: {
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    contextWindow: 200000,
    inputCostPer1M: 0.25,
    outputCostPer1M: 1.25,
    useCase: 'Fast, cost-effective for simple queries',
  },
  [MODELS.JAYNETTE]: {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    contextWindow: 200000,
    inputCostPer1M: 3.00,
    outputCostPer1M: 15.00,
    useCase: 'Advanced reasoning for complex admin tasks',
  },
} as const;

/**
 * Create a language model instance for use with Vercel AI SDK
 *
 * @param modelKey - The model key from MODELS constant
 * @returns OpenAI instance configured for the model
 */
export function createOpenRouterModel(modelKey: keyof typeof MODELS) {
  return openrouter.chat.completions;
}

/**
 * Calculate estimated cost for a completion
 *
 * @param modelKey - The model used
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @returns Estimated cost in USD
 */
export function estimateCost(
  modelKey: keyof typeof MODELS,
  inputTokens: number,
  outputTokens: number
): number {
  const info = MODEL_INFO[modelKey];
  const inputCost = (inputTokens / 1000000) * info.inputCostPer1M;
  const outputCost = (outputTokens / 1000000) * info.outputCostPer1M;
  return inputCost + outputCost;
}

/**
 * Validate that the OpenRouter API key is configured
 *
 * @throws Error if API key is missing
 */
export function validateOpenRouterConfig() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      'OPENROUTER_API_KEY environment variable is not set. ' +
      'Please add it to your .env.local file. ' +
      'Get your API key from https://openrouter.ai/keys'
    );
  }
}
