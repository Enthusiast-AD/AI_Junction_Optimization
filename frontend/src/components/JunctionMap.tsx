import { motion } from 'framer-motion';
import { ShieldAlert, Cpu } from 'lucide-react';
import { type JunctionState } from '../types';

interface JunctionMapProps {
  state: JunctionState;
}

const Signal = ({ isActive, isEmergencyOverride, direction }: { phase: string; isActive: boolean; isEmergencyOverride: boolean; direction: 'N' | 'S' | 'E' | 'W' }) => {
  const showGreen = isActive || isEmergencyOverride;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold text-slate-500">{direction}</span>
      <div className="w-6 h-14 bg-slate-900 rounded-full border border-slate-800 p-1 flex flex-col gap-1 items-center">
        <div className={`w-4 h-4 rounded-full transition-colors duration-300 ${showGreen ? 'bg-red-500/10' : 'bg-red-500'} ${!showGreen ? 'shadow-[0_0_12px_rgba(239,68,68,0.5)]' : ''}`} />
        <div className={`w-4 h-4 rounded-full transition-colors duration-300 ${showGreen ? 'bg-green-500' : 'bg-green-500/10'} ${showGreen ? 'shadow-[0_0_12px_rgba(34,197,94,0.5)]' : ''}`} />
      </div>
    </div>
  );
};

const DensityBar = ({ count, direction }: { count: number; direction: 'N' | 'S' | 'E' | 'W' }) => {
  const max = 25;
  const percentage = Math.min((count / max) * 100, 100);
  
  const getColor = () => {
    if (percentage > 70) return 'bg-rose-500';
    if (percentage > 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const isVertical = direction === 'N' || direction === 'S';

  return (
    <div className={`flex items-center gap-2 ${isVertical ? 'flex-col' : 'flex-row'}`}>
       <div className={`${isVertical ? 'w-2 h-24' : 'w-24 h-2'} bg-slate-900 rounded-full overflow-hidden relative border border-slate-800`}>
          <motion.div 
            initial={{ [isVertical ? 'height' : 'width']: 0 }}
            animate={{ [isVertical ? 'height' : 'width']: `${percentage}%` }}
            className={`absolute bottom-0 left-0 w-full h-full transition-colors ${getColor()}`} 
          />
       </div>
    </div>
  );
};

export const JunctionMap = ({ state }: JunctionMapProps) => {
  return (
    <div className="relative w-full aspect-square max-w-[460px] mx-auto bg-[#0a0f1a] rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden">
      {/* Blueprint Grid */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      {/* North */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-8">
        <DensityBar count={state.lanes.north.vehicle_count} direction="N" />
        <Signal direction="N" phase="north" isActive={state.current_phase === 'north' && !state.emergency_active} isEmergencyOverride={state.emergency_active && state.emergency_direction === 'north'} />
      </div>

      {/* South */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center flex-row-reverse gap-8">
        <DensityBar count={state.lanes.south.vehicle_count} direction="S" />
        <Signal direction="S" phase="south" isActive={state.current_phase === 'south' && !state.emergency_active} isEmergencyOverride={state.emergency_active && state.emergency_direction === 'south'} />
      </div>

      {/* East */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-6">
        <Signal direction="E" phase="east" isActive={state.current_phase === 'east' && !state.emergency_active} isEmergencyOverride={state.emergency_active && state.emergency_direction === 'east'} />
        <DensityBar count={state.lanes.east.vehicle_count} direction="E" />
      </div>

      {/* West */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col-reverse items-center gap-6">
        <Signal direction="W" phase="west" isActive={state.current_phase === 'west' && !state.emergency_active} isEmergencyOverride={state.emergency_active && state.emergency_direction === 'west'} />
        <DensityBar count={state.lanes.west.vehicle_count} direction="W" />
      </div>

      {/* Center AI Core - Compact and integrated */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
         <div className={`w-14 h-14 rounded-2xl rotate-45 border flex items-center justify-center transition-all duration-700 shadow-2xl ${
            state.emergency_active ? 'bg-rose-500/20 border-rose-500' : 'bg-slate-900/95 border-primary-500/40'
         }`}>
            <div className="-rotate-45">
               {state.emergency_active ? (
                  <ShieldAlert className="text-rose-500 w-6 h-6 animate-pulse" />
               ) : (
                  <Cpu className="text-primary-400 w-6 h-6" />
               )}
            </div>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -inset-3 border border-dashed border-primary-500/10 rounded-full" />
         </div>
      </div>
    </div>
  );
};
