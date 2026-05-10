import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  TrendingUp,
  Activity,
  AlertTriangle,
  Zap
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { JunctionMap } from '../components/JunctionMap';
import { DensityChart } from '../components/DensityChart';
import { AIDecisionFeed } from '../components/AIDecisionFeed';
import { EmergencyPanel } from '../components/EmergencyPanel';
import { useJunctionStore } from '../store/useJunctionStore';

const StatCard = ({ title, value, unit, icon: Icon, trend, color }: any) => (
  <Card className="flex-1">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-tighter mb-1">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">{value}</span>
          <span className="text-xs text-slate-500">{unit}</span>
        </div>
        {trend && (
          <div className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${trend > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            <TrendingUp size={10} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}% from last interval
          </div>
        )}
      </div>
      <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
        <Icon size={20} />
      </div>
    </div>
  </Card>
);

const OverviewPage = () => {
  const { 
    junctionState, 
    densityHistory,
    decisionLog,
    insightLog,
    emergencyActive,
    setEmergency,
    addInsight
  } = useJunctionStore();

  useEffect(() => {
      // Poll prediction endpoint every 2 minutes
      const fetchPrediction = async () => {
          try {
              const res = await fetch('http://localhost:8000/api/ai/prediction');
              const data = await res.json();
              addInsight(data);
          } catch(e) {
              console.error("Failed to fetch predictive insight", e);
          }
      };

      fetchPrediction(); // call immediately on mount
      const interval = setInterval(fetchPrediction, 120000); 
      return () => clearInterval(interval);
  }, [addInsight]);

  if (!junctionState) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-slate-500">Waiting for live data via WebSocket...</p>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Stats Row */}
      <div className="flex flex-col lg:flex-row gap-6">
        <StatCard 
          title="Avg Wait Time" 
          value={junctionState.lanes.north.avg_wait_seconds.toFixed(1)} 
          unit="s" 
          icon={Clock} 
          trend={-12.4}
          color="primary"
        />
        <StatCard 
          title="Vehicles Cleared" 
          value="847" 
          unit="/min" 
          icon={Users} 
          trend={8.2}
          color="emerald"
        />
        <StatCard 
          title="AI Latency" 
          value={junctionState.ai_decision?.latency_ms || 0} 
          unit="ms" 
          icon={Zap} 
          trend={-2.1}
          color="amber"
        />
        <StatCard 
          title="Congestion Risk" 
          value="Low" 
          unit="" 
          icon={Activity} 
          color="indigo"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main View: Junction Map */}
        <div className="xl:col-span-2 space-y-8">
          <Card className="relative overflow-hidden group">
            <CardHeader>
               <div>
                  <CardTitle>Live Junction State</CardTitle>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-mono">Real-time simulation active</p>
               </div>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center gap-12 py-10">
               <JunctionMap state={junctionState} />
               
               <div className="flex-1 w-full space-y-6">
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                     <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 rounded-full bg-primary-500" />
                        <span className="text-sm font-bold text-white uppercase tracking-tighter">Current Phase Details</span>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <div className="text-[10px] text-slate-500 uppercase">Active Lane</div>
                           <div className="text-lg font-bold text-white capitalize">{junctionState.current_phase}</div>
                        </div>
                        <div className="space-y-1">
                           <div className="text-[10px] text-slate-500 uppercase">Time Remaining</div>
                           <div className="text-lg font-bold text-primary-400 font-mono">
                             {junctionState.phase_duration_seconds - junctionState.phase_elapsed_seconds}s
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3">
                     <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lane Densities</div>
                     {Object.entries(junctionState.lanes).map(([name, data]) => (
                        <div key={name} className="flex items-center justify-between">
                           <span className="text-sm text-slate-300 capitalize">{name}</span>
                           <div className="flex items-center gap-3">
                              <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${data.density_percent}%` }}
                                    className={`h-full ${data.density_percent > 70 ? 'bg-rose-500' : 'bg-primary-500'}`} 
                                 />
                              </div>
                              <span className="text-xs font-mono text-slate-500">{data.vehicle_count}</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
               <CardTitle>Density Trends (5m)</CardTitle>
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-primary-500" />
                     <span className="text-[10px] text-slate-400 uppercase">North</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <div className="w-2 h-2 rounded-full bg-emerald-500" />
                     <span className="text-[10px] text-slate-400 uppercase">South</span>
                  </div>
               </div>
            </CardHeader>
            <CardContent>
               <DensityChart data={densityHistory} activeLane={junctionState.current_phase} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Emergency, AI Decision Feed & Insights */}
        <div className="space-y-8">
           <EmergencyPanel 
             isActive={emergencyActive} 
             onActivate={(dir, type) => {
                 setEmergency(true, dir);
                 fetch('http://localhost:8000/api/emergency/trigger', {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json' },
                     body: JSON.stringify({
                         direction: dir,
                         vehicle_type: type,
                         duration_override_seconds: 120
                     })
                 }).catch(console.error);
             }} 
             onCancel={() => {
                 setEmergency(false, null);
                 fetch('http://localhost:8000/api/emergency/cancel', { method: 'POST' }).catch(console.error);
             }} 
           />

           <Card className="h-fit">
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <Activity size={18} className="text-primary-500" />
                    AI Decision Engine
                 </CardTitle>
                 <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest">
                    Live
                 </div>
              </CardHeader>
              <CardContent>
                 <AIDecisionFeed decisions={decisionLog} />
              </CardContent>
           </Card>

           <Card className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border-indigo-500/20">
              <CardContent className="pt-6">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                       <TrendingUp size={20} />
                    </div>
                    <CardTitle className="text-indigo-100">Predictive Insight</CardTitle>
                 </div>
                 <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 mb-4 h-[120px] overflow-y-auto">
                    {insightLog.length > 0 ? (
                       <>
                          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase mb-2">
                             <AlertTriangle size={14} /> Risk: {insightLog[0].congestion_risk}
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">
                             {insightLog[0].recommendation}
                          </p>
                       </>
                    ) : (
                       <div className="h-full flex items-center justify-center text-sm text-indigo-300 italic">
                          Awaiting prediction model data...
                       </div>
                    )}
                 </div>
                 <Button variant="outline" size="sm" className="w-full border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10">
                    View Analysis
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewPage;
