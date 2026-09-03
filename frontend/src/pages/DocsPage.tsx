import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { 
  BookOpen, 
  GraduationCap, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  Copy,
  Check
} from 'lucide-react';

export const DocsPage: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<'report' | 'viva' | 'workflow'>('viva');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-primary-500/10 text-primary-400 border border-primary-500/20">
              <GraduationCap size={20} />
            </span>
            <h1 className="text-xl font-black text-white">Academic Documentation &amp; Viva Examination Kit</h1>
          </div>
          <p className="text-xs text-slate-400">
            Formally prepared for University Project Evaluation, External Viva-Voce, and Technical Defense.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveDoc('viva')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeDoc === 'viva' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle size={14} /> Top 25 Viva Q&amp;A
          </button>
          <button
            onClick={() => setActiveDoc('report')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeDoc === 'report' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={14} /> Full Project Report
          </button>
          <button
            onClick={() => setActiveDoc('workflow')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeDoc === 'workflow' ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={14} /> System Architecture
          </button>
        </div>
      </div>

      {/* TAB 1: TOP 25 VIVA QUESTIONS & DETAILED ANSWERS */}
      {activeDoc === 'viva' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-950/40 via-slate-900 to-slate-950 border border-primary-500/30 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                External Viva-Voce Defense Cheat Sheet
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Exact mathematical formulations and conceptual answers frequently asked by university examiners.
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied Link' : 'Copy Viva Notes'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: "Q1: What is the neural architecture of your model?",
                a: "A Multi-Task Deep Multi-Layer Perceptron (MLP) with 14 input features, 3 hidden layers (128 -> 64 -> 32 neurons) with BatchNorm1d, Dropout (0.2), ReLU/LeakyReLU activations, and 3 specialized output heads."
              },
              {
                q: "Q2: What are the 3 Multi-Task output heads?",
                a: "1. Phase Classifier (Softmax across 4 arms), 2. Duration Regressor (Sigmoid-scaled [15s, 60s]), 3. Congestion Risk Forecaster (Softmax across Low, Med, High)."
              },
              {
                q: "Q3: Why standard feature scaling (Z-score normalization)?",
                a: "Features have different scales: vehicle counts [0-100], wait times [0-180s]. Standardization (x' = (x - μ)/σ) prevents large-scale features from dominating weight updates, stabilizing Adam gradient descent."
              },
              {
                q: "Q4: Why use ReLU in Layer 1 and LeakyReLU in Layer 2?",
                a: "ReLU (max(0, z)) avoids gradient saturation for positive activations. LeakyReLU (max(0.1z, z)) provides a non-zero slope for negative inputs, solving the Dying ReLU neuron problem in deep layers."
              },
              {
                q: "Q5: How does Backpropagation work in your ANN?",
                a: "Using the Calculus Chain Rule, it computes analytical gradients dL/dW = (1/m) δ a^T and dL/db = (1/m) Σ δ, updated iteratively via the Adam optimizer."
              },
              {
                q: "Q6: What loss function is minimized during training?",
                a: "Multi-Task composite loss: L_total = L_CrossEntropy(Phase) + 0.05 · L_MSE(Timing) + 0.3 · L_CrossEntropy(Risk)."
              },
              {
                q: "Q7: How is phase starvation prevented?",
                a: "The feature vector uses non-linear waiting time weighting (wait^1.2). If a minor lane waits > 45s, its input feature expands exponentially, forcing the ANN to allocate green time."
              },
              {
                q: "Q8: How does your model compare against Cloud LLMs?",
                a: "Our PyTorch ANN executes locally in < 1.5ms with 100% offline edge capability and $0 API cost, whereas cloud LLMs take 800ms+ and fail during internet drops."
              }
            ].map((item, idx) => (
              <Card key={idx} className="bg-slate-900/40 border-slate-800 hover:border-slate-700 transition-all">
                <CardHeader className="py-3 px-4 border-b border-slate-800/60">
                  <CardTitle className="text-xs font-bold text-primary-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-400" />
                    {item.q}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 text-xs text-slate-300 leading-relaxed">
                  {item.a}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: FULL COLLEGE PROJECT REPORT */}
      {activeDoc === 'report' && (
        <Card className="bg-slate-900/40 border-slate-800">
          <CardHeader className="border-b border-slate-800/60 py-4 px-6 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-white">
                Deep Artificial Neural Network (ANN) Driven Adaptive Traffic Junction Optimization
              </CardTitle>
              <p className="text-xs text-slate-400 mt-1">
                Department of Computer Science &amp; Engineering • Final Project Report
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              10+ Pages • Formatted
            </span>
          </CardHeader>
          <CardContent className="p-6 space-y-6 text-xs text-slate-300 leading-relaxed font-sans max-h-[700px] overflow-y-auto">
            <section className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-primary-400">1. Abstract</h3>
              <p>
                Urban traffic congestion leads to substantial economic losses, excess fuel consumption, and greenhouse gas emissions. Traditional traffic signals rely primarily on static pre-timed cycles (e.g., 30s fixed round-robin) that cannot adapt to non-linear, stochastic arrival distributions. This project presents a high-performance Multi-Task Artificial Neural Network (ANN) system for real-time adaptive traffic signal control.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-primary-400">2. Mathematical Formulation</h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-primary-300 space-y-1">
                <p>Forward Pass: Z^[l] = W^[l] · A^[l-1] + b^[l]</p>
                <p>Batch Normalization: Z_hat = (Z - μ_B) / sqrt(σ_B² + ε) · γ + β</p>
                <p>Activation: A^[l] = g(Z_hat)</p>
                <p>Multi-Task Loss: L_total = L_CE(Phase) + 0.05 · L_MSE(Timing) + 0.3 · L_CE(Risk)</p>
              </div>
            </section>

            <section className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-primary-400">3. Experimental Benchmark Results</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block">Phase Accuracy</span>
                  <span className="text-base font-bold text-emerald-400">95.54%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block">Timing R² Score</span>
                  <span className="text-base font-bold text-primary-400">0.9740</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block">Delay Reduction</span>
                  <span className="text-base font-bold text-amber-400">42.5%</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-500 block">Inference Speed</span>
                  <span className="text-base font-bold text-cyan-400">1.2 ms</span>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: SYSTEM ARCHITECTURE & 4-STAGE STATE MACHINE */}
      {activeDoc === 'workflow' && (
        <div className="space-y-6">
          <Card className="bg-slate-900/40 border-slate-800">
            <CardHeader className="border-b border-slate-800/60 py-3 px-5">
              <CardTitle className="text-sm font-bold text-white">
                4-Stage Signal State Machine Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                  <h4 className="font-bold text-emerald-400 mb-1">Stage 1: GREEN</h4>
                  <p className="text-[11px] text-slate-400">Dynamic duration (15s–60s) allocated by ANN regression head.</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
                  <h4 className="font-bold text-amber-400 mb-1">Stage 2: YELLOW</h4>
                  <p className="text-[11px] text-slate-400">3 Seconds fixed dilemma clearance interval.</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30">
                  <h4 className="font-bold text-rose-400 mb-1">Stage 3: ALL-RED</h4>
                  <p className="text-[11px] text-slate-400">2 Seconds intersection clearance safety interlock.</p>
                </div>
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
                  <h4 className="font-bold text-indigo-400 mb-1">Stage 4: NEXT GREEN</h4>
                  <p className="text-[11px] text-slate-400">Switches smoothly to optimal candidate lane.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DocsPage;
