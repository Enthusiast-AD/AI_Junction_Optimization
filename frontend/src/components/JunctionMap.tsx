import { motion } from 'framer-motion';
import { ShieldAlert, Cpu } from 'lucide-react';
import { type JunctionState } from '../types';

interface JunctionMapProps {
  state: JunctionState;
}

const LaneLabel = ({ name, data, isActive, position }: { name: string; data: any; isActive: boolean; position: string }) => {
  return (
    <div className={`absolute ${position} flex flex-col items-center z-20 pointer-events-none`}>
       {/* Glowing Lane Marker */}
       <div className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-widest transition-all duration-500 shadow-xl ${
         isActive 
           ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20 scale-110' 
           : 'bg-slate-900/80 text-slate-500 border-slate-700 opacity-60'
       }`}>
         {name}
       </div>
       
       {/* Real-time Stat Overlay */}
       <div className="mt-1 flex flex-col items-center">
          <div className="flex items-baseline gap-1">
             <span className={`text-sm font-black transition-colors duration-500 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                {data.vehicle_count}
             </span>
             <span className="text-[7px] font-bold text-slate-600 uppercase">Veh</span>
          </div>
          {isActive && (
             <motion.div 
               animate={{ opacity: [0.4, 1, 0.4] }}
               transition={{ repeat: Infinity, duration: 1.5 }}
               className="text-[7px] font-black text-emerald-400 uppercase tracking-tighter"
             >
               Moving
             </motion.div>
          )}
       </div>
    </div>
  );
};

export const JunctionMap = ({ state }: JunctionMapProps) => {
  return (
    <div className="relative w-full aspect-square max-w-[460px] mx-auto bg-[#0a0f1a] rounded-[32px] border border-slate-800 shadow-2xl overflow-hidden">
      {/* Blueprint Grid */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      {/* Road Network SVG */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
         <svg viewBox="0 0 400 400" className="w-full h-full">
            {/* Base Roads */}
            <rect x="150" y="0" width="100" height="400" fill="#111827" rx="4" />
            <rect x="0" y="150" width="400" height="100" fill="#111827" rx="4" />
            
            {/* Lane Glow */}
            {(state.current_phase === 'north' || state.current_phase === 'south') ? (
               <rect x="150" y="0" width="100" height="400" fill="url(#activeGlowVert)" opacity="0.1" />
            ) : (
               <rect x="0" y="150" width="400" height="100" fill="url(#activeGlowHoriz)" opacity="0.1" />
            )}

            {/* Lane Markings */}
            <path d="M 200 0 V 150 M 200 250 V 400 M 0 200 H 150 M 250 200 H 400" stroke="#1e293b" strokeWidth="1" strokeDasharray="8 8" fill="none" />
            
            {/* Animated Traffic Particles */}
            <g>
               {state.current_phase === 'north' && [...Array(4)].map((_, i) => (
                  <motion.circle key={`n-${i}`} r="2.5" fill="#10b981" animate={{ cy: [0, 400] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6, ease: "linear" }} style={{ cx: 175 }} />
               ))}
               {state.current_phase === 'south' && [...Array(4)].map((_, i) => (
                  <motion.circle key={`s-${i}`} r="2.5" fill="#10b981" animate={{ cy: [400, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6, ease: "linear" }} style={{ cx: 225 }} />
               ))}
               {state.current_phase === 'east' && [...Array(4)].map((_, i) => (
                  <motion.circle key={`e-${i}`} r="2.5" fill="#10b981" animate={{ cx: [400, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6, ease: "linear" }} style={{ cy: 175 }} />
               ))}
               {state.current_phase === 'west' && [...Array(4)].map((_, i) => (
                  <motion.circle key={`w-${i}`} r="2.5" fill="#10b981" animate={{ cx: [0, 400] }} transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.6, ease: "linear" }} style={{ cy: 225 }} />
               ))}
            </g>

            <defs>
               <linearGradient id="activeGlowVert" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
               </linearGradient>
               <linearGradient id="activeGlowHoriz" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
               </linearGradient>
            </defs>
         </svg>
      </div>

      {/* Lane Labels - Placed INSIDE roads */}
      <LaneLabel name="North" data={state.lanes.north} isActive={state.current_phase === 'north'} position="top-6 left-1/2 -translate-x-1/2" />
      <LaneLabel name="South" data={state.lanes.south} isActive={state.current_phase === 'south'} position="bottom-6 left-1/2 -translate-x-1/2" />
      <LaneLabel name="West" data={state.lanes.west} isActive={state.current_phase === 'west'} position="top-1/2 left-6 -translate-y-1/2" />
      <LaneLabel name="East" data={state.lanes.east} isActive={state.current_phase === 'east'} position="top-1/2 right-6 -translate-y-1/2" />

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
