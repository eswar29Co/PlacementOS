package com.placementos.controller;

import com.placementos.model.*;
import com.placementos.service.*;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/applications")
public class ApplicationController {
    
    @Autowired
    private ApplicationService applicationService;
    
    @Autowired
    private JobService jobService;
    
    @Autowired
    private ResumeScreeningService resumeScreeningService;
    
    @Autowired
    private AssessmentService assessmentService;
    
    @Autowired
    private InterviewService interviewService;
    
    @GetMapping("/my-applications")
    public String myApplications(HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        List<Application> applications = applicationService.getApplicationsByUser(user);
        model.addAttribute("applications", applications);
        model.addAttribute("user", user);
        
        return "my-applications";
    }
    
    @GetMapping("/apply/{jobId}")
    public String applyForm(@PathVariable Long jobId, HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        Optional<Job> jobOpt = jobService.getJobById(jobId);
        if (jobOpt.isEmpty()) {
            return "redirect:/jobs";
        }
        
        model.addAttribute("job", jobOpt.get());
        model.addAttribute("user", user);
        
        return "apply-form";
    }
    
    @PostMapping("/apply/{jobId}")
    public String submitApplication(
            @PathVariable Long jobId,
            @RequestParam String resumeText,
            HttpSession session) {
        
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        Optional<Job> jobOpt = jobService.getJobById(jobId);
        if (jobOpt.isEmpty()) {
            return "redirect:/jobs";
        }
        
        Application application = applicationService.createApplication(user, jobOpt.get(), resumeText);
        
        return "redirect:/applications/" + application.getId() + "/ats-analysis";
    }
    
    @GetMapping("/{id}/ats-analysis")
    public String atsAnalysis(@PathVariable Long id, HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        Optional<Application> appOpt = applicationService.getApplicationById(id);
        if (appOpt.isEmpty()) {
            return "redirect:/applications/my-applications";
        }
        
        Application application = appOpt.get();
        
        // Run ATS analysis
        ATSAnalysisResult atsResult = resumeScreeningService.analyzeResume(application);
        
        // Store ATS analysis data as JSON (in production, use Jackson ObjectMapper)
        String atsJson = convertATSResultToJson(atsResult);
        application.setAtsAnalysisData(atsJson);
        
        // Update resume screening status based on old logic
        ResumeScreeningService.ScreeningResult screeningResult = resumeScreeningService.screenResume(application);
        
        if (screeningResult.isPassed()) {
            application.setStatus(Application.Status.RESUME_SHORTLISTED);
        } else {
            application.setStatus(Application.Status.RESUME_REJECTED);
        }
        application.setFeedback(screeningResult.getFeedback());
        applicationService.updateApplication(application);
        
        model.addAttribute("application", application);
        model.addAttribute("atsResult", atsResult);
        model.addAttribute("user", user);
        
        return "ats-analysis-result";
    }
    
    @GetMapping("/{id}/screening")
    public String resumeScreening(@PathVariable Long id, HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        Optional<Application> appOpt = applicationService.getApplicationById(id);
        if (appOpt.isEmpty()) {
            return "redirect:/applications/my-applications";
        }
        
        Application application = appOpt.get();
        
        // Run AI screening
        ResumeScreeningService.ScreeningResult result = resumeScreeningService.screenResume(application);
        
        if (result.isPassed()) {
            application.setStatus(Application.Status.RESUME_SHORTLISTED);
        } else {
            application.setStatus(Application.Status.RESUME_REJECTED);
        }
        application.setFeedback(result.getFeedback());
        applicationService.updateApplication(application);
        
        model.addAttribute("application", application);
        model.addAttribute("result", result);
        model.addAttribute("user", user);
        
        return "resume-screening-result";
    }
    
    @GetMapping("/{id}/assessment")
    public String assessmentPage(@PathVariable Long id, HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        Optional<Application> appOpt = applicationService.getApplicationById(id);
        if (appOpt.isEmpty() || appOpt.get().getStatus() != Application.Status.RESUME_SHORTLISTED) {
            return "redirect:/applications/my-applications";
        }
        
        model.addAttribute("application", appOpt.get());
        model.addAttribute("user", user);
        
        return "assessment-start";
    }
    
    @PostMapping("/{id}/assessment/submit")
    public String submitAssessment(@PathVariable Long id, HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        Optional<Application> appOpt = applicationService.getApplicationById(id);
        if (appOpt.isEmpty()) {
            return "redirect:/applications/my-applications";
        }
        
        Application application = appOpt.get();
        
        // Conduct assessment
        AssessmentAttempt attempt = assessmentService.conductAssessment(application);
        
        if (attempt.getPassed()) {
            application.setStatus(Application.Status.ASSESSMENT_PASSED);
            // Auto-schedule interview
            interviewService.scheduleInterview(application, "System Admin");
        } else {
            application.setStatus(Application.Status.ASSESSMENT_FAILED);
        }
        
        applicationService.updateApplication(application);
        
        return "redirect:/applications/" + id + "/assessment/result";
    }
    
    @GetMapping("/{id}/assessment/result")
    public String assessmentResult(@PathVariable Long id, HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        Optional<Application> appOpt = applicationService.getApplicationById(id);
        if (appOpt.isEmpty()) {
            return "redirect:/applications/my-applications";
        }
        
        Application application = appOpt.get();
        Optional<AssessmentAttempt> attemptOpt = assessmentService.getAttemptByApplication(application);
        
        if (attemptOpt.isEmpty()) {
            return "redirect:/applications/my-applications";
        }
        
        AssessmentAttempt attempt = attemptOpt.get();
        String feedback = assessmentService.generateFeedback(attempt.getScore());
        
        model.addAttribute("application", application);
        model.addAttribute("attempt", attempt);
        model.addAttribute("feedback", feedback);
        model.addAttribute("user", user);
        
        return "assessment-result";
    }
    
    @GetMapping("/{id}/interview")
    public String interviewStatus(@PathVariable Long id, HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        Optional<Application> appOpt = applicationService.getApplicationById(id);
        if (appOpt.isEmpty()) {
            return "redirect:/applications/my-applications";
        }
        
        Application application = appOpt.get();
        Optional<Interview> interviewOpt = interviewService.getInterviewByApplication(application);
        
        model.addAttribute("application", application);
        model.addAttribute("interview", interviewOpt.orElse(null));
        model.addAttribute("user", user);
        
        return "interview-status";
    }
    
    @GetMapping("/{id}/offer")
    public String offerLetter(@PathVariable Long id, HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        Optional<Application> appOpt = applicationService.getApplicationById(id);
        if (appOpt.isEmpty() || appOpt.get().getStatus() != Application.Status.OFFERED) {
            return "redirect:/applications/my-applications";
        }
        
        model.addAttribute("application", appOpt.get());
        model.addAttribute("user", user);
        
        return "offer-letter";
    }
    
    @GetMapping("/{id}/report")
    public String finalReport(@PathVariable Long id, HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        Optional<Application> appOpt = applicationService.getApplicationById(id);
        if (appOpt.isEmpty()) {
            return "redirect:/applications/my-applications";
        }
        
        Application application = appOpt.get();
        Optional<AssessmentAttempt> attemptOpt = assessmentService.getAttemptByApplication(application);
        Optional<Interview> interviewOpt = interviewService.getInterviewByApplication(application);
        
        model.addAttribute("application", application);
        model.addAttribute("attempt", attemptOpt.orElse(null));
        model.addAttribute("interview", interviewOpt.orElse(null));
        model.addAttribute("user", user);
        
        return "final-report";
    }
    
    private String convertATSResultToJson(ATSAnalysisResult result) {
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"atsScore\":").append(result.getAtsScore()).append(",");
        json.append("\"passed\":").append(result.isPassed()).append(",");
        json.append("\"summary\":\"").append(escapeJson(result.getSummary())).append("\"");
        json.append("}");
        return json.toString();
    }
    
    private String escapeJson(String str) {
        return str.replace("\"", "\\\"").replace("\n", "\\n");
    }
}

