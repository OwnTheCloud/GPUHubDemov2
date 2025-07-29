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

      console.log('📥 Request received');
      const { messages } = JSON.parse(body);
      console.log('📄 Messages:', messages.length);

      // Check API key
      const apiKey = process.env.VITE_OPENAI_API_KEY;
      if (!apiKey || apiKey === 'your_openai_api_key_here') {
        console.error('❌ OpenAI API key not configured');
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'OpenAI API key not configured' }));
        return;
      }

      console.log('✅ API key validated');

      // Clean messages for OpenAI
      const cleanMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add system message
      const messagesWithSystem = [
        { role: 'system', content: systemPrompt },
        ...cleanMessages
      ];

      console.log('🚀 Calling OpenAI API...');

      // Call OpenAI API directly
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.VITE_OPENAI_MODEL || 'gpt-4o-mini',
          messages: messagesWithSystem,
          temperature: 0.7,
          max_tokens: 1000,
          stream: true
        })
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('❌ OpenAI API error:', errorText);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'OpenAI API error: ' + errorText }));
        return;
      }

      console.log('✅ OpenAI responded successfully');

      // Set headers for AI SDK data stream format
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('x-vercel-ai-data-stream', 'v1');
      res.writeHead(200);

      // Convert OpenAI SSE stream to AI SDK data stream format
      const reader = openaiResponse.body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      
      let buffer = '';
      let fullText = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              
              if (data === '[DONE]') {
                // Send message annotations (required by AI SDK)
                res.write(encoder.encode(`8:[]\n`));
                // Send final message
                res.write(encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`));
                console.log('✅ Stream completed');
                res.end();
                return;
              }

              try {
                const json = JSON.parse(data);
                const delta = json.choices?.[0]?.delta;
                
                if (delta?.content) {
                  // Send text chunk in AI SDK format
                  const textChunk = `0:${JSON.stringify(delta.content)}\n`;
                  res.write(encoder.encode(textChunk));
                  fullText += delta.content;
                  console.log('📤 Sent chunk:', delta.content);
                }
              } catch (parseError) {
                console.log('⚠️ Skipping non-JSON line:', data);
              }
            }
          }
        }
      } catch (streamError) {
        console.error('❌ Stream error:', streamError);
        res.write(encoder.encode(`3:${JSON.stringify('Stream error: ' + streamError.message)}\n`));
        res.end();
      }

    } catch (error) {
      console.error('💥 Chat error:', error);
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
  console.log(`🚀 Working API Server running on http://localhost:${PORT}`);
  console.log(`📡 Chat endpoint: http://localhost:${PORT}/api/chat`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Bypassing AI SDK streamText - using direct OpenAI integration`);
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});