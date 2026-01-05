import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/90 to-primary p-4">
      <div className="flex flex-col items-center gap-6 max-w-2xl text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur animate-scale-in">
          <Briefcase className="h-12 w-12 text-white" />
        </div>
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-white">PlacementOS</h1>
          <p className="text-xl text-white/90">Mock Placement Interview Simulator</p>
        </div>
        <p className="text-white/80 text-lg max-w-lg">
          Practice and prepare for your dream job with real interview experiences. 
          Students get guidance from working professionals through mock interviews.
        </p>
        <Button 
          size="lg" 
          onClick={() => navigate('/login')}
          className="mt-4 bg-white text-primary hover:bg-white/90 text-lg px-8 py-6"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
