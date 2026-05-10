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
        {decisions.slice(0, 3).map((decision, index) => (
          <motion.div
            key={`${decision.recommended_phase}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-3"
          >
            <div className={`mt-0.5 p-1.5 rounded-lg ${
              decision.model_used.includes('llama') ? 'bg-primary-500/10 text-primary-500' :
              decision.model_used.includes('gemini') ? 'bg-emerald-500/10 text-emerald-500' :
              'bg-slate-500/10 text-slate-500'
            }`}>
              {decision.model_used.includes('llama') ? <Cpu size={16} /> : <Brain size={16} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Phase: {decision.recommended_phase}
                </span>
                <span className="text-[9px] font-mono text-slate-500">
                  {decision.latency_ms}ms
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate italic">
                "{decision.reason}"
              </p>
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
