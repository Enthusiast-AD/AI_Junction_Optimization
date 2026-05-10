import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, ScatterChart, Scatter, XAxis, YAxis, ZAxis } from 'recharts';
import { Clock, TrendingUp, ShieldAlert, ArrowDown } from 'lucide-react';
import { type AIDecision } from '../types';

const mockDecisions: (AIDecision & { timestamp: string })[] = [
  { timestamp: '10:45:22', recommended_phase: 'north', duration_seconds: 45, reason: 'High density detected. Extended green phase.', model_used: 'llama-3.1-8b-instant', latency_ms: 182, confidence: 0.94 },
  { timestamp: '10:44:15', recommended_phase: 'east', duration_seconds: 30, reason: 'Clearing medium queue before peak hour.', model_used: 'llama-3.1-8b-instant', latency_ms: 195, confidence: 0.88 },
  { timestamp: '10:42:05', recommended_phase: 'south', duration_seconds: 60, reason: 'EMERGENCY OVERRIDE: Ambulance approaching.', model_used: 'rule-based-override', latency_ms: 12, confidence: 1.0 },
  { timestamp: '10:40:30', recommended_phase: 'west', duration_seconds: 25, reason: 'Low traffic volume. Short cycle applied.', model_used: 'llama-3.1-8b-instant', latency_ms: 178, confidence: 0.91 },
  { timestamp: '10:38:10', recommended_phase: 'north', duration_seconds: 50, reason: 'Preemptive clearing based on Gemini forecast.', model_used: 'gemini-2.5-flash', latency_ms: 450, confidence: 0.85 },
];

const phaseData = [
  { name: 'North', value: 45, color: '#3b82f6' },
  { name: 'South', value: 25, color: '#10b981' },
  { name: 'East', value: 20, color: '#f59e0b' },
  { name: 'West', value: 10, color: '#8b5cf6' },
];

const heatmapData = [
  { time: '10:00', lane: 1, density: 40 }, { time: '10:00', lane: 2, density: 10 }, { time: '10:00', lane: 3, density: 20 }, { time: '10:00', lane: 4, density: 5 },
  { time: '10:15', lane: 1, density: 60 }, { time: '10:15', lane: 2, density: 15 }, { time: '10:15', lane: 3, density: 30 }, { time: '10:15', lane: 4, density: 10 },
  { time: '10:30', lane: 1, density: 85 }, { time: '10:30', lane: 2, density: 25 }, { time: '10:30', lane: 3, density: 45 }, { time: '10:30', lane: 4, density: 15 },
  { time: '10:45', lane: 1, density: 50 }, { time: '10:45', lane: 2, density: 12 }, { time: '10:45', lane: 3, density: 25 }, { time: '10:45', lane: 4, density: 8 },
];

const AnalyticsPage = () => {
  const [filter, setFilter] = useState('all');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Performance Analytics</h1>
        <p className="text-slate-400">Deep dive into AI optimization metrics and historical data.</p>
      </div>

      {/* Performance Comparison */}
      <section>
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">AI vs Fixed Timing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Clock size={20} /></div>
                <div className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                  <ArrowDown size={12} className="mr-1" /> 46%
                </div>
              </div>
              <div className="text-2xl font-bold text-white">22.4s</div>
              <div className="text-xs text-slate-400 mt-1">Avg Wait (vs 41.7s fixed)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-primary-500/10 text-primary-500 rounded-lg"><TrendingUp size={20} /></div>
                <div className="flex items-center text-primary-400 text-xs font-bold bg-primary-500/10 px-2 py-1 rounded-full">
                  <TrendingUp size={12} className="mr-1" /> 38%
                </div>
              </div>
              <div className="text-2xl font-bold text-white">847/hr</div>
              <div className="text-xs text-slate-400 mt-1">Throughput (vs 612 fixed)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg"><ShieldAlert size={20} /></div>
                <div className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                  <ArrowDown size={12} className="mr-1" /> 96%
                </div>
              </div>
              <div className="text-2xl font-bold text-white">1.8s</div>
              <div className="text-xs text-slate-400 mt-1">Emergency Clear (vs 45s fixed)</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg"><TrendingUp size={20} /></div>
                <div className="flex items-center text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
                  <ArrowDown size={12} className="mr-1" /> 52%
                </div>
              </div>
              <div className="text-2xl font-bold text-white">58.1s</div>
              <div className="text-xs text-slate-400 mt-1">Peak Wait (vs 120s fixed)</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Phase Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Phase Distribution (Last 24h)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={phaseData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {phaseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4">
              {phaseData.map(d => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-slate-300">{d.name} ({d.value}%)</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Heatmap (Scatter proxy) */}
        <Card>
          <CardHeader>
            <CardTitle>Congestion Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <XAxis dataKey="time" type="category" name="Time" stroke="#475569" />
                  <YAxis dataKey="lane" type="number" name="Lane" domain={[0, 5]} tickFormatter={(val) => ['N', 'S', 'E', 'W'][val-1] || ''} stroke="#475569" />
                  <ZAxis dataKey="density" type="number" range={[50, 400]} name="Density" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                  <Scatter name="Congestion" data={heatmapData} fill="#ef4444" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decision Log */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>AI Decision Log</CardTitle>
          <select 
            className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Models</option>
            <option value="llama-3.1-8b-instant">Groq Llama 3</option>
            <option value="gemini-2.5-flash">Gemini Flash</option>
            <option value="rule-based-override">Rule Based</option>
          </select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Time</th>
                  <th className="px-4 py-3">Phase</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 rounded-tr-lg">Model</th>
                </tr>
              </thead>
              <tbody>
                {mockDecisions
                  .filter(d => filter === 'all' || d.model_used === filter)
                  .map((decision, i) => (
                  <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono">{decision.timestamp}</td>
                    <td className="px-4 py-3 capitalize">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        decision.recommended_phase === 'north' ? 'bg-primary-500/20 text-primary-400' :
                        decision.recommended_phase === 'south' ? 'bg-emerald-500/20 text-emerald-400' :
                        decision.recommended_phase === 'east' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {decision.recommended_phase}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white">{decision.duration_seconds}s</td>
                    <td className="px-4 py-3">{decision.reason}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded border border-slate-700">
                        {decision.model_used}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
