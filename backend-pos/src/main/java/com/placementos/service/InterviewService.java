package com.placementos.service;

import com.placementos.model.Application;
import com.placementos.model.Interview;
import com.placementos.repository.InterviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class InterviewService {
    
    @Autowired
    private InterviewRepository interviewRepository;
    
    public Interview scheduleInterview(Application application, String interviewerName) {
        Interview interview = new Interview(application, interviewerName);
        return interviewRepository.save(interview);
    }
    
    public Interview submitFeedback(Long interviewId, String feedback, Interview.Verdict verdict) {
        Optional<Interview> optInterview = interviewRepository.findById(interviewId);
        if (optInterview.isPresent()) {
            Interview interview = optInterview.get();
            interview.setFeedback(feedback);
            interview.setVerdict(verdict);
            return interviewRepository.save(interview);
        }
        return null;
    }
    
    public Optional<Interview> getInterviewByApplication(Application application) {
        return interviewRepository.findByApplication(application);
    }
    
    public List<Interview> getPendingInterviews() {
        return interviewRepository.findByVerdict(Interview.Verdict.PENDING);
    }
    
    public List<Interview> getAllInterviews() {
        return interviewRepository.findAll();
    }
}
