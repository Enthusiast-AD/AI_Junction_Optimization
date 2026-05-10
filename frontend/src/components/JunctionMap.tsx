import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Cpu, ArrowDown, ArrowUp, ArrowLeft, ArrowRight } from 'lucide-react';
import { type JunctionState } from '../types';

interface JunctionMapProps {
  state: JunctionState;
}

const LaneBadge = ({ 
  name, 
  direction, 
  count, 
  isActive, 
  positionClass 
}: { 
  name: string; 
  direction: 'N' | 'S' | 'E' | 'W'; 
  count: number; 
  isActive: boolean; 
  positionClass: string;
}) => {
  const getIcon = () => {
    switch(direction) {
      case 'N': return <ArrowDown size={14} className="text-slate-400" />;
      case 'S': return <ArrowUp size={14} className="text-slate-400" />;
      case 'E': return <ArrowLeft size={14} className="text-slate-400" />;
      case 'W': return <ArrowRight size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className={`absolute ${positionClass} z-30`}>
      <div className={`flex flex-col items-center bg-slate-900/80 backdrop-blur-xl border ${isActive ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20' : 'border-slate-700/50 shadow-lg'} rounded-xl p-2 w-28 transition-all duration-500`}>
        <div className="flex items-center justify-between w-full mb-1">
          <div className="flex items-center gap-1">
            {getIcon()}
            <span className="text-[10px] font-bold text-slate-200 uppercase tracking-wider">{name}</span>
          </div>
          <span className="text-xs font-mono font-bold text-white">{count}v</span>
        </div>
        
        {isActive ? (
          <motion.div 
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-full py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest text-center border border-emerald-500/30"
          >
            Green
          </motion.div>
        ) : (
          <div className="w-full py-0.5 rounded bg-rose-500/10 text-rose-400 text-[10px] font-bold uppercase tracking-widest text-center border border-rose-500/20">
            Red
          </div>
        )}
      </div>
    </div>
  );
};

export const JunctionMap = ({ state }: JunctionMapProps) => {
  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto bg-[#1c1c1c] rounded-[32px] border border-slate-800 shadow-[0_0_40px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col">
      
      {/* Realistic Grass/Environment Background (subtle) */}
      <div className="absolute inset-0 bg-[#242c24] opacity-50 pointer-events-none" />

      {/* SVG Road Network */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
         <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-xl">
            
            {/* North-South Road Base (Asphalt) */}
            <rect x="130" y="0" width="140" height="400" fill="#2d2d30" />
            {/* East-West Road Base (Asphalt) */}
            <rect x="0" y="130" width="400" height="140" fill="#2d2d30" />
            
            {/* Center Intersection */}
            <rect x="130" y="130" width="140" height="140" fill="#2a2a2d" />

            {/* Glowing Highlights for Active Phase */}
            <AnimatePresence>
               {(state.current_phase === 'north' || state.current_phase === 'south') && (
                  <motion.rect 
                    initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}
                    x="130" y="0" width="140" height="400" fill="#10b981" 
                  />
               )}
               {(state.current_phase === 'east' || state.current_phase === 'west') && (
                  <motion.rect 
                    initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}
                    x="0" y="130" width="400" height="140" fill="#10b981" 
                  />
               )}
            </AnimatePresence>

            {/* Lane Dividers (Double Yellow Lines in middle, white dashed for lanes) */}
            <g strokeWidth="2">
                {/* Vertical Double Yellow */}
                <line x1="198" y1="0" x2="198" y2="130" stroke="#eab308" />
                <line x1="202" y1="0" x2="202" y2="130" stroke="#eab308" />
                <line x1="198" y1="270" x2="198" y2="400" stroke="#eab308" />
                <line x1="202" y1="270" x2="202" y2="400" stroke="#eab308" />
                
                {/* Horizontal Double Yellow */}
                <line x1="0" y1="198" x2="130" y2="198" stroke="#eab308" />
                <line x1="0" y1="202" x2="130" y2="202" stroke="#eab308" />
                <line x1="270" y1="198" x2="400" y2="198" stroke="#eab308" />
                <line x1="270" y1="202" x2="400" y2="202" stroke="#eab308" />

                {/* White dashed separating same-direction lanes if there were multiple, 
                    but here we assume 1 lane each direction, so we just add subtle shoulder lines */}
                <line x1="135" y1="0" x2="135" y2="130" stroke="#ffffff" strokeOpacity="0.5" />
                <line x1="265" y1="0" x2="265" y2="130" stroke="#ffffff" strokeOpacity="0.5" />
                <line x1="135" y1="270" x2="135" y2="400" stroke="#ffffff" strokeOpacity="0.5" />
                <line x1="265" y1="270" x2="265" y2="400" stroke="#ffffff" strokeOpacity="0.5" />

                <line x1="0" y1="135" x2="130" y2="135" stroke="#ffffff" strokeOpacity="0.5" />
                <line x1="0" y1="265" x2="130" y2="265" stroke="#ffffff" strokeOpacity="0.5" />
                <line x1="270" y1="135" x2="400" y2="135" stroke="#ffffff" strokeOpacity="0.5" />
                <line x1="270" y1="265" x2="400" y2="265" stroke="#ffffff" strokeOpacity="0.5" />
            </g>
            
            {/* Thick White Stop Lines & Zebra Crossings */}
            <g>
                {/* North Stop */}
                <line x1="130" y1="130" x2="198" y2="130" stroke="#ffffff" strokeWidth="6" />
                {/* South Stop */}
                <line x1="202" y1="270" x2="270" y2="270" stroke="#ffffff" strokeWidth="6" />
                {/* West Stop */}
                <line x1="130" y1="202" x2="130" y2="270" stroke="#ffffff" strokeWidth="6" />
                {/* East Stop */}
                <line x1="270" y1="130" x2="270" y2="198" stroke="#ffffff" strokeWidth="6" />
            </g>

            {/* Realistic Vehicles (Rectangles instead of dots) */}
            <g>
               {state.current_phase === 'north' && [...Array(Math.min(5, Math.ceil(state.lanes.north.vehicle_count / 3)))].map((_, i) => (
                  <motion.rect key={`n-${i}`} width="12" height="24" rx="3" fill="#e2e8f0" filter="drop-shadow(0 4px 4px rgba(0,0,0,0.5))" animate={{ y: [-30, 400] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: "linear" }} x="160" />
               ))}
               {state.current_phase === 'south' && [...Array(Math.min(5, Math.ceil(state.lanes.south.vehicle_count / 3)))].map((_, i) => (
                  <motion.rect key={`s-${i}`} width="12" height="24" rx="3" fill="#e2e8f0" filter="drop-shadow(0 4px 4px rgba(0,0,0,0.5))" animate={{ y: [400, -30] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: "linear" }} x="228" />
               ))}
               {state.current_phase === 'east' && [...Array(Math.min(5, Math.ceil(state.lanes.east.vehicle_count / 3)))].map((_, i) => (
                  <motion.rect key={`e-${i}`} width="24" height="12" rx="3" fill="#e2e8f0" filter="drop-shadow(0 4px 4px rgba(0,0,0,0.5))" animate={{ x: [400, -30] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: "linear" }} y="160" />
               ))}
               {state.current_phase === 'west' && [...Array(Math.min(5, Math.ceil(state.lanes.west.vehicle_count / 3)))].map((_, i) => (
                  <motion.rect key={`w-${i}`} width="24" height="12" rx="3" fill="#e2e8f0" filter="drop-shadow(0 4px 4px rgba(0,0,0,0.5))" animate={{ x: [-30, 400] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: "linear" }} y="228" />
               ))}
            </g>
         </svg>
      </div>

      {/* Floating Status Badges - Placed on the entry lanes */}
      <LaneBadge name="North" direction="N" count={state.lanes.north.vehicle_count} isActive={state.current_phase === 'north'} positionClass="top-4 left-1/2 -translate-x-1/2" />
      <LaneBadge name="South" direction="S" count={state.lanes.south.vehicle_count} isActive={state.current_phase === 'south'} positionClass="bottom-12 left-1/2 -translate-x-1/2" />
      <LaneBadge name="East"  direction="E" count={state.lanes.east.vehicle_count}  isActive={state.current_phase === 'east'} positionClass="top-1/2 right-4 -translate-y-1/2" />
      <LaneBadge name="West"  direction="W" count={state.lanes.west.vehicle_count}  isActive={state.current_phase === 'west'} positionClass="top-1/2 left-4 -translate-y-1/2" />

      {/* Premium AI Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
         <div className="relative flex items-center justify-center">
            {/* Elegant Rings */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-16 h-16 rounded-full border border-slate-500/30 border-t-emerald-500" />
            
            <div className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg border-2 transition-colors duration-500 ${
               state.emergency_active ? 'bg-rose-950/90 border-rose-500 shadow-rose-500/40' : 'bg-slate-900/90 border-emerald-500/50 shadow-emerald-500/10'
            }`}>
               {state.emergency_active ? (
                  <ShieldAlert className="text-rose-500 w-5 h-5 animate-pulse" />
               ) : (
                  <Cpu className="text-emerald-400 w-5 h-5" />
               )}
            </div>
         </div>
      </div>

      {/* System Uplink Status Bar */}
      <div className="absolute bottom-0 left-0 w-full bg-slate-950/95 border-t border-slate-800/80 p-2 px-4 z-40 flex items-center justify-between backdrop-blur-md">
         <div className="flex items-center gap-2">
            <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] font-mono font-bold text-emerald-500/80 uppercase tracking-widest">System Uplink Active</span>
         </div>
         <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Model: {state.ai_decision?.model_used || 'Initializing'}</span>
      </div>
    </div>
  );
};
