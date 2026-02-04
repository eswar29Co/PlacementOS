import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Ghost, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[160px]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-slate-50 rounded-full blur-[140px]" />

      <div className="text-center space-y-8 relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="relative inline-block">
          <div className="h-32 w-32 rounded-[2.5rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-xl mx-auto rotate-12">
            <Ghost className="h-16 w-16 text-slate-300" />
          </div>
          <div className="absolute -top-4 -right-4 bg-primary text-white font-black text-xs px-4 py-2 rounded-2xl shadow-lg shadow-primary/20">
            ERROR 404
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter uppercase text-slate-900 leading-none">
            NODE <span className="text-primary">MISSING</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[10px] max-w-xs mx-auto">
            The requested neural path could not be resolved across the current network topology.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="h-14 px-8 rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest gap-2 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Go Back
          </Button>
          <Button
            onClick={() => navigate("/")}
            className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
          >
            <Home className="h-4 w-4" /> Core Hub
          </Button>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.8em] text-slate-400">Antigravity Intelligence Systems</p>
      </div>
    </div>
  );
};

export default NotFound;
