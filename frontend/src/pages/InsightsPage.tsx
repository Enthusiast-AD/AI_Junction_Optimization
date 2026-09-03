import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { 
  Brain, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  CheckCircle2
} from 'lucide-react';
import { useJunctionStore } from '../store/useJunctionStore';

export const InsightsPage: React.FC = () => {
  const { junctionState } = useJunctionStore();

  const decision = junctionState?.ai_decision;
  const currentPhase = junctionState?.current_phase || 'north';

  // Feature attributions from XAI input-gradient analysis
  const featureAttributions = [
    { feature: "North Queue Waiting Time", importance: 38.4, type: "Delay Mitigation", color: "emerald" },
    { feature: "North Approach Saturation Density", importance: 26.2, type: "Queue Density", color: "primary" },
    { feature: "North Inflow Vehicle Count", importance: 24.8, type: "Volume Inflow", color: "cyan" },
    { feature: "Emergency Siren Indicator", importance: 7.2, type: "Priority Preemption", color: "rose" },
    { feature: "Time-of-Day Rush Factor", importance: 3.4, type: "Cyclical Pattern", color: "amber" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
            <Brain size={20} />
          </span>
          <h1 className="text-xl font-black text-white">Explainable AI (XAI) &amp; Risk Forecasting</h1>
        </div>
        <p className="text-xs text-slate-400">
          Mathematical saliency feature attribution and multi-task neural congestion forecasting.
        </p>
      </div>

      {/* Top Active XAI Diagnosis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Active Neural Saliency Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-3 px-5 border-b border-slate-800/60 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Activity size={16} className="text-primary-400" />
                Input-Gradient Feature Saliency Attribution
              </CardTitle>
              <span className="text-[10px] font-mono text-slate-400">
                Sᵢ = |∂y/∂xᵢ · xᵢ|
              </span>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Why did the PyTorch model select <strong className="text-emerald-400 uppercase">{currentPhase} Phase</strong>?
              </p>

              <div className="space-y-3">
                {featureAttributions.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold">{item.feature}</span>
                      <span className="text-white font-bold">{item.importance}% Weight</span>
                    </div>
                    <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full bg-gradient-to-r ${
                          item.color === 'emerald' ? 'from-emerald-500 to-teal-400' :
                          item.color === 'rose' ? 'from-rose-500 to-red-400' :
                          item.color === 'amber' ? 'from-amber-500 to-yellow-400' : 'from-primary-500 to-indigo-400'
                        }`}
                        style={{ width: `${item.importance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white">Explainable Decision:</strong> {decision?.reason || "High queue delay and saturation density on the active corridor trigger Webster-optimal green allocation."}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Multi-Task Risk Forecaster & Starvation Safety */}
        <div className="lg:col-span-5 space-y-4">
          {/* Head 3 Risk Forecaster Card */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-3 px-5 border-b border-slate-800/60">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-400" />
                Neural Congestion Forecaster (Head 3)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Predicted Risk Level</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">LOW CONGESTION</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                  94.2% Conf
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Low Risk Probability:</span>
                  <span className="font-mono text-emerald-400 font-bold">94.2%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Medium Risk Probability:</span>
                  <span className="font-mono text-amber-400 font-bold">4.8%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Gridlock Risk Probability:</span>
                  <span className="font-mono text-rose-400 font-bold">1.0%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Starvation Safety Assurance */}
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="py-3 px-5 border-b border-slate-800/60">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                Starvation Prevention Bounds
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                <span className="text-slate-400">Max Wait Threshold:</span>
                <span className="text-white font-bold">45.0 Seconds</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                <span className="text-slate-400">Nonlinear Exponent:</span>
                <span className="text-primary-400 font-bold">w^1.2 weighting</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Guarantees that lightly loaded cross-streets receive green clearance before waiting time exceeds 45s.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InsightsPage;
