import { useState } from 'react';
import { ShieldAlert, AlertOctagon, Ambulance, Flame, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { motion } from 'framer-motion';

interface EmergencyPanelProps {
  isActive: boolean;
  onActivate: (direction: string, type: string) => void;
  onCancel: () => void;
}

export const EmergencyPanel = ({ isActive, onActivate, onCancel }: EmergencyPanelProps) => {
  const [selectedLane, setSelectedLane] = useState('north');
  const [selectedType, setSelectedType] = useState('ambulance');

  const lanes = ['north', 'south', 'east', 'west'];
  const vehicleTypes = [
    { id: 'ambulance', label: 'Ambulance', icon: Ambulance },
    { id: 'fire', label: 'Fire Truck', icon: Flame },
    { id: 'police', label: 'Police', icon: Shield },
  ];

  if (isActive) {
    return (
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card className="border-rose-500/50 bg-rose-500/10 shadow-[0_0_30px_rgba(244,63,94,0.1)]">
          <CardContent className="pt-8 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <ShieldAlert className="w-16 h-16 text-rose-500 animate-pulse" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-rose-500 rounded-full blur-xl"
              />
            </div>
            <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter">Emergency Enforced</h3>
            <p className="text-sm text-rose-200/70 mb-8 max-w-[200px]">Priority green corridor active. Traffic signals overridden by AI engine.</p>
            <Button variant="danger" size="lg" className="w-full shadow-lg shadow-rose-900/40" onClick={onCancel}>
              <AlertOctagon className="mr-2 w-5 h-5" /> Terminate Override
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="bg-slate-900/40 border-slate-800/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-rose-400 flex items-center gap-2 text-sm uppercase tracking-widest font-black">
          <ShieldAlert size={18} /> Emergency Override
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-3 block">
            Select Priority Sector
          </label>
          <div className="grid grid-cols-4 gap-2">
            {lanes.map((lane) => (
              <button
                key={lane}
                onClick={() => setSelectedLane(lane)}
                className={`py-2.5 rounded-xl text-xs font-bold capitalize border-2 transition-all duration-200 ${
                  selectedLane === lane
                    ? 'bg-rose-500/20 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                    : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                {lane[0]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-3 block">
            Emergency Vehicle Profile
          </label>
          <div className="grid grid-cols-3 gap-2">
            {vehicleTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`py-3 flex flex-col items-center gap-2 rounded-xl text-[10px] font-bold border-2 transition-all duration-200 ${
                    selectedType === type.id
                      ? 'bg-primary-500/20 border-primary-500 text-primary-100 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                      : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <Icon size={18} />
                  <span className="leading-none">{type.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          variant="danger"
          className="w-full mt-4 h-12 font-bold uppercase tracking-widest text-xs shadow-lg shadow-rose-950/20"
          onClick={() => onActivate(selectedLane, selectedType)}
        >
          Inject Priority Corridor
        </Button>
      </CardContent>
    </Card>
  );
};
