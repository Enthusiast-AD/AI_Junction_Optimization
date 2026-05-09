import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings2, Cpu, Zap, RotateCcw, CheckCircle2, XCircle } from 'lucide-react';
const SettingsPage = () => {
  const [optimizationMode, setOptimizationMode] = useState<'ai' | 'fixed'>('ai');
  const [simSpeed, setSimSpeed] = useState(1);

  const apiStatus = [
    { name: 'Groq API (Llama 3)', status: 'connected', latency: '42ms' },
    { name: 'Gemini API (Flash)', status: 'connected', latency: '156ms' },
    { name: 'WebSocket Server', status: 'disconnected', latency: '--' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <Settings2 className="text-slate-400" /> System Configuration
        </h1>
        <p className="text-slate-400">Manage simulation parameters and integration statuses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Simulation Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Simulation Engine</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            
            {/* Speed Slider */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-300">Simulation Speed</label>
                <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">{simSpeed}x</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                step="1"
                value={simSpeed}
                onChange={(e) => setSimSpeed(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Real-time</span>
                <span>Fast-forward</span>
              </div>
            </div>

            {/* Mode Toggle */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <label className="text-sm font-semibold text-slate-300">Optimization Mode</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
                <button
                  onClick={() => setOptimizationMode('fixed')}
                  className={`py-2 rounded text-sm font-medium transition-colors ${
                    optimizationMode === 'fixed' 
                      ? 'bg-slate-700 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Fixed Timing
                </button>
                <button
                  onClick={() => setOptimizationMode('ai')}
                  className={`py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    optimizationMode === 'ai' 
                      ? 'bg-primary-600 text-white shadow' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cpu size={16} /> AI Adaptive
                </button>
              </div>
              <p className="text-xs text-slate-500">Switching to Fixed Timing disables Groq inferences and runs standard 35s cycles.</p>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Button variant="outline" className="w-full gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/20">
                <RotateCcw size={16} /> Reset Simulation State
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>API Integrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiStatus.map((api) => (
                <div key={api.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-3">
                    {api.status === 'connected' ? (
                      <CheckCircle2 className="text-emerald-500" size={18} />
                    ) : (
                      <XCircle className="text-rose-500" size={18} />
                    )}
                    <div>
                      <div className="text-sm font-medium text-slate-200">{api.name}</div>
                      <div className="text-xs text-slate-500 capitalize">{api.status}</div>
                    </div>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    {api.latency}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <Zap className="text-amber-500 shrink-0 mt-0.5" size={16} />
                <div className="text-sm text-amber-200/80">
                  <span className="font-bold text-amber-500">Notice:</span> WebSocket server is currently mocked. Run the FastAPI backend on port 8000 to enable live streaming.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
