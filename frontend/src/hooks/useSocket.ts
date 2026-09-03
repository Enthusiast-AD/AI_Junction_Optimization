import { useEffect, useRef } from 'react';
import { useJunctionStore } from '../store/useJunctionStore';
import { type JunctionState } from '../types';

export const useSocket = () => {
  const { 
    setJunctionState, 
    setConnectionStatus, 
    appendDensityPoint, 
    addDecision, 
    setEmergency,
    addInsight,
    setSendMessage
  } = useJunctionStore();
  
  const socketRef = useRef<WebSocket | null>(null);

  const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

  useEffect(() => {
    const connect = () => {
      setConnectionStatus('connecting');
      
      const wsUrl = WS_URL;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('Connected to AI Junction WebSocket');
        setConnectionStatus('connected');
        
        // Register the send function in the store
        setSendMessage((message: any) => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
          } else {
            console.warn('WebSocket not open. ReadyState:', socket.readyState);
          }
        });
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const { type, data } = message;

          switch (type) {
            case 'state_update': {
              const state = data as JunctionState;
              setJunctionState(state);
              appendDensityPoint({
                timestamp: state.timestamp,
                north: state.lanes.north.vehicle_count,
                south: state.lanes.south.vehicle_count,
                east: state.lanes.east.vehicle_count,
                west: state.lanes.west.vehicle_count,
              });
              setEmergency(state.emergency_active, state.emergency_direction);
              if (state.ai_decision) {
                addDecision(state.ai_decision);
              }
              break;
            }
            case 'ai_insight': {
              addInsight(data);
              break;
            }
            case 'emergency_activated': {
              setEmergency(true, data.direction);
              break;
            }
            case 'emergency_cancelled': {
              setEmergency(false, null);
              break;
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onclose = () => {
        setConnectionStatus('disconnected');
        setSendMessage(() => {
          console.warn('Cannot send message: WebSocket is disconnected');
        });
        setTimeout(connect, 3000);
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
      };
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [setJunctionState, setConnectionStatus, appendDensityPoint, addDecision, setEmergency, addInsight, setSendMessage]);
};
