import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap } from 'lucide-react';
import { type JunctionState } from '../types';

interface JunctionMapProps {
  state: JunctionState;
  onEmergencyTrigger?: (direction: string) => void;
}

const Signal = ({ isActive, direction }: { phase: string; isActive: boolean; direction: 'N' | 'S' | 'E' | 'W' }) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold text-slate-500">{direction}</span>
      <div className="w-6 h-14 bg-slate-900 rounded-full border border-slate-800 p-1 flex flex-col gap-1 items-center">
        <div className={`w-4 h-4 rounded-full transition-colors duration-300 ${!isActive ? 'bg-red-500/10' : 'bg-red-500/20'}`} />
        <div className={`w-4 h-4 rounded-full transition-colors duration-300 ${isActive ? 'bg-green-500' : 'bg-green-500/10'} ${isActive ? 'shadow-[0_0_12px_rgba(34,197,94,0.5)]' : ''}`} />
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
       <span className="text-xs font-mono text-slate-400">{count}</span>
    </div>
  );
};

export const JunctionMap = ({ state }: JunctionMapProps) => {
  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-slate-900/50 rounded-3xl border border-slate-800 p-8 overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px]" />
      
      {/* Emergency Flash */}
      <AnimatePresence>
        {state.emergency_active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.2, 0] }}
            exit={{ opacity: 0 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute inset-0 bg-rose-500 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Junction SVG Paths */}
      <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full">
         {/* Roads */}
         <path d="M 160 0 L 160 400 M 240 0 L 240 400" stroke="#1e293b" strokeWidth="2" fill="none" />
         <path d="M 0 160 L 400 160 M 0 240 L 400 240" stroke="#1e293b" strokeWidth="2" fill="none" />
         
         {/* Road Marks */}
         <path d="M 200 0 V 160 M 200 240 V 400 M 0 200 H 160 M 240 200 H 400" stroke="#334155" strokeWidth="2" strokeDasharray="8 8" fill="none" />
         
         {/* Intersection Center */}
         <rect x="160" y="160" width="80" height="80" fill="#0f172a" />
      </svg>

      {/* Signals and Density Bars */}
      
      {/* North */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-8">
        <DensityBar count={state.lanes.north.vehicle_count} direction="N" />
        <Signal direction="N" phase="north" isActive={state.current_phase === 'north'} />
      </div>

      {/* South */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center flex-row-reverse gap-8">
        <DensityBar count={state.lanes.south.vehicle_count} direction="S" />
        <Signal direction="S" phase="south" isActive={state.current_phase === 'south'} />
      </div>

      {/* East */}
      <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col items-center gap-6">
        <Signal direction="E" phase="east" isActive={state.current_phase === 'east'} />
        <DensityBar count={state.lanes.east.vehicle_count} direction="E" />
      </div>

      {/* West */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 flex flex-col-reverse items-center gap-6">
        <Signal direction="W" phase="west" isActive={state.current_phase === 'west'} />
        <DensityBar count={state.lanes.west.vehicle_count} direction="W" />
      </div>

      {/* Center AI Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
         <div className="w-20 h-20 rounded-full glass border border-primary-500/30 flex items-center justify-center shadow-2xl shadow-primary-500/20">
            {state.emergency_active ? (
              <ShieldAlert className="text-rose-500 w-8 h-8 animate-pulse" />
            ) : (
              <Zap className="text-primary-500 w-8 h-8" />
            )}
            
            {/* Phase Timer Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
               <circle 
                 cx="40" cy="40" r="38" 
                 fill="none" 
                 stroke="#4f46e5" 
                 strokeWidth="2" 
                 strokeDasharray="239"
                 strokeDashoffset={239 - (239 * (state.phase_elapsed_seconds / state.phase_duration_seconds))}
                 className="transition-all duration-1000 ease-linear"
               />
            </svg>
         </div>
      </div>
    </div>
  );
};
