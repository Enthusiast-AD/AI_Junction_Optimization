import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { type DensityDataPoint } from '../types';

interface DensityChartProps {
  data: DensityDataPoint[];
  activeLane?: string;
}

export const DensityChart = ({ data, activeLane = 'north' }: DensityChartProps) => {
  return (
    <div className="w-full h-[300px] mt-4 min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            hide 
          />
          <YAxis 
            stroke="#64748b" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
            labelStyle={{ display: 'none' }}
          />
          <Area type="monotone" dataKey="north" stroke="#4f46e5" fillOpacity={activeLane === 'north' ? 1 : 0} fill="url(#colorActive)" strokeWidth={2} />
          <Area type="monotone" dataKey="south" stroke="#10b981" fillOpacity={activeLane === 'south' ? 1 : 0} fill="url(#colorActive)" strokeWidth={2} />
          <Area type="monotone" dataKey="east" stroke="#f59e0b" fillOpacity={activeLane === 'east' ? 1 : 0} fill="url(#colorActive)" strokeWidth={2} />
          <Area type="monotone" dataKey="west" stroke="#ef4444" fillOpacity={activeLane === 'west' ? 1 : 0} fill="url(#colorActive)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

