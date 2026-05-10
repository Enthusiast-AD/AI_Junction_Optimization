import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  TrendingUp,
  Activity,
  AlertTriangle,
  Zap,
  Brain
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { JunctionMap } from '../components/JunctionMap';
import { DensityChart } from '../components/DensityChart';
import { AIDecisionFeed } from '../components/AIDecisionFeed';
import { EmergencyPanel } from '../components/EmergencyPanel';
import { useJunctionStore } from '../store/useJunctionStore';

const StatCard = ({ title, value, unit, icon: Icon, color }: any) => (
  <Card className="flex-1 p-4 py-3">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mb-0.5">{title}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-black text-white">{value}</span>
          <span className="text-[10px] text-slate-500">{unit}</span>
        </div>
      </div>
      <div className={`p-2 rounded-lg bg-${color}-500/10 text-${color}-500`}>
        <Icon size={18} />
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
    connectionStatus,
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 max-w-[1600px] mx-auto"
    >
      {/* Top Stats Row */}
      <div className="flex flex-wrap gap-4">
        <StatCard 
          title="Avg Wait Time" 
          value={junctionState.performance?.avg_wait_seconds.toFixed(1) || "0.0"} 
          unit="s" 
          icon={Clock} 
          trend={12.4} 
          color="primary" 
        />
        <StatCard 
          title="Vehicles Cleared" 
          value={junctionState.performance?.total_vehicles_cleared || "0"} 
          unit="/min" 
          icon={Users} 
          trend={8.2} 
          color="emerald" 
        />
        <StatCard 
          title="AI Latency" 
          value={junctionState.ai_decision?.latency_ms || "0"} 
          unit="ms" 
          icon={Zap} 
          trend={-2.1} 
          color="amber" 
        />
        <StatCard 
          title="Congestion Risk" 
          value={insightLog[0]?.congestion_risk.toUpperCase() || "LOW"} 
          unit="" 
          icon={Activity} 
          color="indigo" 
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* Main Junction View Column */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <Card className="overflow-hidden bg-[#0f172a]/20">
            <CardHeader className="py-3 border-b border-slate-800/50">
                <div className="flex items-center justify-between w-full pr-4">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                       Live Junction State
                    </CardTitle>
                    <p className="text-[9px] font-mono tracking-widest mt-1 uppercase flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 
                        connectionStatus === 'connecting' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                      }`} />
                      <span className={connectionStatus === 'connected' ? 'text-emerald-500/80 font-bold' : 'text-slate-500'}>
                        {connectionStatus === 'connected' ? 'Live System Connected' : 
                         connectionStatus === 'connecting' ? 'Connecting to Backend...' : 'System Offline'}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-12">
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Phase</p>
                       <p className="text-base font-bold text-primary-400 uppercase tracking-widest">{junctionState.current_phase}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Time Remaining</p>
                       <p className="text-base font-bold text-white font-mono">{junctionState.phase_duration_seconds - junctionState.phase_elapsed_seconds}s</p>
                    </div>
                  </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col md:flex-row items-center">
              <div className="p-4 flex-1 flex justify-center">
                <JunctionMap state={junctionState} />
              </div>
              
              {/* Lane Info Column */}
              <div className="p-4 space-y-3 w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-800/50 bg-slate-900/20">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Lane Densities</p>
                {Object.entries(junctionState.lanes).map(([name, data]) => (
                  <div key={name} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/30">
                    <div className="flex justify-between text-[10px] mb-1.5">
                      <span className="text-slate-400 font-bold uppercase tracking-tighter">{name}</span>
                      <span className="text-white font-mono font-bold">{data.vehicle_count}v</span>
                    </div>
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${data.density_percent}%` }}
                        className={`h-full ${
                          data.density_percent > 80 ? 'bg-rose-500' :
                          data.density_percent > 50 ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#0f172a]/20">
            <CardHeader className="py-3">
               <CardTitle className="text-sm">Density Trends (5m)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
               <DensityChart data={densityHistory} activeLane={junctionState.current_phase} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Emergency, AI Decision Feed & Insights */}
        <div className="xl:col-span-4 space-y-8">
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

          <Card className="bg-[#0f172a]/20">
            <CardHeader className="py-3">
               <div className="flex items-center justify-between w-full">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain size={16} className="text-primary-400" />
                    AI Decision Engine
                  </CardTitle>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest animate-pulse">Live</span>
               </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
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
