import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());

// System prompt for GPU Hub context
const systemPrompt = `You are a GPU Assistant for a GPU infrastructure management platform. You help users analyze GPU deployments, power consumption, performance metrics, and datacenter operations.

Key capabilities:
- Analyze GPU utilization and performance data
- Provide insights on power consumption trends
- Help with datacenter capacity planning
- Explain GPU deployment signals and alerts
- Assist with H100, A100, and other GPU configurations

Context: You're working within a GPU Hub platform that monitors datacenters, GPU stamps, demand IDs, investigation signals, and execution signals. Users may ask about specific GPU deployments, utilization metrics, or infrastructure issues.

Be helpful, technical when appropriate, and focus on actionable insights for GPU infrastructure management.`;

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    // Check for API key
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured. Please set VITE_OPENAI_API_KEY in your .env.local file.' 
      });
    }

    // Configure OpenAI client
    const model = openai(process.env.VITE_OPENAI_MODEL || 'gpt-4', {
      apiKey
    });

    // Add system message if not present
    const messagesWithSystem = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const result = streamText({
      model,
      messages: messagesWithSystem,
      temperature: 0.7,
      maxTokens: 1000,
    });

    // Return the streaming response directly
    const response = result.toDataStreamResponse();
    
    // Wait for the response and pipe it
    const streamResponse = await response;
    
    // Set the correct headers
    streamResponse.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // Set status
    res.status(streamResponse.status || 200);
    
    // Handle the stream
    if (streamResponse.body) {
      const stream = streamResponse.body;
      const reader = stream.getReader();
      
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              res.end();
              break;
            }
            res.write(value);
          }
        } catch (error) {
          console.error('Stream error:', error);
          res.end();
        }
      };
      
      await pump();
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Chat API error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});