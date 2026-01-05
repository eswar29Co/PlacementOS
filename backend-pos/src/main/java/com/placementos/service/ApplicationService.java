package com.placementos.service;

import com.placementos.model.Application;
import com.placementos.model.Job;
import com.placementos.model.User;
import com.placementos.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ApplicationService {
    
    @Autowired
    private ApplicationRepository applicationRepository;
    
    public Application createApplication(User user, Job job, String resumeText) {
        Application application = new Application(user, job, resumeText);
        return applicationRepository.save(application);
    }
    
    public List<Application> getApplicationsByUser(User user) {
        return applicationRepository.findByUser(user);
    }
    
    public Optional<Application> getApplicationById(Long id) {
        return applicationRepository.findById(id);
    }
    
    public Application updateApplication(Application application) {
        return applicationRepository.save(application);
    }
    
    public List<Application> getApplicationsByStatus(Application.Status status) {
        return applicationRepository.findByStatus(status);
    }
    
    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }
}
