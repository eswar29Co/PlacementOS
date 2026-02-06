import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUser } from '@/store/slices/authSlice';
import { Student, Project, Certification } from '@/types';
import { studentService } from '@/services/studentService';
import {
  Upload, Github, Linkedin, FileText, Save,
  CheckCircle2, AlertTriangle, Zap, User,
  Briefcase, GraduationCap, MapPin, Mail,
  Phone, Globe, Sparkles, Target, BarChart3,
  ExternalLink, DownloadCloud, Terminal,
  Cpu, Activity, ShieldCheck, Fingerprint,
  Edit3, Plus, X, Link as LinkIcon, Monitor
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { generateATSAnalysis } from '@/lib/atsUtils';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

export default function Profile() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const student = user as Student;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState<string>(student?.resumeUrl ? 'resume.pdf' : '');
  const [atsAnalysis, setAtsAnalysis] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        phone: student.phone,
        linkedinUrl: student.linkedinUrl,
        githubUrl: student.githubUrl,
        skills: student.skills,
      });
      setProjects(student.projects || []);
      setCertifications(student.certifications || []);
    }
  }, [student]);

  const handleSave = async () => {
    try {
      const updates = {
        ...formData,
        projects,
        certifications,
      };
      const response = await studentService.updateStudent(student.id, updates);
      if (response.success) {
        dispatch(updateUser(response.data));
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResumeFile(file);
      setResumeName(file.name);
      toast.success('File selected: ' + file.name);
    }
  };

  const handleATSAnalysis = async () => {
    if (!resumeFile && !student?.resumeUrl) return toast.error('Resume required for scan');
    setAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setAtsAnalysis(generateATSAnalysis(resumeFile?.name || 'resume.pdf'));
    setAnalyzing(false);
    toast.success('Resume analysis complete!');
  };

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your personal information, skills, and resume">
      <div className="max-w-[1500px] mx-auto pb-20 space-y-12 relative">

        {/* Cinematic Background Decor */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[160px] -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/5 rounded-full blur-[140px] -z-10" />

        {/* Profile Summary */}
        <div className="relative group/hero">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/5 via-primary/5 to-indigo-500/5 rounded-[3.5rem] blur-xl opacity-50 group-hover/hero:opacity-80 transition duration-1000"></div>
          <Card className="relative border-slate-200 shadow-sm rounded-[3rem] bg-white border overflow-hidden">
            <CardContent className="p-10 lg:p-14 relative overflow-hidden">
              {/* Animated Background Pulse */}
              <div className="absolute top-0 right-0 h-96 w-96 bg-primary/5 rounded-full blur-[100px] animate-pulse-slow" />

              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative z-10">
                <div className="relative shrink-0">
                  <div className="relative p-1 rounded-[3.5rem] bg-slate-100">
                    <Avatar className="h-44 w-44 rounded-[3.2rem] bg-slate-50 flex items-center justify-center border-4 border-white shadow-xl text-slate-300 text-6xl font-black transition-all duration-500 group-hover/hero:scale-[1.02]">
                      <AvatarFallback className="bg-transparent tracking-tighter">
                        {student?.name?.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                      <AvatarImage src={student?.avatar} />
                    </Avatar>
                    {/* Active Status Ring */}
                    <div className="absolute inset-[-8px] rounded-[4rem] border border-emerald-500/10 animate-pulse-slow" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl shadow-lg border-4 border-white transform rotate-12 transition-transform group-hover/hero:rotate-0 flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                </div>

                <div className="flex-1 text-center lg:text-left space-y-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                      <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase text-slate-900 leading-none">
                        {student?.name?.split(' ')[0]}<span className="text-primary">{student?.name?.split(' ')[1] || ''}</span>
                      </h2>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black px-6 py-2 rounded-full uppercase text-[10px] tracking-[0.3em] inline-flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        VERIFIED STUDENT
                      </Badge>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-3">
                      <div className="h-px w-12 bg-slate-200" />
                      <p className="text-slate-400 font-bold flex items-center gap-3 uppercase tracking-[0.4em] text-[10px]">
                        <GraduationCap className="h-4 w-4 text-primary" /> {student?.branch} <span className="text-slate-200">•</span> {student?.college}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    <MetricBadge icon={Target} label="CGPA" value={student?.cgpa || '9.0'} color="text-emerald-600" />
                    <MetricBadge icon={Zap} label="BATCH" value={student?.graduationYear || '2024'} color="text-amber-600" />
                    <MetricBadge icon={MapPin} label="LOCATION" value="Remote" color="text-indigo-600" />
                  </div>
                </div>

                <div className="w-full lg:w-auto flex flex-col sm:flex-row lg:flex-col gap-4">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        className="h-16 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-lg shadow-emerald-200 gap-3 group/btn uppercase tracking-widest text-xs transition-all hover:scale-105"
                      >
                        <Save className="h-5 w-5" /> SAVE PROFILE
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        className="h-16 px-10 rounded-2xl border-slate-200 bg-white hover:bg-slate-50 text-slate-900 font-black gap-3 uppercase tracking-widest text-xs transition-all"
                      >
                        CANCEL
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="h-16 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 gap-3 group/btn uppercase tracking-widest text-xs transition-all hover:scale-105"
                    >
                      <Edit3 className="h-5 w-5" /> EDIT PROFILE
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Personal Info Column */}
          <div className="lg:col-span-8 space-y-10">
            <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border group">
              <CardHeader className="p-12 pb-6 border-b border-slate-100 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-[80px] -z-10" />
                <div className="flex items-center justify-between relative z-10">
                  <div className="space-y-2">
                    <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4 text-slate-900">
                      <Terminal className="h-8 w-8 text-primary" /> ACCOUNT INFORMATION
                    </CardTitle>
                    <CardDescription className="font-bold text-[10px] uppercase tracking-[0.3em] text-slate-400">Manage your basic details and academic info</CardDescription>
                  </div>
                  <Cpu className="h-10 w-10 text-primary animate-pulse opacity-20" />
                </div>
              </CardHeader>
              <CardContent className="p-12 space-y-12">
                <div className="grid gap-12 md:grid-cols-2">
                  <FormInput
                    label="Full Name"
                    icon={User}
                    value={formData.name}
                    onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
                    readOnly={!isEditing}
                  />
                  <FormInput label="Email Address" icon={Mail} value={student?.email} readOnly />
                  <FormInput
                    label="Phone Number"
                    icon={Phone}
                    value={formData.phone}
                    onChange={(e: any) => setFormData({ ...formData, phone: e.target.value })}
                    readOnly={!isEditing}
                  />
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">PROFESSIONAL LINKS (LINKEDIN)</Label>
                    <div className="flex gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm group/link transition-all hover:bg-indigo-100/50">
                        <Linkedin className="h-6 w-6 text-indigo-600" />
                      </div>
                      <Input
                        value={formData.linkedinUrl || ''}
                        onChange={(e: any) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        readOnly={!isEditing}
                        placeholder="linkedin.com/in/..."
                        className="h-14 bg-white border-slate-200 rounded-2xl font-black text-slate-900 shadow-sm focus-visible:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8 pt-10 border-t border-slate-100 relative">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1">SKILLS & EXPERTISE</Label>
                    <Sparkles className="h-5 w-5 text-primary opacity-30" />
                  </div>
                  <div className="flex flex-wrap gap-4 p-12 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 min-h-[160px] relative overflow-hidden group/matrix">
                    <div className="absolute bottom-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-[80px] -z-10 group-hover/matrix:scale-150 transition-transform duration-1000" />
                    {formData.skills?.map((skill, index) => (
                      <Badge key={index} className="h-14 px-8 rounded-2xl bg-white text-slate-900 border border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all font-black uppercase text-[11px] tracking-[0.2em] shadow-sm cursor-default relative group/badge">
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => setFormData({ ...formData, skills: formData.skills?.filter((_, i) => i !== index) })}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/badge:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                    {isEditing && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const skill = prompt('Enter skill');
                          if (skill) setFormData({ ...formData, skills: [...(formData.skills || []), skill] });
                        }}
                        className="h-14 px-8 rounded-2xl bg-primary/5 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all font-black uppercase text-[10px] tracking-[0.2em]"
                      >
                        + ADD SKILL
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projects Section */}
            <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border group">
              <CardHeader className="p-12 pb-6 border-b border-slate-100 bg-slate-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                    <Briefcase className="h-7 w-7 text-primary" /> PROJECTS
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Showcase your best work and technical projects</CardDescription>
                </div>
                {isEditing && (
                  <Button
                    onClick={() => setProjects([...projects, { title: '', description: '', technologies: [] }])}
                    className="rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[9px] tracking-widest py-2 px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" /> ADD PROJECT
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-12 space-y-8">
                {projects.length === 0 ? (
                  <div className="text-center py-12 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <Monitor className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No projects added yet</p>
                  </div>
                ) : (
                  <div className="grid gap-8">
                    {projects.map((project, index) => (
                      <div key={index} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm relative group/project hover:border-primary/20 transition-all">
                        {isEditing && (
                          <button
                            onClick={() => setProjects(projects.filter((_, i) => i !== index))}
                            className="absolute top-6 right-6 h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                        <div className="space-y-6">
                          {isEditing ? (
                            <div className="space-y-4">
                              <Input
                                placeholder="Project Title"
                                value={project.title || ''}
                                onChange={(e) => {
                                  const newProjects = [...projects];
                                  newProjects[index].title = e.target.value;
                                  setProjects(newProjects);
                                }}
                                className="font-black text-xl border-none p-0 focus-visible:ring-0 uppercase tracking-tight text-slate-900 h-auto"
                              />
                              <Textarea
                                placeholder="Project Description"
                                value={project.description || ''}
                                onChange={(e) => {
                                  const newProjects = [...projects];
                                  newProjects[index].description = e.target.value;
                                  setProjects(newProjects);
                                }}
                                className="font-medium text-xs text-slate-500 border-none p-0 focus-visible:ring-0 resize-none h-24"
                              />
                              <div className="flex gap-4">
                                <div className="flex-1 relative">
                                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                  <Input
                                    placeholder="Project Link (Optional)"
                                    value={project.link || ''}
                                    onChange={(e) => {
                                      const newProjects = [...projects];
                                      newProjects[index].link = e.target.value;
                                      setProjects(newProjects);
                                    }}
                                    className="pl-12 h-12 bg-slate-50 border-slate-100 rounded-xl text-xs font-bold"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">{project.title}</h4>
                                {project.link && (
                                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:scale-110 transition-transform">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                )}
                              </div>
                              <p className="text-xs font-medium text-slate-500 leading-relaxed">{project.description}</p>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {project.technologies?.map((tech, ti) => (
                              <Badge key={ti} variant="secondary" className="bg-slate-50 text-slate-400 text-[9px] font-black uppercase px-3 py-1 border border-slate-100 rounded-lg">
                                {tech}
                              </Badge>
                            ))}
                            {isEditing && (
                              <Button
                                variant="ghost"
                                onClick={() => {
                                  const tech = prompt('Enter technology');
                                  if (tech) {
                                    const newProjects = [...projects];
                                    newProjects[index].technologies = [...(newProjects[index].technologies || []), tech];
                                    setProjects(newProjects);
                                  }
                                }}
                                className="h-8 px-4 rounded-lg bg-primary/5 text-primary border border-primary/20 font-black uppercase text-[8px] tracking-widest"
                              >
                                + TECH
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certifications Section */}
            <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border group">
              <CardHeader className="p-12 pb-6 border-b border-slate-100 bg-slate-50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black uppercase tracking-tighter flex items-center gap-4">
                    <ShieldCheck className="h-7 w-7 text-emerald-600" /> CERTIFICATIONS
                  </CardTitle>
                  <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Professional credentials and endorsements</CardDescription>
                </div>
                {isEditing && (
                  <Button
                    onClick={() => setCertifications([...certifications, { name: '', organization: '' }])}
                    className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[9px] tracking-widest py-2 px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" /> ADD CERT
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-12 space-y-8">
                {certifications.length === 0 ? (
                  <div className="text-center py-12 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                    <Target className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No certifications added</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {certifications.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100 group/cert">
                        <div className="flex items-center gap-6">
                          <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-amber-500" />
                          </div>
                          <div className="space-y-1">
                            {isEditing ? (
                              <div className="flex gap-4">
                                <Input
                                  placeholder="Certification Name"
                                  value={cert.name || ''}
                                  onChange={(e) => {
                                    const newCerts = [...certifications];
                                    newCerts[index].name = e.target.value;
                                    setCertifications(newCerts);
                                  }}
                                  className="h-9 font-black text-xs uppercase"
                                />
                                <Input
                                  placeholder="Organization"
                                  value={cert.organization || ''}
                                  onChange={(e) => {
                                    const newCerts = [...certifications];
                                    newCerts[index].organization = e.target.value;
                                    setCertifications(newCerts);
                                  }}
                                  className="h-9 font-bold text-xs"
                                />
                              </div>
                            ) : (
                              <>
                                <h5 className="font-black text-sm text-slate-900 uppercase tracking-tight">{cert.name}</h5>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cert.organization}</p>
                              </>
                            )}
                          </div>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => setCertifications(certifications.filter((_, i) => i !== index))}
                            className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover/cert:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="relative group/portfolio">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-indigo-600/10 rounded-[3.5rem] blur opacity-30 group-hover/portfolio:opacity-50 transition duration-700 mx-1" />
              <Card className="relative border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border text-slate-900">
                <CardContent className="p-14 flex flex-col md:flex-row items-center justify-between gap-12 relative">
                  <div className="absolute top-0 right-0 h-64 w-64 bg-primary/5 rounded-full blur-[100px] -z-10" />
                  <div className="space-y-8 relative z-10 text-center md:text-left">
                    <div className="space-y-2">
                      <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">PORTFOLIO <span className="text-primary">WEBSITE</span></h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">YOUR PROFESSIONAL ONLINE PRESENCE</p>
                    </div>
                    <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-sm">
                      Create a professional portfolio website based on your profile and skills to help recruiters find you.
                    </p>
                    <Button className="h-16 px-12 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-lg shadow-primary/20 uppercase tracking-[0.2em] text-xs transition-all hover:scale-105">CREATE PORTFOLIO</Button>
                  </div>
                  <div className="h-56 w-56 bg-slate-50 rounded-[3rem] flex items-center justify-center border border-slate-100 rotate-6 group-hover/portfolio:rotate-0 transition-all duration-700 shadow-sm">
                    <Fingerprint className="h-32 w-32 text-primary opacity-20 animate-pulse-slow" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Resume & Analysis Column */}
          <div className="lg:col-span-4 space-y-10">
            <Card className="border-slate-200 shadow-sm rounded-[3rem] overflow-hidden bg-white border">
              <CardHeader className="p-12 pb-6 border-b border-slate-100 bg-slate-50">
                <CardTitle className="text-xl font-black uppercase tracking-tighter flex items-center gap-4 text-slate-900">
                  <Briefcase className="h-6 w-6 text-primary" /> RESUME & MATCHING
                </CardTitle>
              </CardHeader>
              <CardContent className="p-12 space-y-12">
                <div className="group relative">
                  <input type="file" id="resume-upload" className="hidden" onChange={handleResumeChange} />
                  <label htmlFor="resume-upload" className="block p-14 border-2 border-dashed border-slate-200 rounded-[3rem] text-center hover:border-primary/50 transition-all cursor-pointer bg-slate-50/50 hover:bg-slate-50 shadow-sm group/upload overflow-hidden relative">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Upload className="h-14 w-14 text-slate-300 mx-auto mb-6 group-hover:scale-110 group-hover:text-primary transition-all duration-500" />
                    <p className="font-black text-[11px] uppercase tracking-[0.4em] text-slate-400 relative z-10 group-hover:text-slate-600">
                      {resumeName ? `LOADED: ${resumeName}` : 'UPLOAD RESUME'}
                    </p>
                  </label>
                </div>

                {(student?.resumeUrl || resumeName) && (
                  <div className="space-y-4">
                    <div className="relative group/scan">
                      <div className="absolute -inset-1 bg-primary rounded-2xl blur opacity-0 group-hover/scan:opacity-20 transition" />
                      <Button
                        className="w-full h-16 rounded-2xl font-black gap-3 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white text-xs uppercase tracking-[0.2em] transition-all hover:translate-y-[-2px]"
                        onClick={handleATSAnalysis}
                        disabled={analyzing}
                      >
                        <Zap className="h-5 w-5 fill-current" /> {analyzing ? 'ANALYZING...' : 'CHECK RESUME MATCH'}
                      </Button>
                    </div>
                    {student?.resumeUrl && (
                      <Button variant="outline" className="w-full h-16 rounded-2xl border-slate-200 bg-white font-black gap-3 text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all" asChild>
                        <a href={student.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-5 w-5" /> VIEW RESUME
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {atsAnalysis && (
                  <div className="space-y-10 pt-10 border-t border-slate-100 animate-in fade-in slide-in-from-top-6 duration-700">
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">RESUME SCORE</p>
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest animate-pulse">Good Profile Match</p>
                        </div>
                        <p className="text-5xl font-black text-primary leading-none">{atsAnalysis.atsScore}<span className="text-xs opacity-30 not-italic ml-1 font-bold">/100</span></p>
                      </div>
                      <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden p-1">
                        <div className="h-full bg-primary rounded-full transition-all duration-1500 ease-out shadow-[0_0_15px_rgba(20,184,166,0.3)]" style={{ width: `${atsAnalysis.atsScore}%` }}>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 relative overflow-hidden group/feedback">
                      <Sparkles className="absolute -right-6 -top-6 h-24 w-24 text-primary opacity-5 rotate-12 transition-transform group-hover/feedback:scale-125" />
                      <p className="text-xs font-bold leading-relaxed text-slate-500 relative z-10">{atsAnalysis.summary}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group/metric">
                        <div className="absolute top-0 right-0 h-16 w-16 bg-primary/5 rounded-full blur-2xl" />
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] mb-3">MATCHING KEYWORDS</p>
                        <p className="text-3xl font-black text-slate-900 leading-none">{atsAnalysis.keywordMatches.length}</p>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group/metric">
                        <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/5 rounded-full blur-2xl" />
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em] mb-3">WORD COUNT</p>
                        <p className="text-3xl font-black text-slate-900 leading-none">{atsAnalysis.readability.wordCount}</p>
                      </div>
                    </div>

                    <Button variant="ghost" className="w-full rounded-2xl font-black text-[10px] uppercase text-primary hover:bg-primary/5 h-16 tracking-[0.4em] transition-all">VIEW DETAILED REPORT <ChevronRight className="ml-2 h-4 w-4" /></Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="p-10 rounded-[3rem] bg-amber-50 rounded-[3rem] border border-amber-100 group/security">
              <div className="flex gap-8 items-start">
                <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shrink-0 border border-amber-200 shadow-sm group-hover/security:rotate-12 transition-transform">
                  <Activity className="h-8 w-8 text-amber-500" />
                </div>
                <div className="space-y-3">
                  <h4 className="font-black text-[11px] uppercase tracking-[0.3em] text-amber-600">DATA PRIVACY</h4>
                  <p className="text-[11px] font-bold text-slate-400 leading-relaxed">
                    Your data is securely stored and protected. We use advanced encryption to keep your info safe.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function MetricBadge({ icon: Icon, label, value, color }: any) {
  return (
    <div className="flex items-center gap-4 bg-slate-50 px-8 py-3 rounded-2xl border border-slate-200 shadow-sm transition-all hover:border-primary/20">
      <Icon className={cn("h-4.5 w-4.5", color)} />
      <div className="flex items-baseline gap-2">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</span>
        <span className="text-sm font-black text-slate-900">{value}</span>
      </div>
    </div>
  );
}

function FormInput({ label, icon: Icon, value, onChange, readOnly = false }: any) {
  return (
    <div className="space-y-4 group">
      <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 transition-colors group-focus-within:text-primary">{label}</Label>
      <div className="relative">
        <Icon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
        <Input
          value={value || ''}
          onChange={onChange}
          readOnly={readOnly}
          className={cn(
            "h-16 pl-14 bg-white border-slate-200 rounded-2xl font-black text-slate-900 shadow-sm transition-all focus-visible:ring-primary/20 hover:bg-slate-50 focus-visible:bg-slate-50 placeholder:opacity-20",
            readOnly && "opacity-50 cursor-not-allowed group-hover:bg-white"
          )}
        />
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>;
}
