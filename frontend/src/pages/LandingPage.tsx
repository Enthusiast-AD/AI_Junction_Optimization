import { motion } from 'framer-motion';
import { Activity, ShieldAlert, TrendingUp, ArrowRight,Database, Brain, Network, Cpu, LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-300 font-sans selection:bg-primary-500/30 overflow-hidden">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[40vh] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <header className="relative z-20 border-b border-white/5 bg-slate-950/50 backdrop-blur-md sticky top-0">
        <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.3)] border border-indigo-500/50">
              <Activity className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-semibold text-white tracking-tight">
              AI<span className="text-indigo-400">Junction</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-indigo-400 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-indigo-400 transition-colors">How it Works</a>
            <a href="#metrics" className="hover:text-indigo-400 transition-colors">Metrics</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/signin">
              <Button variant="outline" className="text-sm font-medium border-slate-700 hover:bg-slate-800 text-slate-300">
                Sign In
              </Button>
            </Link>
            <Link to="/signin">
              <Button className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                Try Demo
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center">
        

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
        >
          Intelligent Intersections. <br />
          <span className="text-indigo-400">
            Zero Congestion.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10 font-light leading-relaxed"
        >
          Replace static signal cycles with real-time AI optimization powered by Groq and Gemini. Lower waiting times by up to <strong className="text-emerald-400 font-medium">30%</strong> and prioritize emergency vehicles instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/signin">
            <Button size="lg" className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] px-8 font-medium">
              Launch Dashboard <ArrowRight size={18} />
            </Button>
          </Link>
          
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-24 w-full max-w-5xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent z-10" />
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-2 shadow-2xl backdrop-blur-sm transform transition-transform duration-700">
             <div className="w-full h-[400px] bg-slate-950 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="absolute top-8 left-8 p-4 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 text-left shadow-2xl">
                  <div className="text-xs text-slate-400 uppercase tracking-tighter mb-1 font-semibold">Intersection Flow</div>
                  <div className="text-3xl font-bold text-emerald-400">+34.2%</div>
                  <div className="text-xs text-emerald-500/70 mt-1">vs fixed timing</div>
                </div>
                
                <div className="absolute bottom-8 right-8 p-4 bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/10 text-left shadow-2xl">
                  <div className="text-xs text-slate-400 uppercase tracking-tighter mb-1 font-semibold">Active Engine</div>
                  <div className="text-sm font-mono text-indigo-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Groq Llama 3.1
                  </div>
                </div>

                <div className="flex flex-col items-center z-10 bg-slate-950/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <Activity className="w-12 h-12 text-indigo-500 animate-pulse mb-4" />
                  <div className="text-indigo-400 font-mono text-sm tracking-widest uppercase bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20 shadow-[0_0_15px_rgba(79,70,229,0.2)]">
                    Telemetry Stream Active
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Features Outline */}
      <section id="features" className="container mx-auto px-6 py-32 relative">
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full" />
        
        <div className="text-center mb-20 relative z-10">
          <motion.h2 
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-3"
          >
            System Capabilities
          </motion.h2>
          <motion.h3 
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            A smart city needs a smarter brain.
          </motion.h3>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
        >
          {/* Feature 1 */}
          <motion.div variants={itemVariants} className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all duration-300 group">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
              <Cpu size={24} />
            </div>
            <h4 className="text-lg font-semibold text-white mb-3">LLM Signal Optimizer</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dynamically allocates green phases using high-speed reasoning from Groq Llama 3.1, bypassing static cycles completely.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div variants={itemVariants} className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-rose-500/30 hover:bg-slate-900/60 transition-all duration-300 group">
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 transition-transform">
              <ShieldAlert size={24} />
            </div>
            <h4 className="text-lg font-semibold text-white mb-3">Emergency Priority</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Instant green-corridor preemption drops emergency vehicle wait times to zero, ensuring unblocked critical response.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div variants={itemVariants} className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-emerald-500/30 hover:bg-slate-900/60 transition-all duration-300 group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <h4 className="text-lg font-semibold text-white mb-3">Predictive Congestion</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Anticipates traffic buildup 5–15 minutes ahead utilizing Gemini-based pattern analysis on historical volume data.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div variants={itemVariants} className="p-8 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-blue-500/30 hover:bg-slate-900/60 transition-all duration-300 group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
              <LineChart size={24} />
            </div>
            <h4 className="text-lg font-semibold text-white mb-3">Real-time Dashboard</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Live density visualization, decision logs, and an AI explainer keeping operators in the loop with zero latency.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Architecture */}
      <section id="architecture" className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/30 border-y border-white/5" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-3">Architecture</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white">How the engine hums.</h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 max-w-5xl mx-auto">
             <div className="flex-1 bg-slate-950/50 p-8 rounded-2xl text-center border border-white/5 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
                <Database className="w-10 h-10 text-cyan-400 mx-auto mb-5" />
                <h4 className="text-white font-medium mb-2">1. Simulation Engine</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Real-time lane densities and emergency events form the synthetic telemetry stream.</p>
             </div>
             
             <div className="hidden md:flex flex-col items-center gap-1 text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
             </div>

             <div className="flex-1 bg-slate-950/50 p-8 rounded-2xl text-center border border-white/5 relative shadow-[0_0_30px_rgba(79,70,229,0.1)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
                <Brain className="w-10 h-10 text-indigo-400 mx-auto mb-5" />
                <h4 className="text-white font-medium mb-2">2. AI Inference</h4>
                <p className="text-xs text-slate-400 leading-relaxed">Groq/Gemini processes the raw state, identifies anomalies, and synthesizes optimal sequences.</p>
             </div>

             <div className="hidden md:flex flex-col items-center gap-1 text-slate-600">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
             </div>

             <div className="flex-1 bg-slate-950/50 p-8 rounded-2xl text-center border border-white/5 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                <Network className="w-10 h-10 text-purple-400 mx-auto mb-5" />
                <h4 className="text-white font-medium mb-2">3. Actuation Layer</h4>
                <p className="text-xs text-slate-400 leading-relaxed">FastAPI routes signals via WebSocket directly to operators in the React dashboard.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Metrics / Final CTA */}
      <section id="metrics" className="container mx-auto px-6 py-32 text-center pb-40">
        <h2 className="text-sm font-bold tracking-widest text-indigo-500 uppercase mb-8">Performance Impact</h2>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-20">
          <div className="p-6">
            <div className="text-5xl font-bold text-white mb-2 tracking-tighter">-30<span className="text-indigo-500">%</span></div>
            <div className="text-sm text-slate-400 font-medium">Avg. Wait Time</div>
          </div>
          <div className="p-6 border-y md:border-y-0 md:border-x border-white/10">
            <div className="text-5xl font-bold text-white mb-2 tracking-tighter">&lt; 2<span className="text-indigo-500">s</span></div>
            <div className="text-sm text-slate-400 font-medium">Emergency Preemption</div>
          </div>
          <div className="p-6">
            <div className="text-5xl font-bold text-white mb-2 tracking-tighter">+15<span className="text-indigo-500">m</span></div>
            <div className="text-sm text-slate-400 font-medium">Congestion Foresight</div>
          </div>
        </div>

        <div className="p-12 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Activity className="w-48 h-48" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-6 relative z-10">Ready to optimize?</h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto relative z-10">
            Take control of the junction flow. Experience real-time LLM decision-making with our interactive demo.
          </p>
          <Link to="/signin" className="relative z-10">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-200 px-10 font-bold shadow-xl">
              Access Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 bg-slate-950 text-center">
        <p className="text-slate-500 text-sm">
          Built for optimization. Engineered with FastAPI, React, and Groq.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
