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
@RequestMapping("/admin")
public class AdminController {
    
    @Autowired
    private InterviewService interviewService;
    
    @Autowired
    private ApplicationService applicationService;
    
    @GetMapping("/interviews")
    public String interviewList(HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null || user.getRole() != User.Role.ADMIN) {
            return "redirect:/login";
        }
        
        List<Interview> interviews = interviewService.getAllInterviews();
        model.addAttribute("interviews", interviews);
        model.addAttribute("user", user);
        
        return "admin-interview-list";
    }
    
    @GetMapping("/interviews/{id}/conduct")
    public String conductInterview(@PathVariable Long id, HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null || user.getRole() != User.Role.ADMIN) {
            return "redirect:/login";
        }
        
        Optional<Interview> interviewOpt = interviewService.getAllInterviews()
                .stream()
                .filter(i -> i.getId().equals(id))
                .findFirst();
        
        if (interviewOpt.isEmpty()) {
            return "redirect:/admin/interviews";
        }
        
        model.addAttribute("interview", interviewOpt.get());
        model.addAttribute("user", user);
        
        return "admin-conduct-interview";
    }
    
    @PostMapping("/interviews/{id}/submit")
    public String submitInterviewFeedback(
            @PathVariable Long id,
            @RequestParam String feedback,
            @RequestParam String verdict,
            HttpSession session) {
        
        User user = (User) session.getAttribute("user");
        if (user == null || user.getRole() != User.Role.ADMIN) {
            return "redirect:/login";
        }
        
        Interview.Verdict interviewVerdict = Interview.Verdict.valueOf(verdict);
        Interview interview = interviewService.submitFeedback(id, feedback, interviewVerdict);
        
        if (interview != null) {
            Application application = interview.getApplication();
            
            if (interviewVerdict == Interview.Verdict.PASS) {
                application.setStatus(Application.Status.OFFERED);
            } else {
                application.setStatus(Application.Status.REJECTED);
            }
            
            applicationService.updateApplication(application);
        }
        
        return "redirect:/admin/interviews";
    }
}
