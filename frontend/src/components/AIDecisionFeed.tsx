import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu, CheckCircle2 } from 'lucide-react';
import { type AIDecision } from '../types';

interface AIDecisionFeedProps {
  decisions: AIDecision[];
}

export const AIDecisionFeed = ({ decisions }: AIDecisionFeedProps) => {
  return (
    <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
      <AnimatePresence initial={false}>
        {decisions.slice(0, 5).map((decision, index) => (
          <motion.div
            key={`${decision.recommended_phase}-${index}`}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50 flex items-start gap-4 transition-all hover:bg-slate-900/50 hover:border-slate-700"
          >
            <div className={`mt-1 p-2 rounded-xl shrink-0 ${
              decision.model_used.includes('ANN') || decision.model_used.includes('PyTorch')
                ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' 
                : decision.model_used.includes('Emergency')
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
            }`}>
              {decision.model_used.includes('Emergency') ? <Cpu size={18} /> : <Brain size={18} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white uppercase tracking-tighter">
                    Phase {decision.recommended_phase}
                  </span>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-bold text-emerald-500 border border-emerald-500/20">
                    <CheckCircle2 size={10} /> Optimized
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                  {decision.latency_ms}ms
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                {decision.reason}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${decision.confidence * 100}%` }}
                     className="h-full bg-primary-500"
                   />
                </div>
                <span className="text-[9px] font-black text-slate-500">{(decision.confidence * 100).toFixed(0)}% CONF</span>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {decisions.length === 0 && (
        <div className="py-12 text-center">
           <div className="inline-flex p-4 rounded-full bg-slate-900 mb-4">
              <Brain className="w-8 h-8 text-slate-700 animate-pulse" />
           </div>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Neural Link Syncing...</p>
        </div>
      )}
    </div>
  );
};
