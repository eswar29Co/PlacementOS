import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login } from '@/store/slices/authSlice';
import { initializeStore } from '@/store/initializeData';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const students = useAppSelector((state) => state.students.students);
  const professionals = useAppSelector((state) => state.professionals.professionals);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Initialize store with mock data if empty
  useEffect(() => {
    if (students.length === 0 && professionals.length === 0) {
      initializeStore(dispatch);
    }
  }, [dispatch, students.length, professionals.length]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check admin credentials first (hardcoded)
    if (email === 'admin@placementos.com' && password === 'admin123') {
      const adminUser = {
        id: 'admin-1',
        name: 'System Admin',
        email: 'admin@placementos.com',
        role: 'admin' as const,
        createdAt: new Date(),
      };
      dispatch(login(adminUser));
      toast.success('Welcome Admin!');
      setLoading(false);
      navigate('/admin/dashboard');
      return;
    }

    // Check student credentials
    const student = students.find(
      (s) => s.email === email && s.password === password
    );
    if (student) {
      dispatch(login(student));
      toast.success(`Welcome back, ${student.name}!`);
      setLoading(false);
      navigate('/student/home');
      return;
    }

    // Check professional credentials
    const professional = professionals.find(
      (p) => p.email === email && p.password === password
    );
    if (professional) {
      dispatch(login(professional));
      toast.success(`Welcome back, ${professional.name}!`);
      setLoading(false);
      
      if (professional.status === 'pending') {
        navigate('/professional/dashboard'); // Will show pending message via ApprovedProfessionalRoute
      } else if (professional.status === 'approved') {
        navigate('/professional/dashboard');
      } else {
        navigate('/professional/dashboard'); // Will show rejected message via ApprovedProfessionalRoute
      }
      return;
    }

    // No match found
    toast.error('Invalid email or password');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Briefcase className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">PlacementOS</h1>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    New user?
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Link to="/signup/student">
                  <Button variant="outline" className="w-full">
                    Student Signup
                  </Button>
                </Link>
                <Link to="/signup/professional">
                  <Button variant="outline" className="w-full">
                    Professional Signup
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-6 p-3 bg-muted rounded-lg text-xs space-y-1">
              <p className="font-semibold">Demo Credentials:</p>
              <p>Student: priya.sharma@college.edu / password123</p>
              <p>Professional: amit.kumar@techcorp.com / password123</p>
              <p>Admin: admin@placementos.com / admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
