package com.placementos.service;

import com.placementos.model.Application;
import com.placementos.model.AssessmentAttempt;
import com.placementos.repository.AssessmentAttemptRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import java.util.Random;

@Service
public class AssessmentService {
    
    @Autowired
    private AssessmentAttemptRepository assessmentAttemptRepository;
    
    private Random random = new Random();
    
    /**
     * Simulated assessment logic
     * Generates a random score between 50-100
     * Pass threshold: 70
     */
    public AssessmentAttempt conductAssessment(Application application) {
        // Generate random score between 50 and 100
        int score = 50 + random.nextInt(51);
        boolean passed = score >= 70;
        
        AssessmentAttempt attempt = new AssessmentAttempt(application, score, passed);
        return assessmentAttemptRepository.save(attempt);
    }
    
    public Optional<AssessmentAttempt> getAttemptByApplication(Application application) {
        return assessmentAttemptRepository.findByApplication(application);
    }
    
    public String generateFeedback(int score) {
        if (score >= 90) {
            return "Outstanding performance! You've demonstrated excellent technical skills.";
        } else if (score >= 70) {
            return "Good job! You've passed the assessment with a solid score.";
        } else if (score >= 60) {
            return "Close, but not quite there. You scored " + score + "/100. Keep practicing!";
        } else {
            return "You need more preparation. Score: " + score + "/100. Don't give up - try again!";
        }
    }
}
