import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, ArrowRight, ArrowLeft, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { collegeService } from '@/services/collegeService';

interface College {
    id: string;
    name: string;
    domain: string;
    logo?: string;
}

export default function SelectCollege() {
    const navigate = useNavigate();
    const [colleges, setColleges] = useState<College[]>([]);
    const [selectedCollege, setSelectedCollege] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchColleges();
    }, []);

    const fetchColleges = async () => {
        try {
            const response = await collegeService.getColleges();
            if (response.success) {
                setColleges(response.data);
            } else {
                toast.error("Failed to load colleges");
            }
        } catch (error) {
            toast.error("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (!selectedCollege) {
            toast.error("Please select a college first");
            return;
        }

        // Store selected college in local storage
        const college = colleges.find(c => (c.id || (c as any)._id) === selectedCollege);
        if (college) {
            localStorage.setItem('selected_college', JSON.stringify({
                id: college.id || (college as any)._id,
                name: college.name,
                domain: college.domain
            }));
        }

        navigate('/login');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] bg-indigo-50/10 rounded-full blur-[100px]" />

            <div className="max-w-md w-full relative z-10">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="mb-6 hover:bg-white"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>

                <Card className="border-none shadow-2xl rounded-3xl overflow-hidden backdrop-blur-sm bg-white/90">
                    <CardHeader className="p-8 text-center space-y-4">
                        <div className="mx-auto h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-3xl font-black tracking-tight">FIND YOUR CAMPUS</CardTitle>
                            <CardDescription className="text-slate-500 font-medium">
                                Select your institution to access your placement portal.
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="px-8 pb-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Institutional Network</label>
                            {loading ? (
                                <div className="h-12 w-full bg-slate-100 animate-pulse rounded-xl flex items-center px-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-slate-300 mr-2" />
                                    <span className="text-slate-300 text-sm font-medium">Loading universities...</span>
                                </div>
                            ) : (
                                <Select onValueChange={setSelectedCollege} value={selectedCollege}>
                                    <SelectTrigger className="h-14 rounded-xl border-slate-200 bg-white shadow-sm focus:ring-primary/20">
                                        <SelectValue placeholder="Search or select college" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                                        {colleges.length > 0 ? (
                                            colleges.map((college: any) => (
                                                <SelectItem key={college.id || college._id} value={college.id || college._id} className="cursor-pointer py-3 focus:bg-primary/5 focus:text-primary">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs text-xs">
                                                            {college.logo ? <img src={college.logo} alt="" className="h-full w-full object-contain" /> : college.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900">{college.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-medium">@{college.domain}</p>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-slate-500 text-sm">
                                                No colleges found. Enroll your college first!
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-4 flex items-start gap-3">
                            <Search className="h-5 w-5 text-slate-400 mt-0.5" />
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                If your college is not listed, your TPO (Training & Placement Officer) needs to enroll the institution first.
                            </p>
                        </div>
                    </CardContent>

                    <CardFooter className="p-8 pt-0">
                        <Button
                            onClick={handleNext}
                            className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-sm tracking-[0.2em] shadow-xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
                            disabled={!selectedCollege || loading}
                        >
                            Access Portal
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
