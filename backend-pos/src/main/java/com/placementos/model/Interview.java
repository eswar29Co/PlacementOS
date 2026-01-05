package com.placementos.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
public class Interview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "application_id")
    private Application application;
    
    private String interviewerName;
    
    @Column(length = 2000)
    private String feedback;
    
    @Enumerated(EnumType.STRING)
    private Verdict verdict;
    
    private LocalDateTime conductedAt;
    
    public enum Verdict {
        PASS, FAIL, PENDING
    }
    
    @PrePersist
    protected void onCreate() {
        conductedAt = LocalDateTime.now();
    }
    
    // Constructors
    public Interview() {}
    
    public Interview(Application application, String interviewerName) {
        this.application = application;
        this.interviewerName = interviewerName;
        this.verdict = Verdict.PENDING;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Application getApplication() { return application; }
    public void setApplication(Application application) { this.application = application; }
    
    public String getInterviewerName() { return interviewerName; }
    public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }
    
    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }
    
    public Verdict getVerdict() { return verdict; }
    public void setVerdict(Verdict verdict) { this.verdict = verdict; }
    
    public LocalDateTime getConductedAt() { return conductedAt; }
    public void setConductedAt(LocalDateTime conductedAt) { this.conductedAt = conductedAt; }
}
