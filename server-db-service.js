/**
 * Node.js compatible database service for working-api-server.js
 * Uses the same data structure as the frontend DuckDB/SQL.js implementation
 */

// Mock datacenter data that matches the database schema
const datacentersData = [
  {
    datacenter_id: "DC001",
    name: "Virginia Prime",
    region: "US-East-1",
    type: "Owned",
    location: "Virginia, USA",
    capacity_total: 2048,
    capacity_used: 1792,
    power_usage: 18.4,
    efficiency_rating: 1.2,
    status: "online",
    last_updated: "2024-08-16T00:00:00Z"
  },
  {
    datacenter_id: "DC002", 
    name: "Oregon Alpha",
    region: "US-West-2",
    type: "Owned",
    location: "Oregon, USA",
    capacity_total: 1536,
    capacity_used: 1152,
    power_usage: 12.2,
    efficiency_rating: 1.15,
    status: "online",
    last_updated: "2024-08-16T00:00:00Z"
  },
  {
    datacenter_id: "DC003",
    name: "Frankfurt Beta", 
    region: "EU-Central-1",
    type: "Colocation",
    location: "Frankfurt, Germany",
    capacity_total: 1024,
    capacity_used: 896,
    power_usage: 16.8,
    efficiency_rating: 1.35,
    status: "online",
    last_updated: "2024-08-16T00:00:00Z"
  },
  {
    datacenter_id: "DC004",
    name: "Singapore Gamma",
    region: "APAC-Southeast-1", 
    type: "Colocation",
    location: "Singapore",
    capacity_total: 768,
    capacity_used: 384,
    power_usage: 22.4,
    efficiency_rating: 1.8,
    status: "online",
    last_updated: "2024-08-16T00:00:00Z"
  },
  {
    datacenter_id: "DC005",
    name: "Chicago Delta",
    region: "US-Central-1",
    type: "Owned", 
    location: "Chicago, USA",
    capacity_total: 1792,
    capacity_used: 1792,
    power_usage: 15.6,
    efficiency_rating: 1.0,
    status: "online",
    last_updated: "2024-08-16T00:00:00Z"
  },
  {
    datacenter_id: "DC006",
    name: "Tokyo Zeta",
    region: "APAC-Northeast-1",
    type: "Colocation",
    location: "Tokyo, Japan", 
    capacity_total: 768,
    capacity_used: 300,
    power_usage: 18.2,
    efficiency_rating: 1.45,
    status: "online",
    last_updated: "2024-08-16T00:00:00Z"
  },
  {
    datacenter_id: "DC007",
    name: "California Eta",
    region: "US-West-1",
    type: "Edge",
    location: "California, USA",
    capacity_total: 256,
    capacity_used: 224,
    power_usage: 8.4,
    efficiency_rating: 1.6,
    status: "maintenance",
    last_updated: "2024-08-16T00:00:00Z"
  },
  {
    datacenter_id: "DC008",
    name: "Ireland Epsilon",
    region: "EU-West-1", 
    type: "Owned",
    location: "Dublin, Ireland",
    capacity_total: 896,
    capacity_used: 0,
    power_usage: 0.2,
    efficiency_rating: 0.0,
    status: "commissioning",
    last_updated: "2024-08-16T00:00:00Z"
  },
  {
    datacenter_id: "DC009",
    name: "Sydney Theta",
    region: "APAC-Southeast-2",
    type: "Colocation",
    location: "Sydney, Australia",
    capacity_total: 512,
    capacity_used: 384,
    power_usage: 14.6,
    efficiency_rating: 1.75,
    status: "online",
    last_updated: "2024-08-16T00:00:00Z"
  }
];

// Database service with the same interface as frontend queries
export const ServerDatabaseService = {
  datacenters: {
    async getAll() {
      return [...datacentersData];
    },

    async getOnline() {
      return datacentersData.filter(dc => dc.status === 'online');
    },

    async getWithCapacity() {
      return datacentersData.map(dc => ({
        ...dc,
        utilization_percent: dc.capacity_total ? ((dc.capacity_used / dc.capacity_total) * 100).toFixed(2) : 0
      }));
    }
  }
};

// Tool execution functions that use the server database service
export const executeServerTool = async (toolName, args) => {
  console.log(`🔧 Executing server tool: ${toolName} with args:`, args);
  
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
    console.error(`❌ Server tool execution error for ${toolName}:`, error);
    throw error;
  }
};

async function executeQueryDatacenters(filters) {
  const datacenters = await ServerDatabaseService.datacenters.getAll();
  
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
  const datacenters = await ServerDatabaseService.datacenters.getAll();
  
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
    location: topDC.location,
    powerUsage: `${topDC.power_usage} MW`,
    efficiency: topDC.efficiency_rating
  };
}

async function executeGetTotalPowerConsumption(includeBreakdown) {
  const datacenters = await ServerDatabaseService.datacenters.getAll();
  
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
    totalPower: totalPower.toFixed(2),
    unit: 'MW',
    datacenters: datacenters.length,
    onlineDatacenters: onlineDatacenters,
    averagePowerPerDC: datacenters.length > 0 ? (totalPower / datacenters.length).toFixed(2) : 0,
    efficiency: {
      totalGPUs: datacenters.reduce((sum, dc) => sum + (dc.capacity_used || 0), 0),
      powerPerGPU: datacenters.reduce((sum, dc) => sum + (dc.capacity_used || 0), 0) > 0 ? 
        (totalPower / datacenters.reduce((sum, dc) => sum + (dc.capacity_used || 0), 0)).toFixed(3) : 0
    }
  };
  
  if (includeBreakdown) {
    response.breakdown = datacenters.map(dc => ({
      name: dc.name,
      power: dc.power_usage || 0,
      status: dc.status,
      region: dc.region,
      gpus: dc.capacity_used || 0,
      efficiency: dc.efficiency_rating
    })).sort((a, b) => b.power - a.power);
  }
  
  return response;
}

async function executeFindUnderutilizedGPUs(utilizationThreshold) {
  const datacenters = await ServerDatabaseService.datacenters.getAll();
  
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
  
  const totalAvailableCapacity = underutilized.reduce((sum, dc) => {
    return sum + ((dc.capacity_total || 0) - (dc.capacity_used || 0));
  }, 0);
  
  const potentialPowerSavings = underutilized.reduce((sum, dc) => {
    const unusedCapacity = (dc.capacity_total || 0) - (dc.capacity_used || 0);
    const powerPerGPU = dc.capacity_total > 0 ? dc.power_usage / dc.capacity_total : 0;
    return sum + (unusedCapacity * powerPerGPU);
  }, 0);
  
  const recommendations = [
    `${underutilized.length} datacenters have utilization below ${utilizationThreshold}%`,
    `${totalAvailableCapacity} GPUs are available for immediate deployment`,
    `Potential power savings: ${potentialPowerSavings.toFixed(2)} MW through consolidation`,
    underutilized.length > 2 ? 'Consider workload migration between sites for efficiency' : 'Limited optimization opportunities available',
    'Review power efficiency ratios and consolidation strategies'
  ];
  
  return {
    datacenters: underutilized.map(dc => ({
      name: dc.name,
      region: dc.region,
      utilization: dc.capacity_total ? `${((dc.capacity_used / dc.capacity_total) * 100).toFixed(1)}%` : '0%',
      deployedGPUs: dc.capacity_used || 0,
      capacity: dc.capacity_total || 0,
      available: (dc.capacity_total || 0) - (dc.capacity_used || 0),
      powerUsage: `${dc.power_usage} MW`,
      efficiency: dc.efficiency_rating
    })),
    totalAvailableCapacity,
    potentialPowerSavings: potentialPowerSavings.toFixed(2),
    recommendations
  };
}