package com.placementos.service;

import com.placementos.model.Application;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeScreeningService {
    
    private static final Map<String, List<String>> TECHNICAL_KEYWORDS = Map.ofEntries(
        Map.entry("languages", Arrays.asList("java", "python", "javascript", "typescript", "c++", "c#", "ruby", "php", "golang", "rust", "kotlin", "scala", "r", "matlab")),
        Map.entry("frameworks", Arrays.asList("spring", "spring boot", "django", "flask", "react", "angular", "vue", "express", "fastapi", "nestjs", "laravel", "asp.net")),
        Map.entry("databases", Arrays.asList("sql", "mysql", "postgresql", "mongodb", "oracle", "cassandra", "redis", "elasticsearch", "dynamodb", "firebase")),
        Map.entry("tools", Arrays.asList("git", "docker", "kubernetes", "jenkins", "circleci", "aws", "azure", "gcp", "maven", "gradle", "webpack")),
        Map.entry("concepts", Arrays.asList("rest api", "microservices", "agile", "scrum", "devops", "ci/cd", "testing", "junit", "unit test", "integration test", "oops", "design patterns")),
        Map.entry("soft_skills", Arrays.asList("communication", "leadership", "teamwork", "problem solving", "analytical", "creative", "attention to detail"))
    );
    
    private static final Map<String, List<String>> ROLE_KEYWORDS = Map.ofEntries(
        Map.entry("software", Arrays.asList("development", "coding", "programming", "developer", "engineer", "architecture", "design", "implementation", "debugging")),
        Map.entry("data", Arrays.asList("data", "analytics", "sql", "python", "statistics", "visualization", "tableau", "power bi", "machine learning", "analysis")),
        Map.entry("frontend", Arrays.asList("react", "angular", "vue", "html", "css", "javascript", "typescript", "ui", "ux", "responsive", "web design")),
        Map.entry("backend", Arrays.asList("backend", "server", "api", "database", "java", "python", "node", "spring", "rest", "microservices")),
        Map.entry("devops", Arrays.asList("docker", "kubernetes", "ci/cd", "jenkins", "devops", "infrastructure", "automation", "aws", "azure", "monitoring")),
        Map.entry("qa", Arrays.asList("testing", "quality assurance", "test automation", "selenium", "junit", "bug", "test case", "qa", "manual testing"))
    );
    
    public ATSAnalysisResult analyzeResume(Application application) {
        String resumeText = application.getResumeText() != null ? application.getResumeText() : "";
        String jobTitle = application.getJob().getTitle().toLowerCase();
        String resumeLower = resumeText.toLowerCase();
        
        ATSAnalysisResult.ReadabilityMetrics readability = calculateReadability(resumeText);
        ATSAnalysisResult.FormattingAnalysis formatting = analyzeFormatting(resumeText);
        List<ATSAnalysisResult.KeywordMatch> keywordMatches = findKeywordMatches(resumeLower);
        List<String> missingKeywords = findMissingKeywords(resumeLower, jobTitle);
        List<String> strengths = identifyStrengths(resumeLower, readability, formatting, keywordMatches);
        List<String> improvements = identifyImprovements(resumeLower, readability, formatting, missingKeywords);
        
        double atsScore = calculateATSScore(readability, formatting, keywordMatches, missingKeywords, resumeLower);
        boolean passed = atsScore >= 60;
        
        String summary = generateSummary(atsScore, passed, jobTitle);
        
        return new ATSAnalysisResult(
            atsScore, passed, summary, strengths, improvements,
            keywordMatches, missingKeywords, formatting, readability
        );
    }
    
    private ATSAnalysisResult.ReadabilityMetrics calculateReadability(String text) {
        ATSAnalysisResult.ReadabilityMetrics metrics = new ATSAnalysisResult.ReadabilityMetrics();
        metrics.charCount = text.length();
        metrics.wordCount = text.trim().isEmpty() ? 0 : text.trim().split("\\s+").length;
        
        long sentenceCount = text.split("[.!?]+").length;
        metrics.sentenceCount = (int) sentenceCount;
        
        metrics.avgWordsPerSentence = metrics.sentenceCount > 0 ? 
            (double) metrics.wordCount / metrics.sentenceCount : 0;
        
        return metrics;
    }
    
    private ATSAnalysisResult.FormattingAnalysis analyzeFormatting(String text) {
        ATSAnalysisResult.FormattingAnalysis formatting = new ATSAnalysisResult.FormattingAnalysis();
        List<String> issues = new ArrayList<>();
        
        String lowerText = text.toLowerCase();
        
        formatting.hasContactInfo = lowerText.contains("email") || lowerText.contains("phone") || 
                                   lowerText.contains("linkedin") || lowerText.contains("github");
        if (!formatting.hasContactInfo) {
            issues.add("Missing contact information (email, phone, LinkedIn)");
        }
        
        formatting.hasClearSections = (lowerText.contains("experience") || lowerText.contains("work")) &&
                                     (lowerText.contains("education") || lowerText.contains("degree"));
        if (!formatting.hasClearSections) {
            issues.add("Missing clear sections (Experience, Education, Skills)");
        }
        
        int wordCount = text.trim().split("\\s+").length;
        formatting.hasProperStructure = wordCount >= 150 && wordCount <= 1500;
        if (wordCount < 150) {
            issues.add("Resume is too short (minimum 150 words recommended)");
        } else if (wordCount > 1500) {
            issues.add("Resume is too long (maximum 1500 words recommended)");
        }
        
        formatting.formatIssues = issues;
        return formatting;
    }
    
    private List<ATSAnalysisResult.KeywordMatch> findKeywordMatches(String resumeLower) {
        List<ATSAnalysisResult.KeywordMatch> matches = new ArrayList<>();
        
        for (Map.Entry<String, List<String>> categoryEntry : TECHNICAL_KEYWORDS.entrySet()) {
            for (String keyword : categoryEntry.getValue()) {
                int frequency = countOccurrences(resumeLower, keyword);
                if (frequency > 0) {
                    matches.add(new ATSAnalysisResult.KeywordMatch(keyword, categoryEntry.getKey(), frequency));
                }
            }
        }
        
        return matches;
    }
    
    private List<String> findMissingKeywords(String resumeLower, String jobTitle) {
        List<String> missing = new ArrayList<>();
        
        for (Map.Entry<String, List<String>> roleEntry : ROLE_KEYWORDS.entrySet()) {
            if (jobTitle.contains(roleEntry.getKey())) {
                for (String keyword : roleEntry.getValue()) {
                    if (countOccurrences(resumeLower, keyword) == 0) {
                        missing.add(keyword);
                    }
                }
            }
        }
        
        return missing;
    }
    
    private List<String> identifyStrengths(String resumeLower, 
                                           ATSAnalysisResult.ReadabilityMetrics readability,
                                           ATSAnalysisResult.FormattingAnalysis formatting,
                                           List<ATSAnalysisResult.KeywordMatch> keywordMatches) {
        List<String> strengths = new ArrayList<>();
        
        if (readability.getWordCount() >= 250) {
            strengths.add("Good resume length with sufficient detail");
        }
        
        if (formatting.isHasContactInfo()) {
            strengths.add("Contact information is clearly provided");
        }
        
        if (formatting.isHasClearSections()) {
            strengths.add("Well-organized with clear sections (Experience, Education, Skills)");
        }
        
        if (keywordMatches.size() >= 8) {
            strengths.add("Strong technical keyword alignment with industry standards");
        }
        
        if (resumeLower.contains("project") || resumeLower.contains("achievement")) {
            strengths.add("Includes specific projects and achievements");
        }
        
        if (resumeLower.matches(".*\\d+%.*") || resumeLower.matches(".*\\$\\d+.*") || 
            resumeLower.matches(".*\\d+\\s*(times|x).*")) {
            strengths.add("Uses quantifiable metrics and numbers to describe impact");
        }
        
        return strengths;
    }
    
    private List<String> identifyImprovements(String resumeLower,
                                              ATSAnalysisResult.ReadabilityMetrics readability,
                                              ATSAnalysisResult.FormattingAnalysis formatting,
                                              List<String> missingKeywords) {
        List<String> improvements = new ArrayList<>();
        
        improvements.addAll(formatting.getFormatIssues());
        
        if (readability.getAvgWordsPerSentence() > 25) {
            improvements.add("Use shorter, more concise sentences for better readability");
        }
        
        if (!missingKeywords.isEmpty()) {
            List<String> topMissing = missingKeywords.stream().limit(5).collect(Collectors.toList());
            improvements.add("Add missing keywords: " + String.join(", ", topMissing));
        }
        
        if (!resumeLower.contains("achievement") && !resumeLower.contains("result") && !resumeLower.contains("impact")) {
            improvements.add("Highlight achievements and measurable results for each role");
        }
        
        if (!resumeLower.matches(".*\\d+%.*") && !resumeLower.matches(".*\\$\\d+.*")) {
            improvements.add("Add specific metrics and numbers to quantify your achievements");
        }
        
        if (resumeLower.contains("responsible for") || resumeLower.contains("involved in")) {
            improvements.add("Replace passive phrases with action verbs (Led, Developed, Implemented, etc.)");
        }
        
        return improvements;
    }
    
    private double calculateATSScore(ATSAnalysisResult.ReadabilityMetrics readability,
                                     ATSAnalysisResult.FormattingAnalysis formatting,
                                     List<ATSAnalysisResult.KeywordMatch> keywordMatches,
                                     List<String> missingKeywords,
                                     String resumeLower) {
        double score = 0;
        
        if (readability.getWordCount() >= 250 && readability.getWordCount() <= 1500) {
            score += 15;
        } else if (readability.getWordCount() >= 150 && readability.getWordCount() <= 1500) {
            score += 10;
        }
        
        if (formatting.isHasContactInfo()) score += 5;
        if (formatting.isHasClearSections()) score += 5;
        if (formatting.getFormatIssues().isEmpty()) score += 5;
        
        int keywordScore = Math.min(40, (keywordMatches.size() * 3));
        score += keywordScore;
        
        score -= (missingKeywords.size() * 2);
        
        if (readability.getAvgWordsPerSentence() >= 10 && readability.getAvgWordsPerSentence() <= 20) {
            score += 20;
        } else if (readability.getAvgWordsPerSentence() < 25) {
            score += 10;
        }
        
        if (resumeLower.contains("led") || resumeLower.contains("developed") || resumeLower.contains("implemented")) {
            score += 3;
        }
        if (resumeLower.matches(".*\\d+%.*") || resumeLower.matches(".*\\$\\d+.*")) {
            score += 3;
        }
        if (resumeLower.contains("project") || resumeLower.contains("achievement")) {
            score += 4;
        }
        
        return Math.max(0, Math.min(100, score));
    }
    
    private String generateSummary(double score, boolean passed, String jobTitle) {
        if (score >= 85) {
            return "Excellent! Your resume is highly optimized for ATS and demonstrates strong alignment with the role.";
        } else if (score >= 70) {
            return "Good! Your resume is well-structured and contains relevant keywords. Minor improvements could enhance your chances.";
        } else if (score >= 60) {
            return "Fair. Your resume meets basic requirements but needs improvements in content and keyword alignment.";
        } else if (score >= 50) {
            return "Your resume needs significant improvements in structure, keywords, and content to be competitive.";
        } else {
            return "Your resume requires major revisions to meet industry standards and ATS compatibility.";
        }
    }
    
    private int countOccurrences(String text, String keyword) {
        int count = 0;
        int lastIndex = 0;
        while ((lastIndex = text.indexOf(keyword, lastIndex)) != -1) {
            count++;
            lastIndex += keyword.length();
        }
        return count;
    }
    
    public ScreeningResult screenResume(Application application) {
        ATSAnalysisResult result = analyzeResume(application);
        return new ScreeningResult(result.isPassed(), result.getSummary());
    }
    
    public static class ScreeningResult {
        private boolean passed;
        private String feedback;
        
        public ScreeningResult(boolean passed, String feedback) {
            this.passed = passed;
            this.feedback = feedback;
        }
        
        public boolean isPassed() { return passed; }
        public String getFeedback() { return feedback; }
    }
}
