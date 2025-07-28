import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// System prompt
const systemPrompt = `You are a GPU Assistant for a GPU infrastructure management platform. You help users analyze GPU deployments, power consumption, performance metrics, and datacenter operations.

Key capabilities:
- Analyze GPU utilization and performance data
- Provide insights on power consumption trends
- Help with datacenter capacity planning
- Explain GPU deployment signals and alerts
- Assist with H100, A100, and other GPU configurations

Context: You're working within a GPU Hub platform that monitors datacenters, GPU stamps, demand IDs, investigation signals, and execution signals. Users may ask about specific GPU deployments, utilization metrics, or infrastructure issues.

Be helpful, technical when appropriate, and focus on actionable insights for GPU infrastructure management.`;

// Polyfill for Web API Request/Response in Node.js
import { Request, Response } from '@whatwg-node/fetch';

// The exact pattern from AI SDK docs
async function POST(req) {
  try {
    const { messages } = await req.json();

    // Check API key
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Configure model
    const model = openai(process.env.VITE_OPENAI_MODEL || 'gpt-4o-mini', {
      apiKey
    });

    // Add system message
    const messagesWithSystem = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Generate streaming response - exact AI SDK pattern
    const result = streamText({
      model,
      messages: messagesWithSystem,
      temperature: 0.7,
      maxTokens: 1000,
    });

    // Return the data stream response - this is the key!
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Simple HTTP server that wraps the Web API handler
import { createServer } from 'http';
import { URL } from 'url';

const server = createServer(async (nodeReq, nodeRes) => {
  // Handle CORS
  nodeRes.setHeader('Access-Control-Allow-Origin', '*');
  nodeRes.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  nodeRes.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (nodeReq.method === 'OPTIONS') {
    nodeRes.writeHead(200);
    nodeRes.end();
    return;
  }

  const url = new URL(nodeReq.url, `http://${nodeReq.headers.host}`);
  
  if (url.pathname === '/api/chat' && nodeReq.method === 'POST') {
    try {
      // Convert Node.js request to Web API Request
      let body = '';
      for await (const chunk of nodeReq) {
        body += chunk;
      }

      const webRequest = new Request(`http://localhost:3333${url.pathname}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body
      });

      // Call the Web API handler
      const webResponse = await POST(webRequest);
      
      // Convert Web API Response back to Node.js response
      nodeRes.writeHead(webResponse.status, Object.fromEntries(webResponse.headers));
      
      if (webResponse.body) {
        const reader = webResponse.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          nodeRes.write(value);
        }
      }
      
      nodeRes.end();

    } catch (error) {
      console.error('Server error:', error);
      nodeRes.writeHead(500, { 'Content-Type': 'application/json' });
      nodeRes.end(JSON.stringify({ error: 'Internal server error' }));
    }
  } else if (url.pathname === '/api/health') {
    nodeRes.writeHead(200, { 'Content-Type': 'application/json' });
    nodeRes.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
  } else {
    nodeRes.writeHead(404, { 'Content-Type': 'application/json' });
    nodeRes.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3333;
server.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📡 Chat endpoint: http://localhost:${PORT}/api/chat`);
});