import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createServer } from 'http';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// System prompt
const systemPrompt = `You are a GPU Assistant for a GPU infrastructure management platform. Help users analyze GPU deployments, power consumption, and performance metrics.`;

const server = createServer(async (req, res) => {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  console.log(`${req.method} ${req.url}`);

  if (req.url === '/api/chat' && req.method === 'POST') {
    try {
      // Parse request body
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }

      console.log('Request body:', body);
      const { messages } = JSON.parse(body);
      console.log('Parsed messages:', messages);

      // Check API key
      const apiKey = process.env.VITE_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        console.error('❌ OpenAI API key not configured');
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'OpenAI API key not configured' }));
        return;
      }
      
      // Validate API key format
      if (!apiKey.startsWith('sk-')) {
        console.error('❌ Invalid OpenAI API key format:', apiKey.substring(0, 10) + '...');
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid OpenAI API key format' }));
        return;
      }
      
      console.log('✅ OpenAI API key validated:', apiKey.substring(0, 10) + '...');

      // Configure model
      const model = openai(process.env.VITE_OPENAI_MODEL || 'gpt-4o-mini', {
        apiKey
      });

      // Clean messages - OpenAI only wants role and content
      const cleanMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add system message
      const messagesWithSystem = [
        { role: 'system', content: systemPrompt },
        ...cleanMessages
      ];

      console.log('Original messages:', JSON.stringify(messages, null, 2));
      console.log('Cleaned messages for OpenAI:', JSON.stringify(messagesWithSystem, null, 2));

      // Generate streaming response
      console.log('Calling streamText with OpenAI...');
      let result;
      try {
        result = streamText({
          model,
          messages: messagesWithSystem,
          temperature: 0.7,
          maxTokens: 1000,
        });
        console.log('✅ streamText call succeeded');
      } catch (error) {
        console.error('❌ streamText failed:', error);
        throw error;
      }

      // Convert to data stream response
      console.log('Converting to data stream response...');
      let response;
      try {
        response = await result.toDataStreamResponse();
        console.log('✅ Data stream response created');
      } catch (error) {
        console.error('❌ toDataStreamResponse failed:', error);
        throw error;
      }

      // Set headers from the response
      for (const [key, value] of response.headers.entries()) {
        res.setHeader(key, value);
      }

      res.writeHead(response.status || 200);

      // Stream the response body
      if (response.body) {
        const reader = response.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
        } finally {
          reader.releaseLock();
          res.end();
        }
      } else {
        res.end();
      }

    } catch (error) {
      console.error('Chat error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        error: 'Failed to process chat request',
        details: error.message 
      }));
    }
  } else if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'OK', timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

const PORT = 3333;
server.listen(PORT, () => {
  console.log(`🚀 Simple API Server running on http://localhost:${PORT}`);
  console.log(`📡 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});