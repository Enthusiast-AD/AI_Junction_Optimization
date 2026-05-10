import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Sparkles, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { useJunctionStore } from '../store/useJunctionStore';

const InsightsPage = () => {
  const { insightLog } = useJunctionStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const currentInsight = insightLog[0];

  const handleRefresh = () => {
    setIsRefreshing(true);
    // This could trigger a backend re-calc in a real app
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="text-indigo-400" /> Predictive Insights
          </h1>
          <p className="text-slate-400">Gemini 2.5 Flash powered traffic forecasting and proactive recommendations.</p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline" className="gap-2">
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          Generate New Insight
        </Button>
      </div>

      {/* Latest Prediction Card */}
      {currentInsight ? (
        <>
          <Card className="bg-gradient-to-br from-indigo-950/50 to-slate-900 border-indigo-500/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-indigo-300">Active Forecast</CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                    <Clock size={12} /> Generated at {new Date(currentInsight.generated_at).toLocaleTimeString()}
                  </span>
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 border ${
                    currentInsight.congestion_risk === 'high' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                    currentInsight.congestion_risk === 'medium' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    <AlertTriangle size={12} /> {currentInsight.congestion_risk} Risk
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Prediction</h3>
                <p className="text-xl text-white font-medium leading-relaxed">
                  <span className="text-indigo-400 font-bold">{currentInsight.predicted_peak_lane} lane</span> congestion building. 
                  {currentInsight.summary}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <h3 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">AI Recommendation</h3>
                <p className="text-indigo-100">{currentInsight.recommendation}</p>
              </div>
            </CardContent>
          </Card>

          {/* Insight History Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Forecast Accuracy Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 pl-4 border-l-2 border-slate-800 ml-4 mt-4">
                {insightLog.slice(1).map((insight, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full border-4 border-slate-950 bg-emerald-500" />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-slate-400">{new Date(insight.generated_at).toLocaleTimeString()}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                          {insight.predicted_peak_lane}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
                      <p className="text-sm text-slate-300 mb-2">{insight.summary}</p>
                      <p className="text-xs text-slate-500"><span className="text-indigo-400 font-medium">Action taken:</span> {insight.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="py-20 flex flex-col items-center justify-center text-center">
           <Sparkles className="w-12 h-12 text-slate-700 mb-4" />
           <CardTitle className="text-slate-500">No Insights Generated Yet</CardTitle>
           <p className="text-sm text-slate-600 mt-2 max-w-xs">
             The AI generates predictive insights every 2 minutes based on traffic trends.
           </p>
        </Card>
      )}
    </div>
  );
};

export default InsightsPage;
