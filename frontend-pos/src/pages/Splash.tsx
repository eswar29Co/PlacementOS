import { useNavigate } from 'react-router-dom';
import {
  Briefcase, ArrowRight, Zap, ShieldCheck, Target, Sparkles,
  Globe, Cpu, Users, Building2, GraduationCap, TrendingUp,
  Award, CheckCircle, Rocket, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function Splash() {
  const navigate = useNavigate();
  const [floatingElements, setFloatingElements] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate random floating elements
    const elements = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setFloatingElements(elements);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-8 relative overflow-hidden">

      {/* Animated Background Network */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-br from-primary/10 via-indigo-500/5 to-transparent rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-tr from-emerald-500/5 via-primary/5 to-transparent rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] bg-gradient-to-bl from-amber-500/5 via-primary/3 to-transparent rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

        {/* Floating Icons */}
        {floatingElements.map((elem) => (
          <div
            key={elem.id}
            className="absolute opacity-5"
            style={{
              left: `${elem.x}%`,
              top: `${elem.y}%`,
              animation: `float ${10 + elem.delay}s ease-in-out infinite`,
              animationDelay: `${elem.delay}s`
            }}
          >
            {elem.id % 5 === 0 && <Briefcase className="h-8 w-8 text-primary" />}
            {elem.id % 5 === 1 && <GraduationCap className="h-8 w-8 text-indigo-600" />}
            {elem.id % 5 === 2 && <Building2 className="h-8 w-8 text-emerald-600" />}
            {elem.id % 5 === 3 && <Brain className="h-8 w-8 text-amber-600" />}
            {elem.id % 5 === 4 && <Rocket className="h-8 w-8 text-rose-600" />}
          </div>
        ))}

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      </div>

      {/* Hero Content */}
      <div className="flex flex-col items-center gap-12 max-w-5xl text-center relative z-10 animate-in fade-in zoom-in duration-1000">

        {/* Logo Hub with Pulse Effect */}
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl group-hover:scale-125 transition-transform duration-1000 animate-pulse-slow" />
          <div className="relative flex h-32 w-32 items-center justify-center rounded-[3rem] bg-white border-2 border-slate-200 shadow-2xl backdrop-blur-xl transition-all duration-700 group-hover:rotate-12 group-hover:border-primary/50 group-hover:shadow-primary/20">
            <Briefcase className="h-16 w-16 text-primary animate-pulse" />
          </div>
          <div className="absolute -top-4 -right-4 h-12 w-12 bg-white border-2 border-emerald-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce-slow">
            <Zap className="h-6 w-6 text-emerald-500 fill-emerald-500/20" />
          </div>
          <div className="absolute -bottom-4 -left-4 h-12 w-12 bg-white border-2 border-indigo-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
            <Sparkles className="h-6 w-6 text-indigo-500 fill-indigo-500/20" />
          </div>
        </div>

        {/* Animated Title */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter uppercase leading-[0.85] animate-gradient bg-gradient-to-r from-slate-900 via-primary to-slate-900 bg-clip-text text-transparent bg-[length:200%_auto]">
              PLACEMENT<span className="text-primary animate-pulse">OS</span>
            </h1>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="h-1 w-16 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-pulse" />
              <p className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-[0.6em] animate-pulse">
                Next-Gen Recruitment Platform
              </p>
              <div className="h-1 w-16 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-pulse" />
            </div>
          </div>

          <h2 className="text-xl md:text-3xl text-slate-500 font-bold uppercase tracking-tight max-w-3xl mx-auto leading-relaxed">
            Empowering <span className="text-primary font-black">Students</span>,
            Connecting <span className="text-emerald-600 font-black">Companies</span>,
            Building <span className="text-indigo-600 font-black">Futures</span>
          </h2>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          <FeatureBadge icon={Target} text="AI Matching" gradient="from-primary to-indigo-600" delay={0} />
          <FeatureBadge icon={ShieldCheck} text="Expert Reviews" gradient="from-emerald-500 to-teal-600" delay={0.1} />
          <FeatureBadge icon={Brain} text="Smart Interviews" gradient="from-amber-500 to-orange-600" delay={0.2} />
          <FeatureBadge icon={TrendingUp} text="Career Growth" gradient="from-rose-500 to-pink-600" delay={0.3} />
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-6">
          <Button
            onClick={() => navigate('/login')}
            className="group h-20 px-16 rounded-[2.5rem] bg-gradient-to-r from-primary via-primary to-indigo-600 hover:from-primary/90 hover:via-primary/90 hover:to-indigo-600/90 text-white font-black uppercase text-base tracking-[0.3em] shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-4 animate-pulse-slow"
          >
            Get Started
            <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </Button>

          <Button
            onClick={() => navigate('/admin-tpo')}
            variant="outline"
            className="h-20 px-12 rounded-[2.5rem] border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-black uppercase text-sm tracking-[0.2em] shadow-lg transition-all hover:scale-105 hover:border-primary/30"
          >
            <Building2 className="h-5 w-5 mr-3" />
            Login as TPO
          </Button>
        </div>

        {/* Register College Link */}
        <div className="flex flex-col items-center gap-4 mt-4">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <button
            onClick={() => navigate('/register-college')}
            className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-primary/30 transition-all hover:shadow-lg"
          >
            <Award className="h-5 w-5 text-primary group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-black text-slate-600 group-hover:text-primary uppercase tracking-widest transition-colors">
              Register Your College
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </button>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Pending approval from SuperAdmin
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 opacity-60">
          <TrustBadge icon={CheckCircle} text="Secure Platform" />
          <TrustBadge icon={Users} text="10K+ Students" />
          <TrustBadge icon={Building2} text="500+ Companies" />
          <TrustBadge icon={Globe} text="Global Reach" />
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-500">PlacementOS v2.0</p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
        .animate-pulse-slow {
          animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
      `}</style>
    </div>
  );
}

function FeatureBadge({ icon: Icon, text, gradient, delay }: { icon: any; text: string; gradient: string; delay: number }) {
  return (
    <div
      className="bg-white border-2 border-slate-100 rounded-2xl py-6 px-4 flex flex-col items-center gap-3 group hover:bg-slate-50 hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={cn("h-12 w-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform", gradient)}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <span className="text-[9px] font-black text-slate-600 group-hover:text-slate-900 uppercase tracking-widest transition-colors">
        {text}
      </span>
    </div>
  );
}

function TrustBadge({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">{text}</span>
    </div>
  );
}
