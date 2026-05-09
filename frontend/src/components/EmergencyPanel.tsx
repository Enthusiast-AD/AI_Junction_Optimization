import { useState } from 'react';
import { ShieldAlert, AlertOctagon, Ambulance, Flame, Shield } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';

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
      <Card className="border-rose-500/50 bg-rose-500/10">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <ShieldAlert className="w-12 h-12 text-rose-500 animate-pulse mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">Emergency Active</h3>
          <p className="text-rose-200 mb-6">Green corridor enforced on selected lane. All other phases held red.</p>
          <Button variant="danger" size="lg" className="w-full" onClick={onCancel}>
            <AlertOctagon className="mr-2" /> Cancel Emergency Status
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-rose-400 flex items-center gap-2">
          <ShieldAlert size={20} /> Override Control
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Target Lane
          </label>
          <div className="grid grid-cols-4 gap-2">
            {lanes.map((lane) => (
              <button
                key={lane}
                onClick={() => setSelectedLane(lane)}
                className={`py-2 rounded-lg text-sm font-medium capitalize border transition-all ${
                  selectedLane === lane
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {lane[0]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">
            Vehicle Type
          </label>
          <div className="grid grid-cols-3 gap-2">
            {vehicleTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`py-2 flex flex-col items-center gap-1 rounded-lg text-xs font-medium border transition-all ${
                    selectedType === type.id
                      ? 'bg-primary-500/20 border-primary-500 text-primary-300'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <Icon size={16} />
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          variant="danger"
          className="w-full mt-4"
          onClick={() => onActivate(selectedLane, selectedType)}
        >
          Activate Emergency Priority
        </Button>
      </CardContent>
    </Card>
  );
};
