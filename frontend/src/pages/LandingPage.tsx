import { motion } from 'framer-motion';
import { Activity, Zap, ShieldAlert, TrendingUp, ArrowRight, Code, Database, Brain, Clock, Car, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const LandingPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-primary-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Navbar */}
      <nav className="relative z-10 container mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Activity className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            AI Junction
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
          <a href="#stats" className="hover:text-white transition-colors">Stats</a>
        </div>
        <Link to="/signin">
          <Button variant="outline" size="sm">Sign In</Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8"
        >
          <Zap size={14} />
          <span>LLM-Powered Traffic Management</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight"
        >
          Optimize Junctions with <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-indigo-400">
            Autonomous AI
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10"
        >
          Replace static signal cycles with real-time AI optimization. Reduce wait times by 30% and prioritize emergency vehicles instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link to="/dashboard">
            <Button size="lg" className="gap-2">
              Launch Dashboard <ArrowRight size={20} />
            </Button>
          </Link>
          <Button variant="outline" size="lg" className="gap-2">
            <Code size={20} /> View Source
          </Button>
        </motion.div>

        {/* Hero Visual Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20 w-full max-w-5xl relative"
        >
          <div className="glass rounded-2xl border border-white/10 p-4 shadow-2xl overflow-hidden aspect-video">
             <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Simulated Traffic Map Background */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="relative z-10 flex flex-col items-center">
                    <Activity className="w-20 h-20 text-primary-500 animate-pulse-slow mb-4" />
                    <span className="text-slate-500 font-mono tracking-widest uppercase">System Initialized</span>
                </div>
                
                {/* Floating Stats UI in mockup */}
                <div className="absolute top-8 left-8 p-3 glass rounded-lg border border-white/5 text-left">
                  <div className="text-xs text-slate-500 uppercase tracking-tighter mb-1">Efficiency</div>
                  <div className="text-xl font-bold text-emerald-400">+34.2%</div>
                </div>
                <div className="absolute bottom-8 right-8 p-3 glass rounded-lg border border-white/5 text-left">
                  <div className="text-xs text-slate-500 uppercase tracking-tighter mb-1">Active Model</div>
                  <div className="text-sm font-mono text-primary-400">Llama-3.1-8B</div>
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Core Capabilities</h2>
          <p className="text-slate-400">Harnessing advanced LLMs for urban infrastructure</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          <motion.div variants={itemVariants} className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-primary-500/30 transition-all group">
            <div className="w-12 h-12 bg-primary-600/10 rounded-xl flex items-center justify-center text-primary-500 mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Signal Optimizer</h3>
            <p className="text-slate-400">Dynamic phase allocation using Groq's high-speed inference for instant decision making.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-rose-500/30 transition-all group">
            <div className="w-12 h-12 bg-rose-600/10 rounded-xl flex items-center justify-center text-rose-500 mb-6 group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Emergency Priority</h3>
            <p className="text-slate-400">Green-corridor preemption for ambulances and fire trucks, reducing response times by 90%.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all group">
            <div className="w-12 h-12 bg-emerald-600/10 rounded-xl flex items-center justify-center text-emerald-500 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <TrendingUp size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Predictive Insights</h3>
            <p className="text-slate-400">Gemini-powered congestion forecasting allows for proactive traffic management before peaks form.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Architecture / How it Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-900/20 border-y border-slate-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400">The AI-driven optimization loop</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
             <div className="flex-1 glass p-6 rounded-2xl text-center border-t-primary-500/50 border-t-4">
                <Database className="w-10 h-10 text-primary-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">1. Data Ingestion</h4>
                <p className="text-sm text-slate-400">Real-time vehicle density and emergency status stream into the engine.</p>
             </div>
             <ArrowRight className="text-slate-700 hidden md:block w-8 h-8 shrink-0" />
             <div className="flex-1 glass p-6 rounded-2xl text-center border-t-emerald-500/50 border-t-4">
                <Brain className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">2. AI Inference</h4>
                <p className="text-sm text-slate-400">Groq LLM processes context and outputs JSON routing decisions instantly.</p>
             </div>
             <ArrowRight className="text-slate-700 hidden md:block w-8 h-8 shrink-0" />
             <div className="flex-1 glass p-6 rounded-2xl text-center border-t-indigo-500/50 border-t-4">
                <Activity className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-white mb-2">3. Actuation</h4>
                <p className="text-sm text-slate-400">Signal phases update dynamically via WebSocket pushing to the junction.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Simulated Performance</h2>
          <p className="text-slate-400">Comparing AI adaptive timing vs. traditional fixed cycles</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass p-8 rounded-2xl text-center border border-slate-800 hover:-translate-y-1 transition-transform">
             <Clock className="w-8 h-8 text-emerald-500 mx-auto mb-4" />
             <div className="text-4xl font-extrabold text-white mb-2">-46%</div>
             <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Wait Time</div>
             <div className="mt-4 text-xs text-slate-500">Dropped from 41.7s to 22.4s avg</div>
          </div>
          
          <div className="glass p-8 rounded-2xl text-center border border-slate-800 hover:-translate-y-1 transition-transform">
             <Car className="w-8 h-8 text-primary-500 mx-auto mb-4" />
             <div className="text-4xl font-extrabold text-white mb-2">+38%</div>
             <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Throughput</div>
             <div className="mt-4 text-xs text-slate-500">Increased from 612 to 847 veh/hr</div>
          </div>

          <div className="glass p-8 rounded-2xl text-center border border-slate-800 hover:-translate-y-1 transition-transform">
             <ShieldAlert className="w-8 h-8 text-rose-500 mx-auto mb-4" />
             <div className="text-4xl font-extrabold text-white mb-2">1.8s</div>
             <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Emergency Clear</div>
             <div className="mt-4 text-xs text-slate-500">Down from 45.0s fixed wait</div>
          </div>

          <div className="glass p-8 rounded-2xl text-center border border-slate-800 hover:-translate-y-1 transition-transform">
             <Server className="w-8 h-8 text-amber-500 mx-auto mb-4" />
             <div className="text-4xl font-extrabold text-white mb-2">187ms</div>
             <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">AI Latency</div>
             <div className="mt-4 text-xs text-slate-500">Groq Llama 3 inference speed</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Activity size={20} />
            <span className="font-semibold">AI Junction</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2026 AI Junction Optimization System. Built for Hackathon Excellence.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
