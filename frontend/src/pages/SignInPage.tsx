import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate auth
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-indigo-600/10 blur-[120px] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
              <Activity className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-white">AI Junction</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-2">Enter your credentials to access the controller</p>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="email"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  placeholder="name@agency.gov"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Access Token</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input
                  type="password"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 pl-11 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-primary-600 focus:ring-primary-500" />
                Remember me
              </label>
              <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">Forgot token?</a>
            </div>

            <Button
              type="submit"
              className="w-full py-3 mt-4"
              isLoading={isLoading}
            >
              Authorize Access
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full py-3 mt-2 border-primary-500/30 hover:bg-primary-500/10 text-primary-400"
              onClick={() => navigate('/dashboard')}
            >
              Demo Login
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500">Secure System Access</span>
              </div>
            </div>
            
            <p className="text-center text-xs text-slate-500 mt-6">
              Authorized personnel only. For demonstration purposes, please use the Demo Login option above.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Don't have access? <a href="#" className="text-primary-400 hover:text-primary-300 font-medium">Contact your administrator</a>
        </p>
      </motion.div>
    </div>
  );
};

export default SignInPage;
