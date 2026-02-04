import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';

export default function PendingInterviews() {
    return (
        <DashboardLayout
            title="Active Missions"
            subtitle="Upcoming candidate evaluation protocols"
        >
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-8 animate-in fade-in duration-700">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition duration-1000 animate-pulse" />
                    <div className="relative h-32 w-32 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                        <Clock className="h-12 w-12 text-primary/40" />
                    </div>
                </div>

                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Check Out <span className="text-primary">Soon</span></h2>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.4em] max-w-[280px] mx-auto leading-loose">
                        Neural mission routing is currently calibrating new evaluation tracks.
                    </p>
                </div>

                <div className="h-1 w-24 bg-slate-100 rounded-full relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary/40 translate-x-[-100%] animate-[slide_2s_infinite]" />
                </div>
            </div>

            <style>{`
        @keyframes slide {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
        </DashboardLayout>
    );
}
