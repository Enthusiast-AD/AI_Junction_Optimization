import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Car, Sunrise, Sunset, CloudRain, AlertOctagon, RefreshCw } from 'lucide-react';

interface ScenarioControllerProps {
  activeScenario: string;
  onSelectScenario: (scenario: string) => void;
}

const SCENARIOS = [
  {
    id: 'normal',
    name: 'Balanced Flow',
    description: 'Uniform off-peak distribution across all 4 corridors.',
    icon: Car,
    color: 'emerald',
    inflow: '10-12 veh/min'
  },
  {
    id: 'morning_rush',
    name: 'Morning Peak',
    description: 'Heavy North-South commuter artery into city center.',
    icon: Sunrise,
    color: 'amber',
    inflow: '26 veh/min (N/S)'
  },
  {
    id: 'evening_rush',
    name: 'Evening Rush',
    description: 'Heavy East-West outbound corridor surge.',
    icon: Sunset,
    color: 'indigo',
    inflow: '28 veh/min (E/W)'
  },
  {
    id: 'storm',
    name: 'Monsoon Rain Storm',
    description: 'Reduced approach speeds, increased headway, wet delays.',
    icon: CloudRain,
    color: 'cyan',
    inflow: 'Weather Delay +80%'
  },
  {
    id: 'gridlock',
    name: 'Gridlock Crisis',
    description: 'High saturation across all arms, testing starvation prevention.',
    icon: AlertOctagon,
    color: 'rose',
    inflow: '34 veh/min (Max)'
  }
];

export const ScenarioController: React.FC<ScenarioControllerProps> = ({
  activeScenario,
  onSelectScenario
}) => {
  return (
    <Card className="bg-slate-900/60 border-slate-800">
      <CardHeader className="py-3 border-b border-slate-800/60">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-white">
            <RefreshCw size={14} className="text-primary-400" />
            Traffic Scenario Sandbox
          </CardTitle>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Active: <span className="text-primary-400 font-bold uppercase">{activeScenario.replace('_', ' ')}</span>
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {SCENARIOS.map(sc => {
            const Icon = sc.icon;
            const isSelected = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc.id)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 relative overflow-hidden group ${
                  isSelected
                    ? 'bg-slate-800/90 border-primary-500/60 shadow-lg shadow-primary-500/10'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-primary-500/10 rounded-full blur-lg pointer-events-none" />
                )}
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-xl ${
                    isSelected ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-500">{sc.inflow}</span>
                </div>
                <div>
                  <h4 className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {sc.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                    {sc.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
