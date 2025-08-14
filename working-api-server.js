import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// ES Module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import DataService (we'll create a simple version for Node.js)
const DataService = {
  datacentersData: [
    {
      id: "DC001",
      name: "Virginia Prime",
      region: "US-East-1",
      type: "Owned",
      gpuCapacity: 2048,
      deployedGPUs: 2048,
      utilization: "87.5%",
      powerUsage: "18.4 MW",
      temperature: "22°C",
      liveDate: "2024-01-15",
      status: "Online",
    },
    {
      id: "DC002",
      name: "Oregon Alpha",
      region: "US-West-2",
      type: "Owned",
      gpuCapacity: 1536,
      deployedGPUs: 1536,
      utilization: "75.0%",
      powerUsage: "12.2 MW",
      temperature: "21°C",
      liveDate: "2023-11-20",
      status: "Online",
    },
    {
      id: "DC003",
      name: "Frankfurt Beta",
      region: "EU-Central-1",
      type: "Colocation",
      gpuCapacity: 1024,
      deployedGPUs: 896,
      utilization: "87.5%",
      powerUsage: "16.8 MW",
      temperature: "23°C",
      liveDate: "2024-03-10",
      status: "Online",
    },
    {
      id: "DC004",
      name: "Singapore Gamma",
      region: "APAC-Southeast-1",
      type: "Colocation",
      gpuCapacity: 768,
      deployedGPUs: 576,
      utilization: "75.0%",
      powerUsage: "22.4 MW",
      temperature: "24°C",
      liveDate: "2024-05-01",
      status: "Online",
    },
    {
      id: "DC005",
      name: "Chicago Delta",
      region: "US-Central-1",
      type: "Owned",
      gpuCapacity: 1792,
      deployedGPUs: 1792,
      utilization: "100.0%",
      powerUsage: "15.6 MW",
      temperature: "22°C",
      liveDate: "2024-02-28",
      status: "Online",
    },
    {
      id: "DC006",
      name: "Tokyo Zeta",
      region: "APAC-Northeast-1",
      type: "Colocation",
      gpuCapacity: 768,
      deployedGPUs: 576,
      utilization: "75.0%",
      powerUsage: "18.2 MW",
      temperature: "23°C",
      liveDate: "2024-04-12",
      status: "Online",
    },
    {
      id: "DC007",
      name: "California Eta",
      region: "US-West-1",
      type: "Edge",
      gpuCapacity: 256,
      deployedGPUs: 224,
      utilization: "87.5%",
      powerUsage: "8.4 MW",
      temperature: "25°C",
      liveDate: "2024-06-15",
      status: "Maintenance",
    },
    {
      id: "DC008",
      name: "Ireland Epsilon",
      region: "EU-West-1",
      type: "Owned",
      gpuCapacity: 896,
      deployedGPUs: 0,
      utilization: "0.0%",
      powerUsage: "0.2 MW",
      temperature: "20°C",
      liveDate: "2024-07-20",
      status: "Commissioning",
    },
    {
      id: "DC009",
      name: "Sydney Theta",
      region: "APAC-Southeast-2",
      type: "Colocation",
      gpuCapacity: 512,
      deployedGPUs: 384,
      utilization: "75.0%",
      powerUsage: "14.6 MW",
      temperature: "22°C",
      liveDate: "2024-06-01",
      status: "Online",
    }
  ],
  
  queryDatacenters(filters = {}) {
    let results = [...this.datacentersData];
    
    if (filters.region) {
      results = results.filter(dc => dc.region === filters.region);
    }
    if (filters.status) {
      results = results.filter(dc => dc.status === filters.status);
    }
    if (filters.type) {
      results = results.filter(dc => dc.type === filters.type);
    }
    if (filters.minGPUs) {
      results = results.filter(dc => dc.deployedGPUs >= filters.minGPUs);
    }
    if (filters.utilizationThreshold) {
      results = results.filter(dc => 
        parseFloat(dc.utilization.replace('%', '')) < filters.utilizationThreshold
      );
    }
    
    return results;
  },
  
  getDatacenterStats() {
    const datacenters = this.datacentersData;
    
    const totalGPUs = datacenters.reduce((sum, dc) => sum + dc.deployedGPUs, 0);
    const totalCapacity = datacenters.reduce((sum, dc) => sum + dc.gpuCapacity, 0);
    
    const totalPowerUsage = datacenters.reduce((sum, dc) => {
      const powerValue = parseFloat(dc.powerUsage.replace(' MW', ''));
      return sum + powerValue;
    }, 0);

    const utilizationSum = datacenters.reduce((sum, dc) => {
      const utilizationValue = parseFloat(dc.utilization.replace('%', ''));
      return sum + utilizationValue;
    }, 0);
    const averageUtilization = utilizationSum / datacenters.length;

    const datacentersByGPUs = [...datacenters].sort((a, b) => b.deployedGPUs - a.deployedGPUs);

    const powerByDatacenter = datacenters.map(dc => ({
      name: dc.name,
      power: parseFloat(dc.powerUsage.replace(' MW', ''))
    }));

    const onlineDatacenters = datacenters.filter(dc => dc.status === 'Online').length;

    return {
      totalGPUs,
      totalCapacity,
      totalPowerUsage,
      averageUtilization,
      datacentersByGPUs,
      powerByDatacenter,
      onlineDatacenters,
      totalDatacenters: datacenters.length
    };
  },
  
  findUnderutilizedResources(utilizationThreshold = 50) {
    const underutilized = this.datacentersData.filter(dc => {
      const utilization = parseFloat(dc.utilization.replace('%', ''));
      return utilization < utilizationThreshold && dc.status === 'Online';
    });

    const totalUnderutilizedGPUs = underutilized.reduce((sum, dc) => {
      const currentUtilization = parseFloat(dc.utilization.replace('%', '')) / 100;
      const underutilizedGPUs = Math.floor(dc.deployedGPUs * (1 - currentUtilization));
      return sum + underutilizedGPUs;
    }, 0);

    const totalWastedCapacity = underutilized.reduce((sum, dc) => {
      return sum + (dc.gpuCapacity - dc.deployedGPUs);
    }, 0);

    const recommendations = [
      `${underutilized.length} datacenters have utilization below ${utilizationThreshold}%`,
      `Consider consolidating workloads to improve efficiency`,
      `${totalWastedCapacity} GPUs are available for deployment`,
      underutilized.length > 2 ? 'Multiple sites available for workload migration' : 'Limited sites for workload optimization'
    ];

    return {
      datacenters: underutilized,
      totalUnderutilizedGPUs,
      totalWastedCapacity,
      recommendations
    };
  }
};

// Tool definitions for OpenAI function calling
const tools = [
  {
    type: "function",
    function: {
      name: "queryDatacenters",
      description: "Query datacenter information including GPU counts, power usage, and status",
      parameters: {
        type: "object",
        properties: {
          filters: {
            type: "object",
            properties: {
              region: { type: "string", description: "Filter by region (e.g., US-East-1, EU-Central-1)" },
              status: { type: "string", enum: ["Online", "Maintenance", "Offline", "Commissioning"] },
              minGPUs: { type: "number", description: "Minimum number of GPUs" },
              type: { type: "string", enum: ["Owned", "Colocation", "Edge"] },
              utilizationThreshold: { type: "number", description: "Filter by utilization below this threshold" }
            }
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getDatacenterWithMostGPUs",
      description: "Find which datacenter has the most GPUs deployed",
      parameters: { type: "object", properties: {} }
    }
  },
  {
    type: "function",
    function: {
      name: "getTotalPowerConsumption",
      description: "Calculate total power consumption across all datacenters with breakdown",
      parameters: {
        type: "object",
        properties: {
          includeBreakdown: { type: "boolean", description: "Include per-datacenter breakdown" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "findUnderutilizedGPUs",
      description: "Find GPU resources that are underutilized",
      parameters: {
        type: "object",
        properties: {
          utilizationThreshold: { type: "number", default: 50, description: "Utilization threshold percentage" }
        }
      }
    }
  }
];

// Tool execution functions
const executeTool = async (toolName, args) => {
  console.log(`🔧 Executing tool: ${toolName} with args:`, args);
  
  switch (toolName) {
    case 'queryDatacenters':
      const results = DataService.queryDatacenters(args.filters || {});
      return {
        success: true,
        data: results,
        summary: `Found ${results.length} datacenters matching criteria`
      };
      
    case 'getDatacenterWithMostGPUs':
      const stats = DataService.getDatacenterStats();
      const topDC = stats.datacentersByGPUs[0];
      return {
        datacenter: topDC.name,
        gpuCount: topDC.deployedGPUs,
        region: topDC.region,
        utilization: topDC.utilization,
        powerUsage: topDC.powerUsage,
        type: topDC.type
      };
      
    case 'getTotalPowerConsumption':
      const powerStats = DataService.getDatacenterStats();
      const response = {
        totalPower: powerStats.totalPowerUsage,
        unit: 'MW',
        datacenters: powerStats.totalDatacenters,
        onlineDatacenters: powerStats.onlineDatacenters
      };
      
      if (args.includeBreakdown) {
        response.breakdown = powerStats.powerByDatacenter;
      }
      
      return response;
      
    case 'findUnderutilizedGPUs':
      const underutilized = DataService.findUnderutilizedResources(args.utilizationThreshold || 50);
      return {
        datacenters: underutilized.datacenters.map(dc => ({
          name: dc.name,
          region: dc.region,
          utilization: dc.utilization,
          deployedGPUs: dc.deployedGPUs,
          capacity: dc.gpuCapacity
        })),
        totalUnderutilizedGPUs: underutilized.totalUnderutilizedGPUs,
        totalAvailableCapacity: underutilized.totalWastedCapacity,
        recommendations: underutilized.recommendations
      };
      
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
};

// Load environment variables
dotenv.config({ path: '.env.local' });

// Enhanced system prompt with data context
const systemPrompt = `You are a GPU Infrastructure Assistant with access to real-time data from a GPU management platform.

Available data includes:
- 9 GPU datacenters across multiple regions (US, EU, APAC)
- GPU types: A100, H100, H200, GB200
- Total capacity: 8,512 GPUs deployed
- Power consumption, utilization, and status monitoring
- Investigation and execution signals

Use the provided tools to query specific data when users ask questions. Format responses with clear summaries and relevant metrics. Always provide context and actionable insights.

For example:
- "Virginia Prime has the most GPUs" → Include specific numbers, utilization, and context
- "Total power consumption" → Break down by status and provide efficiency insights  
- "Underutilized resources" → Include specific recommendations for optimization

Be conversational but precise with data.`;

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

      // Call OpenAI API directly with tools
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
          max_tokens: 1500,
          tools: tools,
          tool_choice: 'auto',
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

      // Convert OpenAI SSE stream to AI SDK data stream format with tool support
      const reader = openaiResponse.body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      
      let buffer = '';
      let fullText = '';
      let toolCalls = [];

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
                // Execute any pending tool calls
                if (toolCalls.length > 0) {
                  console.log(`🔧 Executing ${toolCalls.length} tool calls`);
                  
                  for (const toolCall of toolCalls) {
                    try {
                      const toolResult = await executeTool(toolCall.function.name, JSON.parse(toolCall.function.arguments || '{}'));
                      
                      // Send tool call in AI SDK format
                      const toolCallData = `9:${JSON.stringify({
                        toolCallId: toolCall.id,
                        toolName: toolCall.function.name,
                        args: JSON.parse(toolCall.function.arguments || '{}'),
                        result: toolResult
                      })}\n`;
                      res.write(encoder.encode(toolCallData));
                      console.log('🔧 Tool result sent for:', toolCall.function.name);
                      
                    } catch (toolError) {
                      console.error('❌ Tool execution error:', toolError);
                      const errorData = `9:${JSON.stringify({
                        toolCallId: toolCall.id,
                        toolName: toolCall.function.name,
                        error: toolError.message
                      })}\n`;
                      res.write(encoder.encode(errorData));
                    }
                  }
                  
                  // After tools, send a completion message
                  const completionText = 'Based on the data above, let me provide you with the analysis.';
                  res.write(encoder.encode(`0:${JSON.stringify(completionText)}\n`));
                }
                
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
                
                // Handle text content
                if (delta?.content) {
                  const textChunk = `0:${JSON.stringify(delta.content)}\n`;
                  res.write(encoder.encode(textChunk));
                  fullText += delta.content;
                  console.log('📤 Sent text chunk:', delta.content);
                }
                
                // Handle tool calls
                if (delta?.tool_calls) {
                  for (const toolCall of delta.tool_calls) {
                    // Find existing tool call or create new one
                    let existingCall = toolCalls.find(tc => tc.index === toolCall.index);
                    
                    if (!existingCall) {
                      existingCall = {
                        id: toolCall.id,
                        type: 'function',
                        function: { name: '', arguments: '' },
                        index: toolCall.index
                      };
                      toolCalls.push(existingCall);
                    }
                    
                    // Update tool call data
                    if (toolCall.id) existingCall.id = toolCall.id;
                    if (toolCall.function?.name) existingCall.function.name = toolCall.function.name;
                    if (toolCall.function?.arguments) {
                      existingCall.function.arguments += toolCall.function.arguments;
                    }
                    
                    console.log('🔧 Building tool call:', existingCall.function.name);
                  }
                }
                
              } catch (parseError) {
                console.log('⚠️ Skipping non-JSON line:', data);
              }
            }
          }
        }
      } catch (streamError) {
        console.error('❌ Stream error:', streamError);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
        }
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