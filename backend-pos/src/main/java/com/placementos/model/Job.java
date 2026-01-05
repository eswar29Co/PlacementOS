package com.placementos.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "jobs")
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String roleType;
    private String companyType;
    private Double ctcMin;
    private Double ctcMax;
    
    @Column(length = 1000)
    private String eligibilityText;
    
    private LocalDate deadline;
    
    // Constructors
    public Job() {}
    
    public Job(String title, String roleType, String companyType, 
               Double ctcMin, Double ctcMax, String eligibilityText, LocalDate deadline) {
        this.title = title;
        this.roleType = roleType;
        this.companyType = companyType;
        this.ctcMin = ctcMin;
        this.ctcMax = ctcMax;
        this.eligibilityText = eligibilityText;
        this.deadline = deadline;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getRoleType() { return roleType; }
    public void setRoleType(String roleType) { this.roleType = roleType; }
    
    public String getCompanyType() { return companyType; }
    public void setCompanyType(String companyType) { this.companyType = companyType; }
    
    public Double getCtcMin() { return ctcMin; }
    public void setCtcMin(Double ctcMin) { this.ctcMin = ctcMin; }
    
    public Double getCtcMax() { return ctcMax; }
    public void setCtcMax(Double ctcMax) { this.ctcMax = ctcMax; }
    
    public String getEligibilityText() { return eligibilityText; }
    public void setEligibilityText(String eligibilityText) { this.eligibilityText = eligibilityText; }
    
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
}
