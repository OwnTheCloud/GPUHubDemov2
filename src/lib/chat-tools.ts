/**
 * Shared tool definitions and execution logic for DuckDB RAG integration
 */

import { queries } from '@/db/queries';

// Tool definitions for OpenAI function calling
export const toolDefinitions = [
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
              region: { type: "string", description: "Filter by region" },
              status: { type: "string", enum: ["online", "maintenance", "offline", "commissioning"] },
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
          utilizationThreshold: { type: "number", default: 70, description: "Utilization threshold percentage" }
        }
      }
    }
  }
];

// Tool execution functions that query the DuckDB database
export const executeToolWithDuckDB = async (toolName: string, args: Record<string, unknown>) => {
  console.log(`🔧 Executing DuckDB tool: ${toolName} with args:`, args);
  
  try {
    switch (toolName) {
      case 'queryDatacenters':
        return await executeQueryDatacenters(args.filters || {});
        
      case 'getDatacenterWithMostGPUs':
        return await executeGetDatacenterWithMostGPUs();
        
      case 'getTotalPowerConsumption':
        return await executeGetTotalPowerConsumption(args.includeBreakdown || false);
        
      case 'findUnderutilizedGPUs':
        return await executeFindUnderutilizedGPUs(args.utilizationThreshold || 70);
        
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  } catch (error) {
    console.error(`❌ Tool execution error for ${toolName}:`, error);
    throw error;
  }
};

async function executeQueryDatacenters(filters: Record<string, unknown>) {
  const datacenters = await queries.datacenters.getAll();
  
  let results = [...datacenters];
  
  // Apply filters
  if (filters.region) {
    results = results.filter(dc => dc.region?.toLowerCase().includes(filters.region.toLowerCase()));
  }
  if (filters.status) {
    results = results.filter(dc => dc.status?.toLowerCase() === filters.status.toLowerCase());
  }
  if (filters.type) {
    results = results.filter(dc => dc.type?.toLowerCase() === filters.type.toLowerCase());
  }
  if (filters.minGPUs) {
    results = results.filter(dc => (dc.capacity_used || 0) >= filters.minGPUs);
  }
  if (filters.utilizationThreshold) {
    results = results.filter(dc => {
      const utilization = dc.capacity_total ? (dc.capacity_used / dc.capacity_total) * 100 : 0;
      return utilization < filters.utilizationThreshold;
    });
  }
  
  return {
    success: true,
    data: results,
    summary: `Found ${results.length} datacenters matching criteria`
  };
}

async function executeGetDatacenterWithMostGPUs() {
  const datacenters = await queries.datacenters.getAll();
  
  if (!datacenters || datacenters.length === 0) {
    return {
      error: "No datacenters found in database"
    };
  }
  
  // Find datacenter with most GPUs (capacity_used)
  const topDC = datacenters.reduce((max, dc) => {
    const maxGPUs = max.capacity_used || 0;
    const dcGPUs = dc.capacity_used || 0;
    return dcGPUs > maxGPUs ? dc : max;
  });
  
  const utilization = topDC.capacity_total ? 
    ((topDC.capacity_used / topDC.capacity_total) * 100).toFixed(1) : '0';
  
  return {
    datacenter: topDC.name,
    gpuCount: topDC.capacity_used || 0,
    totalCapacity: topDC.capacity_total || 0,
    region: topDC.region,
    utilization: `${utilization}%`,
    status: topDC.status,
    type: topDC.type,
    location: topDC.location
  };
}

async function executeGetTotalPowerConsumption(includeBreakdown: boolean) {
  const datacenters = await queries.datacenters.getAll();
  
  if (!datacenters || datacenters.length === 0) {
    return {
      error: "No datacenters found in database"
    };
  }
  
  const totalPower = datacenters.reduce((sum, dc) => {
    return sum + (dc.power_usage || 0);
  }, 0);
  
  const onlineDatacenters = datacenters.filter(dc => dc.status === 'online').length;
  
  const response = {
    totalPower: totalPower,
    unit: 'MW',
    datacenters: datacenters.length,
    onlineDatacenters: onlineDatacenters,
    averagePowerPerDC: datacenters.length > 0 ? (totalPower / datacenters.length).toFixed(2) : 0
  };
  
  if (includeBreakdown) {
    response.breakdown = datacenters.map(dc => ({
      name: dc.name,
      power: dc.power_usage || 0,
      status: dc.status,
      region: dc.region
    })).sort((a, b) => b.power - a.power);
  }
  
  return response;
}

async function executeFindUnderutilizedGPUs(utilizationThreshold: number) {
  const datacenters = await queries.datacenters.getAll();
  
  if (!datacenters || datacenters.length === 0) {
    return {
      error: "No datacenters found in database"
    };
  }
  
  const underutilized = datacenters.filter(dc => {
    if (!dc.capacity_total || dc.status !== 'online') return false;
    const utilization = (dc.capacity_used / dc.capacity_total) * 100;
    return utilization < utilizationThreshold;
  });
  
  const totalUnderutilizedGPUs = underutilized.reduce((sum, dc) => {
    const currentUtilization = dc.capacity_total ? (dc.capacity_used / dc.capacity_total) : 0;
    const underutilizedGPUs = Math.floor(dc.capacity_used * (1 - currentUtilization));
    return sum + underutilizedGPUs;
  }, 0);
  
  const totalAvailableCapacity = underutilized.reduce((sum, dc) => {
    return sum + ((dc.capacity_total || 0) - (dc.capacity_used || 0));
  }, 0);
  
  const recommendations = [
    `${underutilized.length} datacenters have utilization below ${utilizationThreshold}%`,
    `${totalAvailableCapacity} GPUs are available for deployment`,
    underutilized.length > 2 ? 'Consider workload migration between sites' : 'Limited optimization opportunities',
    'Review power efficiency and consolidation options'
  ];
  
  return {
    datacenters: underutilized.map(dc => ({
      name: dc.name,
      region: dc.region,
      utilization: dc.capacity_total ? `${((dc.capacity_used / dc.capacity_total) * 100).toFixed(1)}%` : '0%',
      deployedGPUs: dc.capacity_used || 0,
      capacity: dc.capacity_total || 0,
      available: (dc.capacity_total || 0) - (dc.capacity_used || 0)
    })),
    totalUnderutilizedGPUs,
    totalAvailableCapacity,
    recommendations
  };
}