import React from 'react';
import { Play, Pause, RotateCcw, Gauge } from 'lucide-react';
import { Card } from './ui/Card';

interface SimulationControllerBarProps {
  isPaused: boolean;
  simulationSpeed: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export const SimulationControllerBar: React.FC<SimulationControllerBarProps> = ({
  isPaused,
  simulationSpeed,
  onTogglePlay,
  onReset,
  onSpeedChange
}) => {
  return (
    <Card className={`p-4 transition-all duration-300 border-2 ${
      isPaused 
        ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border-amber-500/40 shadow-xl shadow-amber-500/5' 
        : 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border-emerald-500/40 shadow-xl shadow-emerald-500/10'
    }`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Indicator */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-lg ${
            isPaused 
              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
          }`}>
            {isPaused ? <Pause size={20} /> : <Play size={20} className="fill-emerald-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white uppercase tracking-wider">
                {isPaused ? 'Simulation Paused (Standby)' : 'Autonomous ANN Simulation Running'}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                isPaused 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 animate-pulse'
              }`}>
                {isPaused ? 'PAUSED' : 'LIVE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isPaused 
                ? 'Click "Start Simulation" to begin autonomous traffic signal dispatching.' 
                : 'PyTorch ANN is optimizing signal timings in real-time (sub-2ms latency).'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5 w-full md:w-auto justify-end">
          {/* Main Big Start/Pause Button */}
          <button
            onClick={onTogglePlay}
            className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl transition-all hover:scale-[1.03] active:scale-[0.97] ${
              isPaused
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-amber-500/30'
            }`}
          >
            {isPaused ? (
              <>
                <Play size={16} className="fill-white" /> Start Simulation
              </>
            ) : (
              <>
                <Pause size={16} className="fill-white" /> Pause Simulation
              </>
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="p-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 transition-all hover:scale-105 active:scale-95"
            title="Reset Traffic State"
          >
            <RotateCcw size={16} />
          </button>

          {/* Speed Selector Buttons */}
          <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <div className="px-2 py-1 flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase">
              <Gauge size={12} /> Speed:
            </div>
            {[1.0, 2.0, 4.0].map(speed => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-mono font-bold transition-all ${
                  simulationSpeed === speed
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
