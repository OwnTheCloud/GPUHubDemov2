import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testDirectOpenAI() {
  try {
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    const model = process.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
    
    console.log('🧪 Testing direct OpenAI API call...');
    console.log('🔑 API Key:', apiKey.substring(0, 20) + '...');
    console.log('🤖 Model:', model);
    
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
          { role: 'user', content: 'Say hello.' }
        ],
        temperature: 0.7,
        max_tokens: 100,
        stream: true
      })
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    if (response.ok) {
      console.log('📖 Reading streaming response...');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let chunkCount = 0;
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log(`✅ Streaming complete. Read ${chunkCount} chunks.`);
            break;
          }
          
          chunkCount++;
          const chunkText = decoder.decode(value);
          console.log(`📦 Chunk ${chunkCount}:`, chunkText);
          
          if (chunkCount > 5) {
            console.log('🛑 Stopping after 5 chunks');
            break;
          }
        }
      } finally {
        reader.releaseLock();
      }
    } else {
      const responseText = await response.text();
      console.error('❌ API Error:', responseText);
    }
    
  } catch (error) {
    console.error('💥 Direct API test failed:', error);
  }
}

testDirectOpenAI();