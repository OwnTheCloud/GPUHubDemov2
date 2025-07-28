import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Manually create a data stream response that the AI SDK expects
async function createManualDataStream() {
  try {
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    const model = process.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
    
    console.log('🧪 Testing manual data stream creation...');
    
    // Call OpenAI directly
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say hello in a short message.' }
        ],
        temperature: 0.7,
        max_tokens: 100,
        stream: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    // Create a manual data stream in the format expected by AI SDK
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      start(controller) {
        // Send initial text part
        controller.enqueue(encoder.encode('0:"Hello! This is a test message from manual streaming."\n'));
        controller.close();
      }
    });
    
    // Create a Response with the proper headers
    const dataStreamResponse = new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'x-vercel-ai-data-stream': 'v1',
      }
    });
    
    console.log('✅ Created manual data stream response');
    console.log('📊 Response status:', dataStreamResponse.status);
    console.log('📋 Response headers:');
    for (const [key, value] of dataStreamResponse.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Read the stream to verify format
    console.log('📖 Reading manual stream...');
    const reader = dataStreamResponse.body.getReader();
    let chunkCount = 0;
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(`✅ Manual stream complete. Read ${chunkCount} chunks.`);
          break;
        }
        
        chunkCount++;
        const chunkText = new TextDecoder().decode(value);
        console.log(`📦 Manual chunk ${chunkCount}:`, chunkText);
      }
    } finally {
      reader.releaseLock();
    }
    
    console.log('🎉 Manual test completed successfully!');
    
  } catch (error) {
    console.error('💥 Manual test failed:', error);
  }
}

createManualDataStream();