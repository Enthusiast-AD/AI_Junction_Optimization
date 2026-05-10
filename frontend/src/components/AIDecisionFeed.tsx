import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Cpu } from 'lucide-react';
import { type AIDecision } from '../types';

interface AIDecisionFeedProps {
  decisions: AIDecision[];
}

export const AIDecisionFeed = ({ decisions }: AIDecisionFeedProps) => {
  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
      <AnimatePresence initial={false}>
        {decisions.map((decision, index) => (
          <motion.div
            key={`${decision.recommended_phase}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-4"
          >
            <div className={`mt-1 p-2 rounded-lg ${
              decision.model_used.includes('llama') ? 'bg-primary-500/10 text-primary-500' :
              decision.model_used.includes('gemini') ? 'bg-emerald-500/10 text-emerald-500' :
              'bg-slate-500/10 text-slate-500'
            }`}>
              {decision.model_used.includes('llama') ? <Cpu size={18} /> : <Brain size={18} />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Phase: {decision.recommended_phase}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {decision.latency_ms}ms
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 italic">
                "{decision.reason}"
              </p>
              <div className="mt-2 flex items-center gap-3">
                 <div className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-medium text-slate-300">
                    {decision.duration_seconds}s duration
                 </div>
                 <div className="px-2 py-0.5 rounded-md bg-primary-500/10 text-[10px] font-medium text-primary-400">
                    {decision.model_used}
                 </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {decisions.length === 0 && (
        <div className="py-8 text-center text-slate-500 text-sm italic">
          Awaiting system decisions...
        </div>
      )}
    </div>
  );
};
