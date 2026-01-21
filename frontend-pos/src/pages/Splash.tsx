import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight, Zap, ShieldCheck, Target, Sparkles, Globe, Cpu, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 relative overflow-hidden">

      {/* Cinematic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[160px] animate-pulse-slow" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-50/10 rounded-full blur-[140px]" />
      <div className="absolute top-[40%] left-[10%] w-[30%] h-[30%] bg-primary/2 rounded-full blur-[120px]" />

      {/* Hero Content */}
      <div className="flex flex-col items-center gap-10 max-w-4xl text-center relative z-10 animate-in fade-in zoom-in duration-1000">

        {/* Logo Hub */}
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] blur-2xl group-hover:scale-110 transition-transform duration-700" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-white border border-slate-100 shadow-xl backdrop-blur-xl transition-all duration-500 group-hover:rotate-12 group-hover:border-primary/30">
            <Briefcase className="h-12 w-12 text-primary" />
          </div>
          <div className="absolute -top-4 -right-4 h-10 w-10 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-slow">
            <Zap className="h-5 w-5 text-amber-500 fill-amber-500/20" />
          </div>
        </div>

        {/* Textual Identity */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-7xl md:text-8xl font-black text-slate-900 italic tracking-tighter uppercase leading-[0.8]">
              PLACEMENT<span className="text-primary italic">OS</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="h-px w-12 bg-slate-100" />
              <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.6em] italic">Neural Interview Simulation Engine</p>
              <div className="h-px w-12 bg-slate-100" />
            </div>
          </div>

          <h2 className="text-xl md:text-2xl text-slate-400 font-bold uppercase tracking-tight italic max-w-2xl mx-auto leading-relaxed">
            The high-fidelity <span className="text-slate-600">calibration protocol</span> for the next generation of industry architects.
          </h2>
        </div>

        {/* Tactical Badge Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <Badge icon={Target} text="Tactical Precision" />
          <Badge icon={ShieldCheck} text="Expert Validation" />
          <Badge icon={Cpu} text="AI Simulations" />
          <Badge icon={Globe} text="Global Outreach" />
        </div>

        {/* CTA Section */}
        <div className="space-y-6 mt-4">
          <Button
            onClick={() => navigate('/login')}
            className="group h-16 px-12 rounded-[2rem] bg-primary hover:bg-primary/90 text-white font-black uppercase text-sm tracking-[0.2em] shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
          >
            Initialize Protocol
            <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
          </Button>

          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Users className="h-3 w-3" /> Secure Link Established <span className="text-primary">•</span> Operational v2.0
          </p>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-500">Antigravity Intelligence Systems</p>
      </div>
    </div>
  );
}

function Badge({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl py-4 px-2 flex flex-col items-center gap-2 group hover:bg-white hover:border-primary/30 transition-all duration-300 hover:shadow-sm">
      <Icon className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
      <span className="text-[8px] font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-widest transition-colors">{text}</span>
    </div>
  );
}
