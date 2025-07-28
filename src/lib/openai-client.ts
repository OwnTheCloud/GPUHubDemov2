import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// System prompt for GPU context
const systemPrompt = `You are a GPU Assistant for a GPU infrastructure management platform. You help users analyze GPU deployments, power consumption, performance metrics, and datacenter operations.

Key capabilities:
- Analyze GPU utilization and performance data
- Provide insights on power consumption trends
- Help with datacenter capacity planning
- Explain GPU deployment signals and alerts
- Assist with H100, A100, and other GPU configurations

Context: You're working within a GPU Hub platform that monitors datacenters, GPU stamps, demand IDs, investigation signals, and execution signals. Users may ask about specific GPU deployments, utilization metrics, or infrastructure issues.

Be helpful, technical when appropriate, and focus on actionable insights for GPU infrastructure management.`;

export async function createChatStream(messages: any[]) {
  // Check for API key
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env.local file.');
  }

  // Configure OpenAI client
  const model = openai(import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini', {
    apiKey
  });

  // Add system message
  const messagesWithSystem = [
    { role: 'system', content: systemPrompt },
    ...messages
  ];

  // Return the streaming result - this is the key part!
  const result = streamText({
    model,
    messages: messagesWithSystem,
    temperature: 0.7,
    maxTokens: 1000,
  });

  return result;
}