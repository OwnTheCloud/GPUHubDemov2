import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function testOpenAI() {
  try {
    console.log('🧪 Testing OpenAI API connection...');
    
    // Check API key
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.error('❌ No API key found');
      return;
    }
    
    console.log('✅ API key found:', apiKey.substring(0, 10) + '...');
    
    // Configure model with explicit settings
    const model = openai(process.env.VITE_OPENAI_MODEL || 'gpt-4o-mini', {
      apiKey,
      baseURL: 'https://api.openai.com/v1',
    });
    
    console.log('✅ Model configured:', process.env.VITE_OPENAI_MODEL || 'gpt-4o-mini');
    
    // Test simple message
    const testMessages = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Say hello in a short message.' }
    ];
    
    console.log('📤 Sending test messages:', JSON.stringify(testMessages, null, 2));
    
    // Call streamText
    console.log('🚀 Calling streamText...');
    const result = streamText({
      model,
      messages: testMessages,
      temperature: 0.7,
      maxTokens: 100,
      onFinish: (result) => {
        console.log('🏁 Stream finished:', result);
      }
    });
    
    console.log('✅ streamText returned result object');
    
    // Try accessing the result promise directly
    try {
      console.log('🔍 Accessing result properties...');
      const textStream = result.textStream;
      console.log('✅ Got text stream');
      
      // Try to read from the text stream
      console.log('📖 Reading from text stream...');
      for await (const chunk of textStream) {
        console.log('📦 Text chunk:', chunk);
      }
    } catch (error) {
      console.error('❌ Error reading text stream:', error);
    }
    
    // Try to get the stream
    console.log('🔄 Converting to data stream...');
    const response = await result.toDataStreamResponse();
    
    console.log('✅ Data stream response created');
    console.log('📊 Response status:', response.status);
    console.log('📋 Response headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`);
    }
    
    // Read the stream
    if (response.body) {
      console.log('📖 Reading stream...');
      const reader = response.body.getReader();
      let chunkCount = 0;
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log(`✅ Stream complete. Read ${chunkCount} chunks.`);
            break;
          }
          
          chunkCount++;
          const chunkText = new TextDecoder().decode(value);
          console.log(`📦 Chunk ${chunkCount}:`, chunkText);
          
          if (chunkCount > 10) {
            console.log('🛑 Stopping after 10 chunks to avoid spam');
            break;
          }
        }
      } finally {
        reader.releaseLock();
      }
    }
    
    console.log('🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('💥 Test failed with error:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.cause) {
      console.error('Error cause:', error.cause);
    }
    
    // Check for specific OpenAI API errors
    if (error.status) {
      console.error('HTTP Status:', error.status);
    }
    
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

// Run the test
testOpenAI();