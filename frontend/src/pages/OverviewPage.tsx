import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Clock, 

  Activity,
  AlertTriangle,
  Zap,
  Sparkles,
  Brain
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { JunctionMap } from '../components/JunctionMap';
import { DensityChart } from '../components/DensityChart';
import { AIDecisionFeed } from '../components/AIDecisionFeed';
import { EmergencyPanel } from '../components/EmergencyPanel';
import { useJunctionStore } from '../store/useJunctionStore';
import { generateMockHistory } from '../utils/mockData';

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
    appendDensityPoint,
    decisionLog,
    emergencyActive,
    sendMessage,
    insightLog,
    connectionStatus
  } = useJunctionStore();

  useEffect(() => {
    if (densityHistory.length === 0) {
      generateMockHistory(30).forEach(point => appendDensityPoint(point));
    }
  }, []);

  const handleEmergencyActivate = (direction: string, vehicleType: string) => {
    sendMessage({
      type: 'trigger_emergency',
      data: { direction, vehicle_type: vehicleType }
    });
  };

  const handleEmergencyCancel = () => {
    sendMessage({
      type: 'cancel_emergency'
    });
  };

  if (!junctionState) return null;

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

        {/* Sidebar Column */}
        <div className="xl:col-span-4 space-y-4">
          <EmergencyPanel 
            isActive={emergencyActive} 
            onActivate={handleEmergencyActivate}
            onCancel={handleEmergencyCancel}
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

          <Card className="bg-indigo-950/10 border-indigo-500/10 overflow-hidden relative group">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
             <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                   <Sparkles size={16} className="text-indigo-400" />
                   <CardTitle className="text-sm text-indigo-100">Predictive Insight</CardTitle>
                </div>
                
                {insightLog[0] ? (
                  <>
                    <div className={`p-3 rounded-xl border mb-3 ${
                      insightLog[0].congestion_risk === 'high' ? 'bg-rose-500/10 border-rose-500/20' :
                      insightLog[0].congestion_risk === 'medium' ? 'bg-amber-500/10 border-amber-500/20' :
                      'bg-emerald-500/10 border-emerald-500/20'
                    }`}>
                      <div className={`flex items-center gap-1.5 text-[9px] font-black uppercase mb-1.5 ${
                        insightLog[0].congestion_risk === 'high' ? 'text-rose-400' :
                        insightLog[0].congestion_risk === 'medium' ? 'text-amber-400' :
                        'text-emerald-400'
                      }`}>
                          <AlertTriangle size={12} /> {insightLog[0].congestion_risk} Risk
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed italic">
                          "{insightLog[0].summary}"
                      </p>
                    </div>
                    <Link to="/dashboard/insights">
                      <Button variant="outline" size="sm" className="w-full h-8 text-[10px] border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10">
                          View Full Analysis
                      </Button>
                    </Link>
                  </>
                ) : (
                  <div className="py-6 text-center border border-dashed border-slate-800 rounded-xl">
                     <p className="text-[10px] text-slate-500 italic">Analyzing traffic patterns...</p>
                  </div>
                )}
             </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewPage;
