import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfessional } from '@/store/slices/professionalsSlice';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { X, Plus, Save, Briefcase, Award, User } from 'lucide-react';

export default function ProfessionalProfile() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const professional = useAppSelector((state) =>
    state.professionals.professionals.find((p) => p.id === user?.id)
  );

  const [techStack, setTechStack] = useState<string[]>([]);
  const [newTech, setNewTech] = useState('');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (professional) {
      setTechStack(professional.techStack || []);
      setYearsOfExperience(professional.yearsOfExperience || 0);
      setBio(professional.bio || '');
    }
  }, [professional]);

  const handleAddTech = () => {
    if (!newTech.trim()) return;
    if (techStack.includes(newTech.trim())) {
      toast.error('Technology already added');
      return;
    }
    setTechStack([...techStack, newTech.trim()]);
    setNewTech('');
  };

  const handleRemoveTech = (tech: string) => {
    setTechStack(techStack.filter((t) => t !== tech));
  };

  const handleSave = () => {
    if (techStack.length === 0) {
      toast.error('Please add at least one technology');
      return;
    }

    if (yearsOfExperience < 0 || yearsOfExperience > 50) {
      toast.error('Please enter valid years of experience');
      return;
    }

    if (!professional) return;

    dispatch(updateProfessional({
      id: professional.id,
      updates: {
        techStack,
        yearsOfExperience,
        bio,
      },
    }));

    toast.success('Profile updated successfully!');
  };

  if (!professional) {
    return (
      <DashboardLayout title="Profile" subtitle="Professional profile">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Professional profile not found.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title="Professional Profile" 
      subtitle="Manage your professional information"
    >
      <div className="space-y-6">
        {/* Basic Info (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Your account details (managed by admin)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{professional.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{professional.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Company</Label>
                <p className="font-medium">{professional.company}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Designation</Label>
                <p className="font-medium">{professional.designation}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <Badge variant="secondary" className="w-fit">
                  {professional.professionalRole || 'Not Assigned'}
                </Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <Badge 
                  variant={professional.status === 'approved' ? 'default' : 'secondary'}
                  className="w-fit"
                >
                  {professional.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Tech Stack
            </CardTitle>
            <CardDescription>Technologies and skills you specialize in</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newTech">Add Technology</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="newTech"
                  placeholder="e.g., React, Python, AWS"
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTech()}
                />
                <Button onClick={handleAddTech} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label>Current Tech Stack</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {techStack.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No technologies added yet</p>
                ) : (
                  techStack.map((tech) => (
                    <Badge key={tech} variant="secondary" className="px-3 py-1">
                      {tech}
                      <button
                        onClick={() => handleRemoveTech(tech)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experience */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Experience
            </CardTitle>
            <CardDescription>Your professional experience details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(parseInt(e.target.value) || 0)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about your professional background, expertise, and interests..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={5}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                This bio will be visible to students and administrators
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statistics (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Statistics</CardTitle>
            <CardDescription>Your interview activity summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">{professional.interviewsTaken}</p>
                <p className="text-sm text-muted-foreground">Total Interviews</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-500">{professional.activeInterviewCount}</p>
                <p className="text-sm text-muted-foreground">Active Assignments</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-500">
                  {professional.rating.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
