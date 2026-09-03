import React, { useEffect, useRef } from 'react';
import { type JunctionState } from '../types';
import { ShieldAlert, Play, Pause, RotateCcw } from 'lucide-react';

interface JunctionCanvasProps {
  state: JunctionState;
  isPaused?: boolean;
  simulationSpeed?: number;
  onTogglePlay?: () => void;
  onReset?: () => void;
  onSpeedChange?: (speed: number) => void;
  onSpawnVehicle?: (lane: string) => void;
  onEmergencyTrigger?: (direction: string) => void;
}

interface SimVehicle {
  id: string;
  lane: 'north' | 'south' | 'east' | 'west';
  progress: number; // -200 (spawn) to 0 (stopline) to 250 (cleared)
  speed: number;
  color: string;
  type: 'sedan' | 'suv' | 'bus' | 'ambulance';
  isEmergency: boolean;
  length: number;
  width: number;
}

const VEHICLE_COLORS = ['#38bdf8', '#fbbf24', '#f87171', '#34d399', '#a78bfa', '#f472b6', '#e2e8f0'];

export const JunctionCanvas: React.FC<JunctionCanvasProps> = ({ 
  state, 
  isPaused = true,
  simulationSpeed = 1.0,
  onTogglePlay,
  onReset,
  onSpeedChange,
  onSpawnVehicle, 
  onEmergencyTrigger 
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const vehiclesRef = useRef<SimVehicle[]>([]);
  const lastTimeRef = useRef<number>(performance.now());

  // Synchronize internal vehicle simulation with live backend lane counts and scenario presets
  useEffect(() => {
    const lanes: ('north' | 'south' | 'east' | 'west')[] = ['north', 'south', 'east', 'west'];
    
    lanes.forEach(lane => {
      const targetCount = state.lanes[lane]?.vehicle_count || 0;
      const desiredDisplay = Math.min(targetCount, 8);
      
      // Filter vehicles still in the queue (before or at stop line)
      let currentLaneVehicles = vehiclesRef.current.filter(v => v.lane === lane && v.progress <= 50);
      
      if (currentLaneVehicles.length < desiredDisplay) {
        // Spawn missing vehicles queued up behind stop line
        const spawnCount = desiredDisplay - currentLaneVehicles.length;
        for (let i = 0; i < spawnCount; i++) {
          const isAmbulance = state.emergency_active && state.emergency_direction === lane && (currentLaneVehicles.length + i) === 0;
          const vType = isAmbulance ? 'ambulance' : (Math.random() < 0.15 ? 'bus' : Math.random() < 0.3 ? 'suv' : 'sedan');
          
          vehiclesRef.current.push({
            id: `${lane}-${Date.now()}-${Math.random()}`,
            lane,
            progress: -30 - (currentLaneVehicles.length + i) * 28,
            speed: isAmbulance ? 110 : 65 + Math.random() * 20,
            color: isAmbulance ? '#ef4444' : VEHICLE_COLORS[Math.floor(Math.random() * VEHICLE_COLORS.length)],
            type: vType,
            isEmergency: isAmbulance,
            length: vType === 'bus' ? 38 : vType === 'suv' ? 26 : 22,
            width: vType === 'bus' ? 14 : 12
          });
        }
      } else if (currentLaneVehicles.length > desiredDisplay) {
        // Trim excess vehicles if switching to a lighter scenario
        const removeCount = currentLaneVehicles.length - desiredDisplay;
        for (let i = 0; i < removeCount; i++) {
          const idx = vehiclesRef.current.findIndex(v => v.lane === lane && v.progress <= 50);
          if (idx !== -1) vehiclesRef.current.splice(idx, 1);
        }
      }
    });
  }, [state.lanes, state.active_scenario, state.emergency_active, state.emergency_direction]);

  // Main 60FPS Canvas Animation Loop
  useEffect(() => {
    let animId: number;

    const render = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;
      const roadWidth = 140;
      const halfRoad = roadWidth / 2;

      // 1. Draw Environment Background (Textured Grass & Sidewalk)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Grass Corner Plots
      ctx.fillStyle = '#141e1b';
      ctx.fillRect(0, 0, cx - halfRoad, cy - halfRoad);
      ctx.fillRect(cx + halfRoad, 0, cx - halfRoad, cy - halfRoad);
      ctx.fillRect(0, cy + halfRoad, cx - halfRoad, cy - halfRoad);
      ctx.fillRect(cx + halfRoad, cy + halfRoad, cx - halfRoad, cy - halfRoad);

      // Curbs & Sidewalk Borders
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, cx - halfRoad - 2, cy - halfRoad - 2);
      ctx.strokeRect(cx + halfRoad + 2, 2, cx - halfRoad - 4, cy - halfRoad - 2);
      ctx.strokeRect(2, cy + halfRoad + 2, cx - halfRoad - 2, cy - halfRoad - 4);
      ctx.strokeRect(cx + halfRoad + 2, cy + halfRoad + 2, cx - halfRoad - 4, cy - halfRoad - 4);

      // 2. Draw Asphalt Road Corridors
      ctx.fillStyle = '#1e293b';
      // North-South Road
      ctx.fillRect(cx - halfRoad, 0, roadWidth, height);
      // East-West Road
      ctx.fillRect(0, cy - halfRoad, width, roadWidth);

      // Intersection Center
      ctx.fillStyle = '#1a2333';
      ctx.fillRect(cx - halfRoad, cy - halfRoad, roadWidth, roadWidth);

      // Active Phase Road Highlighting Glow
      const activeLane = state.current_phase;
      const signalColor = state.signal_color || 'green';
      const isGreen = signalColor === 'green';
      const isYellow = signalColor === 'yellow';

      const glowColor = isYellow 
        ? 'rgba(234, 179, 8, 0.12)' 
        : isGreen 
          ? 'rgba(16, 185, 129, 0.14)' 
          : 'rgba(244, 63, 94, 0.08)';

      ctx.fillStyle = glowColor;
      if (activeLane === 'north' || activeLane === 'south') {
        ctx.fillRect(cx - halfRoad, 0, roadWidth, height);
      } else {
        ctx.fillRect(0, cy - halfRoad, width, roadWidth);
      }

      // 3. Road Markings (Double Yellow Center Lines)
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      
      // Vertical Yellow Lines
      ctx.beginPath();
      ctx.moveTo(cx - 2, 0); ctx.lineTo(cx - 2, cy - halfRoad);
      ctx.moveTo(cx + 2, 0); ctx.lineTo(cx + 2, cy - halfRoad);
      ctx.moveTo(cx - 2, cy + halfRoad); ctx.lineTo(cx - 2, height);
      ctx.moveTo(cx + 2, cy + halfRoad); ctx.lineTo(cx + 2, height);
      
      // Horizontal Yellow Lines
      ctx.moveTo(0, cy - 2); ctx.lineTo(cx - halfRoad, cy - 2);
      ctx.moveTo(0, cy + 2); ctx.lineTo(cx - halfRoad, cy + 2);
      ctx.moveTo(cx + halfRoad, cy - 2); ctx.lineTo(width, cy - 2);
      ctx.moveTo(cx + halfRoad, cy + 2); ctx.lineTo(width, cy + 2);
      ctx.stroke();

      // Dashed Lane Dividers (White)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      // North approach
      ctx.moveTo(cx - halfRoad / 2, 0); ctx.lineTo(cx - halfRoad / 2, cy - halfRoad - 20);
      ctx.moveTo(cx + halfRoad / 2, 0); ctx.lineTo(cx + halfRoad / 2, cy - halfRoad - 20);
      // South approach
      ctx.moveTo(cx - halfRoad / 2, cy + halfRoad + 20); ctx.lineTo(cx - halfRoad / 2, height);
      ctx.moveTo(cx + halfRoad / 2, cy + halfRoad + 20); ctx.lineTo(cx + halfRoad / 2, height);
      // West approach
      ctx.moveTo(0, cy - halfRoad / 2); ctx.lineTo(cx - halfRoad - 20, cy - halfRoad / 2);
      ctx.moveTo(0, cy + halfRoad / 2); ctx.lineTo(cx - halfRoad - 20, cy + halfRoad / 2);
      // East approach
      ctx.moveTo(cx + halfRoad + 20, cy - halfRoad / 2); ctx.lineTo(width, cy - halfRoad / 2);
      ctx.moveTo(cx + halfRoad + 20, cy + halfRoad / 2); ctx.lineTo(width, cy + halfRoad / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. White Stop Lines & Zebra Crosswalks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      // North Crosswalk
      for (let i = -halfRoad + 6; i < halfRoad - 6; i += 16) {
        ctx.fillRect(cx + i, cy - halfRoad - 18, 8, 14);
      }
      // South Crosswalk
      for (let i = -halfRoad + 6; i < halfRoad - 6; i += 16) {
        ctx.fillRect(cx + i, cy + halfRoad + 4, 8, 14);
      }
      // West Crosswalk
      for (let i = -halfRoad + 6; i < halfRoad - 6; i += 16) {
        ctx.fillRect(cx - halfRoad - 18, cy + i, 14, 8);
      }
      // East Crosswalk
      for (let i = -halfRoad + 6; i < halfRoad - 6; i += 16) {
        ctx.fillRect(cx + halfRoad + 4, cy + i, 14, 8);
      }

      // Stop Lines (Drawn ONLY on RED/YELLOW stopped lanes; HIDDEN on active GREEN open lane)
      const isNorthOpen = (state.current_phase === 'north' && state.signal_color === 'green');
      const isSouthOpen = (state.current_phase === 'south' && state.signal_color === 'green');
      const isWestOpen  = (state.current_phase === 'west'  && state.signal_color === 'green');
      const isEastOpen  = (state.current_phase === 'east'  && state.signal_color === 'green');

      ctx.fillStyle = '#f8fafc';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      ctx.shadowBlur = 4;

      // North approach stop line (Draw ONLY if North is stopped)
      if (!isNorthOpen) {
        ctx.fillRect(cx - halfRoad, cy - halfRoad - 3, halfRoad, 4);
      } else {
        // Green Lane Open: Draw subtle glowing green open dashes
        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.fillRect(cx - halfRoad, cy - halfRoad - 2, halfRoad, 2);
        ctx.fillStyle = '#f8fafc';
      }

      // South approach stop line (Draw ONLY if South is stopped)
      if (!isSouthOpen) {
        ctx.fillRect(cx, cy + halfRoad - 1, halfRoad, 4);
      } else {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.fillRect(cx, cy + halfRoad - 1, halfRoad, 2);
        ctx.fillStyle = '#f8fafc';
      }

      // West approach stop line (Draw ONLY if West is stopped)
      if (!isWestOpen) {
        ctx.fillRect(cx - halfRoad - 3, cy, 4, halfRoad);
      } else {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.fillRect(cx - halfRoad - 2, cy, 2, halfRoad);
        ctx.fillStyle = '#f8fafc';
      }

      // East approach stop line (Draw ONLY if East is stopped)
      if (!isEastOpen) {
        ctx.fillRect(cx + halfRoad - 1, cy - halfRoad, 4, halfRoad);
      } else {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.fillRect(cx + halfRoad - 1, cy - halfRoad, 2, halfRoad);
        ctx.fillStyle = '#f8fafc';
      }

      ctx.shadowBlur = 0;

      // 5. Update and Draw Dynamic Vehicles
      const vehicles = vehiclesRef.current;
      for (let i = vehicles.length - 1; i >= 0; i--) {
        const v = vehicles[i];
        const isCurrentPhase = (v.lane === state.current_phase);
        const canPass = isCurrentPhase && signalColor === 'green';

        // Check distance to car in front
        let leadDist = 999;
        for (let j = 0; j < vehicles.length; j++) {
          if (i !== j && vehicles[j].lane === v.lane && vehicles[j].progress > v.progress) {
            const d = vehicles[j].progress - v.progress;
            if (d < leadDist) leadDist = d;
          }
        }

        // Target progress stop position
        const stopLineProgress = -20;
        let targetSpeed = v.speed;

        if (v.progress < stopLineProgress) {
          if (!canPass && (stopLineProgress - v.progress) < 70) {
            // Decelerate to stop line
            targetSpeed = Math.max(0, (stopLineProgress - v.progress) * 1.5);
          } else if (leadDist < 40) {
            // Decelerate behind lead car
            targetSpeed = Math.max(0, (leadDist - 28) * 1.8);
          }
        } else if (v.progress >= stopLineProgress && v.progress < 100) {
          // Inside junction - accelerate through
          targetSpeed = v.speed * 1.25;
        }

        if (!state.is_paused && !isPaused) {
          v.progress += targetSpeed * dt * (simulationSpeed || 1.0);
        }

        // Draw Vehicle Body
        let vx = cx;
        let vy = cy;
        let vAngle = 0;

        if (v.lane === 'north') {
          vx = cx - halfRoad / 2;
          vy = cy - halfRoad + v.progress;
          vAngle = Math.PI;
        } else if (v.lane === 'south') {
          vx = cx + halfRoad / 2;
          vy = cy + halfRoad - v.progress;
          vAngle = 0;
        } else if (v.lane === 'west') {
          vx = cx - halfRoad + v.progress;
          vy = cy + halfRoad / 2;
          vAngle = Math.PI / 2;
        } else if (v.lane === 'east') {
          vx = cx + halfRoad - v.progress;
          vy = cy - halfRoad / 2;
          vAngle = -Math.PI / 2;
        }

        ctx.save();
        ctx.translate(vx, vy);
        ctx.rotate(vAngle);

        // Headlight Beams (Glowing Cones)
        const gradient = ctx.createRadialGradient(0, 16, 2, 0, 45, 30);
        gradient.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
        gradient.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(-v.width / 2, 8);
        ctx.lineTo(-v.width - 8, 45);
        ctx.lineTo(v.width + 8, 45);
        ctx.lineTo(v.width / 2, 8);
        ctx.closePath();
        ctx.fill();

        // Vehicle Chassis
        ctx.fillStyle = v.color;
        ctx.beginPath();
        ctx.roundRect(-v.width / 2, -v.length / 2, v.width, v.length, 3);
        ctx.fill();

        // Roof / Windshield Glass
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-v.width / 2 + 2, -v.length / 2 + 5, v.width - 4, v.length - 10, 2);
        ctx.fill();

        // Taillights (Red glow when braking or stopped)
        const isBraking = targetSpeed < 10;
        ctx.fillStyle = isBraking ? '#ef4444' : '#7f1d1d';
        ctx.fillRect(-v.width / 2 + 1, -v.length / 2, 3, 2);
        ctx.fillRect(v.width / 2 - 4, -v.length / 2, 3, 2);

        // Emergency Vehicle Siren Flash
        if (v.isEmergency) {
          const flash = Math.floor(time / 150) % 2 === 0;
          ctx.fillStyle = flash ? '#ef4444' : '#3b82f6';
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        // Remove vehicles that have fully cleared the junction
        if (v.progress > 220) {
          vehicles.splice(i, 1);
        }
      }

      // 6. Draw 3-Lamp Traffic Signal Heads (North, South, East, West)
      const drawSignalHead = (x: number, y: number, orientation: 'horizontal' | 'vertical', laneKey: string) => {
        const isThisGreen = (state.current_phase === laneKey && state.signal_color === 'green');
        const isThisYellow = (state.current_phase === laneKey && state.signal_color === 'yellow');
        const isThisRed = !isThisGreen && !isThisYellow;

        ctx.save();
        ctx.translate(x, y);

        // Housing
        ctx.fillStyle = '#090d16';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        if (orientation === 'vertical') {
          ctx.beginPath();
          ctx.roundRect(-8, -22, 16, 44, 4);
          ctx.fill();
          ctx.stroke();

          // Red Lamp
          ctx.fillStyle = isThisRed ? '#ef4444' : '#3b1116';
          ctx.beginPath(); ctx.arc(0, -14, 4.5, 0, Math.PI * 2); ctx.fill();
          if (isThisRed) {
            ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8;
            ctx.arc(0, -14, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Yellow Lamp
          ctx.fillStyle = isThisYellow ? '#eab308' : '#362b08';
          ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill();
          if (isThisYellow) {
            ctx.shadowColor = '#eab308'; ctx.shadowBlur = 10;
            ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Green Lamp
          ctx.fillStyle = isThisGreen ? '#10b981' : '#062d22';
          ctx.beginPath(); ctx.arc(0, 14, 4.5, 0, Math.PI * 2); ctx.fill();
          if (isThisGreen) {
            ctx.shadowColor = '#10b981'; ctx.shadowBlur = 10;
            ctx.arc(0, 14, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
          }
        } else {
          ctx.beginPath();
          ctx.roundRect(-22, -8, 44, 16, 4);
          ctx.fill();
          ctx.stroke();

          // Red Lamp
          ctx.fillStyle = isThisRed ? '#ef4444' : '#3b1116';
          ctx.beginPath(); ctx.arc(-14, 0, 4.5, 0, Math.PI * 2); ctx.fill();
          if (isThisRed) {
            ctx.shadowColor = '#ef4444'; ctx.shadowBlur = 8;
            ctx.arc(-14, 0, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Yellow Lamp
          ctx.fillStyle = isThisYellow ? '#eab308' : '#362b08';
          ctx.beginPath(); ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill();
          if (isThisYellow) {
            ctx.shadowColor = '#eab308'; ctx.shadowBlur = 10;
            ctx.arc(0, 0, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Green Lamp
          ctx.fillStyle = isThisGreen ? '#10b981' : '#062d22';
          ctx.beginPath(); ctx.arc(14, 0, 4.5, 0, Math.PI * 2); ctx.fill();
          if (isThisGreen) {
            ctx.shadowColor = '#10b981'; ctx.shadowBlur = 10;
            ctx.arc(14, 0, 4.5, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
        ctx.restore();
      };

      // Position traffic signal heads at stop line curbs
      drawSignalHead(cx - halfRoad - 14, cy - halfRoad - 26, 'vertical', 'north');
      drawSignalHead(cx + halfRoad + 14, cy + halfRoad + 26, 'vertical', 'south');
      drawSignalHead(cx + halfRoad + 26, cy - halfRoad - 14, 'horizontal', 'east');
      drawSignalHead(cx - halfRoad - 26, cy + halfRoad + 14, 'horizontal', 'west');

      // 7. Monsoon Storm Rain Effect
      if (state.active_scenario === 'storm' && !state.is_paused && !isPaused) {
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.35)';
        ctx.lineWidth = 1;
        for (let r = 0; r < 60; r++) {
          const rx = (time * 0.5 + r * 37) % width;
          const ry = (time * 0.9 + r * 53) % height;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 4, ry + 12);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [state.current_phase, state.signal_color, state.emergency_active, state.active_scenario, state.is_paused, isPaused, simulationSpeed]);

  const timeRemaining = Math.max(0, state.phase_duration_seconds - state.phase_elapsed_seconds);
  const currentlyPaused = state.is_paused ?? isPaused;

  return (
    <div className="relative w-full max-w-[490px] aspect-square mx-auto bg-slate-950 rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden flex flex-col">
      {/* Top HUD & Playback Control Bar Integrated directly on Canvas */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between gap-1.5 pointer-events-none">
        {/* Phase Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-800 pointer-events-auto">
          <span className={`w-2 h-2 rounded-full ${
            state.signal_color === 'yellow' ? 'bg-amber-400 animate-ping' : 
            state.signal_color === 'green' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
          }`} />
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-200">
            Phase: <span className="text-emerald-400 font-mono">{state.current_phase}</span>
          </span>
          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {timeRemaining}s
          </span>
        </div>

        {/* Play / Pause / Reset / Speed Controls */}
        <div className="flex items-center gap-1 pointer-events-auto bg-slate-900/95 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-xl">
          <button
            onClick={onTogglePlay}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase flex items-center gap-1 transition-all shadow-md ${
              currentlyPaused
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 text-white shadow-emerald-500/30 animate-pulse'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 text-white shadow-amber-500/30'
            }`}
          >
            {currentlyPaused ? (
              <>
                <Play size={12} className="fill-white" /> Start
              </>
            ) : (
              <>
                <Pause size={12} className="fill-white" /> Pause
              </>
            )}
          </button>

          {onReset && (
            <button
              onClick={onReset}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all"
              title="Reset Traffic State"
            >
              <RotateCcw size={12} />
            </button>
          )}

          {onSpeedChange && (
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              {[1.0, 2.0, 4.0].map(sp => (
                <button
                  key={sp}
                  onClick={() => onSpeedChange(sp)}
                  className={`px-1 py-0.5 rounded text-[8px] font-mono font-bold transition-all ${
                    simulationSpeed === sp
                      ? 'bg-primary-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sp}x
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* HTML5 Canvas Render Target */}
      <canvas
        ref={canvasRef}
        width={560}
        height={560}
        className="w-full h-full object-contain"
      />

      {/* Standby Central Quick-Start Floating Pill (Non-blocking) */}
      {currentlyPaused && (
        <div className="absolute top-12 left-0 right-0 z-20 flex justify-center pointer-events-none animate-bounce">
          <button
            onClick={onTogglePlay}
            className="pointer-events-auto py-2 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-xs shadow-xl shadow-emerald-500/40 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border border-emerald-400/40"
          >
            <Play size={14} className="fill-white" /> Start Live ANN Simulation
          </button>
        </div>
      )}

      {/* Floating Lane Quick Controls */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Inject:</span>
          {['north', 'south', 'east', 'west'].map(lane => (
            <button
              key={lane}
              onClick={() => onSpawnVehicle && onSpawnVehicle(lane)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-mono font-bold text-slate-300 uppercase transition-all hover:scale-105 active:scale-95 border border-slate-700/50"
            >
              +{lane[0].toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {state.emergency_active ? (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30 animate-pulse">
              <ShieldAlert size={12} /> Siren Active
            </div>
          ) : (
            <button
              onClick={() => onEmergencyTrigger && onEmergencyTrigger('north')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-400 font-bold text-[10px] border border-rose-500/30 transition-all hover:scale-105"
            >
              <ShieldAlert size={12} /> Priority Run
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
