import { type JunctionState, type DensityDataPoint } from '../types';

export const generateMockState = (prevPhase?: string): JunctionState => {
  const lanes = ['north', 'south', 'east', 'west'];
  const current_phase = prevPhase || lanes[Math.floor(Math.random() * lanes.length)];
  
  return {
    timestamp: new Date().toISOString(),
    lanes: {
      north: { vehicle_count: 12, density_percent: 40, avg_wait_seconds: 28.5, throughput_last_minute: 18 },
      south: { vehicle_count: 3,  density_percent: 10, avg_wait_seconds: 8.2,  throughput_last_minute: 24 },
      east:  { vehicle_count: 9,  density_percent: 30, avg_wait_seconds: 19.1, throughput_last_minute: 15 },
      west:  { vehicle_count: 2,  density_percent: 6,  avg_wait_seconds: 5.0,  throughput_last_minute: 20 }
    },
    current_phase,
    phase_elapsed_seconds: 12,
    phase_duration_seconds: 35,
    emergency_active: false,
    emergency_direction: null,
    ai_decision: {
      recommended_phase: current_phase,
      duration_seconds: 35,
      reason: `${current_phase.charAt(0).toUpperCase() + current_phase.slice(1)} lane has optimal density. Clearing backlog.`,
      confidence: 0.91,
      model_used: "llama-3.1-8b-instant",
      latency_ms: 187
    }
  };
};

export const generateMockHistory = (points: number = 20): DensityDataPoint[] => {
  const history: DensityDataPoint[] = [];
  const now = new Date();
  
  for (let i = points; i >= 0; i--) {
    history.push({
      timestamp: new Date(now.getTime() - i * 5000).toISOString(),
      north: Math.floor(Math.random() * 20) + 5,
      south: Math.floor(Math.random() * 15) + 2,
      east: Math.floor(Math.random() * 18) + 4,
      west: Math.floor(Math.random() * 10) + 1,
    });
  }
  return history;
};
