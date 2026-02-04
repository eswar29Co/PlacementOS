import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Building2, Mail, Phone, Globe, Shield, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { collegeService } from '@/services/collegeService';

export default function RegisterCollege() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        domain: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
        website: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await collegeService.registerCollege({
                name: formData.name,
                domain: formData.domain,
                address: formData.address,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                website: formData.website,
                adminData: {
                    name: formData.adminName,
                    email: formData.adminEmail,
                    password: formData.adminPassword,
                    role: 'admin'
                }
            });

            if (response.success) {
                setSuccess(true);
                toast.success("College registered successfully!");
                setTimeout(() => navigate('/login'), 3000);
            } else {
                toast.error(response.message || "Registration failed");
            }
        } catch (error: any) {
            toast.error(error.message || "An error occurred during registration");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
                <Card className="max-w-md w-full text-center p-8 space-y-6">
                    <div className="flex justify-center">
                        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Registration Complete!</h2>
                        <p className="text-slate-500">Your college has been successfully enrolled in PlacementOS. Redirecting you to login...</p>
                    </div>
                    <Button onClick={() => navigate('/login')} className="w-full">Go to Login</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/')}
                    className="mb-8 hover:bg-slate-200"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
                </Button>

                <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-primary text-white p-8">
                        <div className="flex items-center gap-4 mb-2">
                            <Building2 className="h-8 w-8" />
                            <CardTitle className="text-3xl font-black">ENROLL COLLEGE</CardTitle>
                        </div>
                        <CardDescription className="text-primary-foreground/80 font-medium">
                            Join the PlacementOS network and streamline your campus placements.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="p-8 space-y-8">
                            {/* College Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Shield className="h-5 w-5 text-primary" /> College Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">College Name</Label>
                                        <Input id="name" placeholder="MIT, Harvard, etc." required value={formData.name} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="domain">Official Domain</Label>
                                        <Input id="domain" placeholder="mit.edu" required value={formData.domain} onChange={handleChange} />
                                        <p className="text-[10px] text-slate-400 font-medium">Used for student verification (@college.com)</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Full Address</Label>
                                    <Textarea id="address" placeholder="Enter physical address" required value={formData.address} onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="contactEmail">Contact Email</Label>
                                        <Input id="contactEmail" type="email" placeholder="tpo@college.edu" required value={formData.contactEmail} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="contactPhone">Contact Phone</Label>
                                        <Input id="contactPhone" placeholder="+1 (555) 000-0000" required value={formData.contactPhone} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="website">Website URL (Optional)</Label>
                                    <Input id="website" placeholder="https://college.edu" value={formData.website} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="h-px bg-slate-100" />

                            {/* TPO / Admin Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-primary" /> Primary Admin (TPO) Account
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="adminName">Admin Name</Label>
                                        <Input id="adminName" placeholder="Full Name" required value={formData.adminName} onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="adminEmail">Admin Email</Label>
                                            <Input id="adminEmail" type="email" placeholder="admin@college.com" required value={formData.adminEmail} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="adminPassword">Login Password</Label>
                                            <Input id="adminPassword" type="password" placeholder="••••••••" required value={formData.adminPassword} onChange={handleChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="p-8 bg-slate-50 border-t flex flex-col items-center gap-4">
                            <Button
                                type="submit"
                                className="w-full h-14 text-lg font-bold uppercase tracking-widest"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Complete Registration"}
                            </Button>
                            <p className="text-xs text-slate-400 text-center">
                                By clicking register, you agree to our Terms of Service and Privacy Policy.
                                Our team will verify your college credentials within 24-48 hours.
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
