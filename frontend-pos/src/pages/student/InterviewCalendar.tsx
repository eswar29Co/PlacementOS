import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useQuery } from '@tanstack/react-query';
import { applicationService } from '@/services';
import {
  Calendar as CalendarIcon, Video, Clock, User,
  CheckCircle, ChevronLeft, ChevronRight, Zap,
  Target, Info, MapPin, Sparkles, Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';

export default function InterviewCalendar() {
  const { user } = useAppSelector((state) => state.auth);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: applicationsData, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => applicationService.getMyApplications(),
  });

  const applications = Array.isArray(applicationsData?.data) ? applicationsData.data : [];
  const myApplications = applications.filter(app => app.studentId === user?.id);

  const allInterviews = myApplications.flatMap(app => {
    const interviews = [];
    if (app.status === 'professional_interview_scheduled' || app.status === 'professional_interview_completed') {
      interviews.push({ type: 'Technical', date: app.scheduledDate, app, status: app.status.includes('completed') ? 'completed' : 'scheduled' });
    }
    if (app.status === 'manager_interview_scheduled' || app.status === 'manager_interview_completed') {
      interviews.push({ type: 'Managerial', date: app.scheduledDate, app, status: app.status.includes('completed') ? 'completed' : 'scheduled' });
    }
    if (app.status === 'hr_interview_scheduled' || app.status === 'hr_interview_completed') {
      interviews.push({ type: 'HR', date: app.scheduledDate, app, status: app.status.includes('completed') ? 'completed' : 'scheduled' });
    }
    return interviews;
  });

  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  const selectedDateInterviews = allInterviews.filter(i => i.date && isSameDay(new Date(i.date), selectedDate));

  return (
    <DashboardLayout title="Interview Calendar" subtitle="Manage and track your upcoming interview schedules">
      <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Side: Dynamic Calendar */}
          <Card className="lg:col-span-8 border-slate-200 shadow-sm rounded-[2.5rem] overflow-hidden bg-white border">
            <CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-3xl font-black flex items-center gap-3 text-slate-900">
                    {format(currentDate, 'MMMM yyyy')}
                  </CardTitle>
                  <CardDescription className="font-bold flex items-center gap-2 text-slate-400">
                    <Zap className="h-3 w-3 text-amber-500 fill-amber-500" /> Selected Date: {format(selectedDate, 'do MMM, yyyy')}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 p-1 bg-white rounded-2xl shadow-inner border border-slate-100">
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-primary" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="font-black px-4 text-slate-600 hover:text-primary" onClick={() => { setCurrentDate(new Date()); setSelectedDate(new Date()); }}>
                    Today
                  </Button>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-primary" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-8">
              <div className="grid grid-cols-7 gap-1 md:gap-4 mb-4">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                  <div key={day} className="text-center text-[10px] font-black text-slate-400 tracking-widest">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 md:gap-4">
                {calendarDays.map((day, i) => {
                  const hasInterviews = allInterviews.some(int => int.date && isSameDay(new Date(int.date), day));
                  const isSelected = isSameDay(day, selectedDate);
                  const isTodayDate = isToday(day);
                  const isCurrentMonth = format(day, 'M') === format(currentDate, 'M');

                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "relative aspect-square md:h-24 rounded-2xl md:rounded-3xl cursor-pointer transition-all duration-300 group flex flex-col items-center justify-center border-2",
                        isSelected ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" : "bg-slate-50 hover:bg-slate-100 border-transparent",
                        !isCurrentMonth && !isSelected && "opacity-20",
                        isTodayDate && !isSelected && "border-primary/20 bg-primary/5"
                      )}
                    >
                      <span className={cn("text-lg font-black", isSelected ? "text-white" : "text-slate-900")}>
                        {format(day, 'd')}
                      </span>
                      {hasInterviews && (
                        <div className={cn(
                          "mt-1.5 h-1.5 w-1.5 rounded-full animate-pulse",
                          isSelected ? "bg-white" : "bg-primary"
                        )} />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Right Side: Operational Tasks */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black flex items-center gap-2 text-slate-900">
                <Target className="h-5 w-5 text-primary" /> Tasks For Today
              </h3>
              <Badge className="bg-primary/10 text-primary border-none font-black shadow-none">{selectedDateInterviews.length} Interviews</Badge>
            </div>

            {selectedDateInterviews.length === 0 ? (
              <Card className="border-slate-200 shadow-sm rounded-[2rem] bg-white border p-8 text-center space-y-4">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Clock className="h-8 w-8 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-lg text-slate-800">No Interviews</p>
                  <p className="text-xs font-medium text-slate-400">You have no interviews scheduled for this day.</p>
                </div>
                <Button variant="ghost" className="w-full font-bold text-primary hover:bg-primary/5">View Jobs</Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {selectedDateInterviews.map((int, idx) => (
                  <Card key={idx} className="border-slate-200 shadow-sm rounded-[2rem] overflow-hidden group hover:scale-[1.02] transition-transform duration-300 bg-white border">
                    <div className={cn("h-2 w-full", int.status === 'completed' ? "bg-emerald-500" : "bg-primary")} />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="space-y-1">
                          <Badge className={cn("border-none font-black text-[9px] uppercase tracking-tighter shadow-none", int.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-primary/10 text-primary")}>
                            {int.type} Round
                          </Badge>
                          <h4 className="font-black text-lg leading-tight uppercase tracking-tight text-slate-900">{int.app.jobId?.roleTitle}</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {int.app.jobId?.companyName}
                          </p>
                        </div>
                        {int.status === 'completed' ? <CheckCircle className="h-6 w-6 text-emerald-500" /> : <Zap className="h-6 w-6 text-amber-500 fill-amber-500" />}
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-4 shadow-inner">
                        <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                          <Clock className="h-3.5 w-3.5 text-primary" />
                          {int.date && format(new Date(int.date), 'hh:mm a')}
                        </div>
                        <Badge variant="outline" className="border-none font-bold text-[9px] uppercase tracking-widest text-slate-400 shadow-none">Local Time</Badge>
                      </div>

                      {int.status === 'scheduled' && int.app.meetingLink ? (
                        <Button className="w-full h-11 rounded-xl font-black gap-2 shadow-lg shadow-primary/10" onClick={() => window.open(int.app.meetingLink, '_blank')}>
                          <Video className="h-4 w-4" /> Join Meeting
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full h-11 rounded-xl border-2 font-black gap-2 opacity-50">
                          {int.status === 'completed' ? 'Completed' : 'Link Pending'}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Card className="border-none shadow-xl rounded-[2rem] bg-gradient-to-br from-primary to-blue-600 p-8 text-white relative overflow-hidden group">
              <Sparkles className="absolute -right-4 -top-4 h-24 w-24 opacity-10 group-hover:scale-125 transition-transform duration-1000" />
              <div className="relative z-10 space-y-4">
                <h3 className="text-xl font-black leading-tight">Prepare for Success</h3>
                <p className="text-white/70 text-xs font-medium leading-relaxed">Remember to review your core subjects before your next interview.</p>
                <Button variant="secondary" className="w-full rounded-xl font-black text-primary shadow-xl">
                  Get Prepared
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
