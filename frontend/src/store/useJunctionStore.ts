import { create } from 'zustand';
import { type JunctionState, type DensityDataPoint, type AIDecision, type CongestionPrediction } from '../types';

interface JunctionStore {
  junctionState: JunctionState | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  densityHistory: DensityDataPoint[];
  decisionLog: AIDecision[];
  insightLog: CongestionPrediction[];
  emergencyActive: boolean;
  emergencyDirection: string | null;

  setJunctionState: (state: JunctionState) => void;
  setConnectionStatus: (status: 'connecting' | 'connected' | 'disconnected') => void;
  appendDensityPoint: (point: DensityDataPoint) => void;
  addDecision: (decision: AIDecision) => void;
  addInsight: (insight: CongestionPrediction) => void;
  setEmergency: (active: boolean, direction: string | null) => void;
  setSendMessage: (fn: (msg: any) => void) => void;
  sendMessage: (msg: any) => void;
}

export const useJunctionStore = create<JunctionStore>((set) => ({
  junctionState: null,
  connectionStatus: 'disconnected',
  densityHistory: [],
  decisionLog: [],
  insightLog: [],
  emergencyActive: false,
  emergencyDirection: null,

  setJunctionState: (state) => set({ junctionState: state }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  appendDensityPoint: (point) => set((state) => ({
    densityHistory: [...state.densityHistory.slice(-59), point] // Keep last 60 points (5 mins)
  })),
  addDecision: (decision) => set((state) => ({
    decisionLog: [decision, ...state.decisionLog.slice(0, 19)] // Keep last 20
  })),
  addInsight: (insight) => set((state) => ({
    insightLog: [insight, ...state.insightLog.slice(0, 9)] // Keep last 10
  })),
  setEmergency: (active, direction) => set({ 
    emergencyActive: active, 
    emergencyDirection: direction 
  }),
  setSendMessage: (fn) => set({ sendMessage: fn }),
  sendMessage: () => {
    console.warn('Socket not connected yet');
  },
}));
