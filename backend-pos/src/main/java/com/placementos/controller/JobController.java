package com.placementos.controller;

import com.placementos.model.Job;
import com.placementos.model.User;
import com.placementos.service.JobService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/jobs")
public class JobController {
    
    @Autowired
    private JobService jobService;
    
    @GetMapping
    public String listJobs(HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        List<Job> jobs = jobService.getAllJobs();
        model.addAttribute("jobs", jobs);
        model.addAttribute("user", user);
        
        return "job-list";
    }
    
    @GetMapping("/{id}")
    public String jobDetail(@PathVariable Long id, HttpSession session, Model model) {
        User user = (User) session.getAttribute("user");
        if (user == null) {
            return "redirect:/login";
        }
        
        Optional<Job> jobOpt = jobService.getJobById(id);
        if (jobOpt.isEmpty()) {
            return "redirect:/jobs";
        }
        
        model.addAttribute("job", jobOpt.get());
        model.addAttribute("user", user);
        
        return "job-detail";
    }
}
