package com.placementos.service;

import java.util.List;

public class ATSAnalysisResult {
    private double atsScore;
    private boolean passed;
    private String summary;
    private List<String> strengths;
    private List<String> improvements;
    private List<KeywordMatch> keywordMatches;
    private List<String> missingKeywords;
    private FormattingAnalysis formatting;
    private ReadabilityMetrics readability;
    
    public static class KeywordMatch {
        public String keyword;
        public String category;
        public int frequency;
        
        public KeywordMatch(String keyword, String category, int frequency) {
            this.keyword = keyword;
            this.category = category;
            this.frequency = frequency;
        }
        
        public String getKeyword() { return keyword; }
        public String getCategory() { return category; }
        public int getFrequency() { return frequency; }
    }
    
    public static class FormattingAnalysis {
        public boolean hasProperStructure;
        public boolean hasContactInfo;
        public boolean hasClearSections;
        public List<String> formatIssues;
        
        public boolean isHasProperStructure() { return hasProperStructure; }
        public boolean isHasContactInfo() { return hasContactInfo; }
        public boolean isHasClearSections() { return hasClearSections; }
        public List<String> getFormatIssues() { return formatIssues; }
    }
    
    public static class ReadabilityMetrics {
        public int charCount;
        public int wordCount;
        public int sentenceCount;
        public double avgWordsPerSentence;
        
        public int getCharCount() { return charCount; }
        public int getWordCount() { return wordCount; }
        public int getSentenceCount() { return sentenceCount; }
        public double getAvgWordsPerSentence() { return avgWordsPerSentence; }
    }
    
    public ATSAnalysisResult(double atsScore, boolean passed, String summary,
                            List<String> strengths, List<String> improvements,
                            List<KeywordMatch> keywordMatches, List<String> missingKeywords,
                            FormattingAnalysis formatting, ReadabilityMetrics readability) {
        this.atsScore = atsScore;
        this.passed = passed;
        this.summary = summary;
        this.strengths = strengths;
        this.improvements = improvements;
        this.keywordMatches = keywordMatches;
        this.missingKeywords = missingKeywords;
        this.formatting = formatting;
        this.readability = readability;
    }
    
    public double getAtsScore() { return atsScore; }
    public void setAtsScore(double atsScore) { this.atsScore = atsScore; }
    
    public boolean isPassed() { return passed; }
    public void setPassed(boolean passed) { this.passed = passed; }
    
    public String getSummary() { return summary; }
    public void setSummary(String summary) { this.summary = summary; }
    
    public List<String> getStrengths() { return strengths; }
    public void setStrengths(List<String> strengths) { this.strengths = strengths; }
    
    public List<String> getImprovements() { return improvements; }
    public void setImprovements(List<String> improvements) { this.improvements = improvements; }
    
    public List<KeywordMatch> getKeywordMatches() { return keywordMatches; }
    public void setKeywordMatches(List<KeywordMatch> keywordMatches) { this.keywordMatches = keywordMatches; }
    
    public List<String> getMissingKeywords() { return missingKeywords; }
    public void setMissingKeywords(List<String> missingKeywords) { this.missingKeywords = missingKeywords; }
    
    public FormattingAnalysis getFormatting() { return formatting; }
    public void setFormatting(FormattingAnalysis formatting) { this.formatting = formatting; }
    
    public ReadabilityMetrics getReadability() { return readability; }
    public void setReadability(ReadabilityMetrics readability) { this.readability = readability; }
}
