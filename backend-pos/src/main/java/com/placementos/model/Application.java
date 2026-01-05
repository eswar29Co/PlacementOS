package com.placementos.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "job_id")
    private Job job;
    
    @Column(length = 5000)
    private String resumeText;
    
    @Enumerated(EnumType.STRING)
    private Status status;
    
    @Column(length = 2000)
    private String feedback;
    
    @Column(length = 5000)
    private String atsAnalysisData;
    
    private LocalDateTime appliedAt;
    
    public enum Status {
        APPLIED,
        RESUME_REJECTED,
        RESUME_SHORTLISTED,
        ASSESSMENT_FAILED,
        ASSESSMENT_PASSED,
        INTERVIEW_PASSED,
        OFFERED,
        REJECTED
    }
    
    @PrePersist
    protected void onCreate() {
        appliedAt = LocalDateTime.now();
        if (status == null) {
            status = Status.APPLIED;
        }
    }
    
    // Constructors
    public Application() {}
    
    public Application(User user, Job job, String resumeText) {
        this.user = user;
        this.job = job;
        this.resumeText = resumeText;
        this.status = Status.APPLIED;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public Job getJob() { return job; }
    public void setJob(Job job) { this.job = job; }
    
    public String getResumeText() { return resumeText; }
    public void setResumeText(String resumeText) { this.resumeText = resumeText; }
    
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    
    public String getAtsAnalysisData() { return atsAnalysisData; }
    public void setAtsAnalysisData(String atsAnalysisData) { this.atsAnalysisData = atsAnalysisData; }
    
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
}
