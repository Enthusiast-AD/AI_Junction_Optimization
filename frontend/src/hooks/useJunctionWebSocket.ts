import { useEffect, useRef } from 'react';
import { useJunctionStore } from '../store/useJunctionStore';

export function useJunctionWebSocket() {
  const { setJunctionState, setConnectionStatus, appendDensityPoint, addDecision, setEmergency } = useJunctionStore();
  const wsRef = useRef<WebSocket | null>(null);

  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

  useEffect(() => {
    let ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    const onOpen = () => {
      console.log('Connected to WebSocket server');
      setConnectionStatus('connected');
    };

    const onMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'state_update') {
          const state = message.data;
          setJunctionState(state);
          
          if (state.ai_decision) {
            // Use timestamp or ID to prevent duplicates if necessary, but store handles it simply for now
            addDecision(state.ai_decision);
          }

          // Generate a point for the density history chart
          const point = {
            timestamp: new Date(state.timestamp).toLocaleTimeString(),
            north: state.lanes.north.density_percent,
            south: state.lanes.south.density_percent,
            east: state.lanes.east.density_percent,
            west: state.lanes.west.density_percent,
          };
          appendDensityPoint(point);
        } else if (message.type === 'phase_change') {
          // Handled via state_update implicitly
        } else if (message.type === 'emergency_activated') {
          setEmergency(true, message.data.direction);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    const onClose = () => {
      console.log('WebSocket disconnected');
      setConnectionStatus('disconnected');
    };

    const onError = (error: Event) => {
      console.log('WebSocket connection failed:', error);
      setConnectionStatus('disconnected');
    };

    ws.addEventListener('open', onOpen);
    ws.addEventListener('message', onMessage);
    ws.addEventListener('close', onClose);
    ws.addEventListener('error', onError);

    return () => {
      ws.removeEventListener('open', onOpen);
      ws.removeEventListener('message', onMessage);
      ws.removeEventListener('close', onClose);
      ws.removeEventListener('error', onError);
      ws.close();
    };
  }, [setJunctionState, setConnectionStatus, appendDensityPoint]);

  return { ws: wsRef.current };
}
