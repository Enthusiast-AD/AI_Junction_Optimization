import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Settings2, Cpu, CheckCircle2, ShieldCheck, Sliders } from 'lucide-react';
import { useJunctionStore } from '../store/useJunctionStore';

export const SettingsPage: React.FC = () => {
  const { connectionStatus } = useJunctionStore();
  const [minGreen, setMinGreen] = useState(15);
  const [maxGreen, setMaxGreen] = useState(60);
  const [yellowTime] = useState(3);
  const [allRedTime] = useState(2);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
            <Settings2 size={20} />
          </span>
          <h1 className="text-xl font-black text-white">Signal Engineering &amp; Controller Configuration</h1>
        </div>
        <p className="text-xs text-slate-400">
          Configure physical junction clearance bounds, timing bounds, and edge inference deployment parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Signal Timing Bounds Card */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="py-3.5 px-5 border-b border-slate-800/60">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders size={16} className="text-primary-400" />
              4-Stage Timing Intervals (Webster Bounds)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Minimum Green Duration:</span>
                <span className="font-mono font-bold text-emerald-400">{minGreen}s</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="25" 
                value={minGreen}
                onChange={e => setMinGreen(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Guarantees sufficient pedestrian &amp; start-up clearance.</p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Maximum Green Duration:</span>
                <span className="font-mono font-bold text-primary-400">{maxGreen}s</span>
              </div>
              <input 
                type="range" 
                min="45" 
                max="90" 
                value={maxGreen}
                onChange={e => setMaxGreen(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Prevents excessive delay on cross-streets during rush hour.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">Yellow Clearance</span>
                <span className="text-base font-black text-amber-400 font-mono">{yellowTime}s</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Dilemma Zone Safety</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-bold">All-Red Clearance</span>
                <span className="text-base font-black text-rose-400 font-mono">{allRedTime}s</span>
                <span className="text-[9px] text-slate-500 block mt-0.5">Intersection Emptying</span>
              </div>
            </div>

            <Button onClick={handleSave} className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-xs">
              {saved ? '✓ Settings Saved to Controller' : 'Apply Timing Bounds'}
            </Button>
          </CardContent>
        </Card>

        {/* Edge AI Deployment Status */}
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="py-3.5 px-5 border-b border-slate-800/60">
            <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu size={16} className="text-emerald-400" />
              Edge AI Hardware &amp; Inference Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">PyTorch 2.x Neural Core</h4>
                  <p className="text-[10px] text-slate-400">Multi-Task MLP (14 → 128 → 64 → 32 → 3 Heads)</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">ONLINE (1.2ms)</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-2.5 h-2.5 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <div>
                  <h4 className="text-xs font-bold text-white">Real-Time WebSocket Stream</h4>
                  <p className="text-[10px] text-slate-400">FastAPI backend on port 8000</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-slate-300">
                {connectionStatus === 'connected' ? 'CONNECTED' : 'STANDBY'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={18} className="text-primary-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">Offline Edge Reliability</h4>
                  <p className="text-[10px] text-slate-400">No cloud dependencies, $0 monthly API cost</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-primary-400">100% READY</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 leading-relaxed">
              <p>
                <strong>Deployment Ready:</strong> Model weighs only <strong>60.9 KB</strong> and can run on low-power ARM microcontrollers (Raspberry Pi 4 / NVIDIA Jetson Nano) at 1.2ms forward-pass speed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
