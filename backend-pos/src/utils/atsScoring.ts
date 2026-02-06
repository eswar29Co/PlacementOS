import pdfParse from 'pdf-parse';
import natural from 'natural';
import axios from 'axios';
import { config } from '../config';
import { parseResumePDF, ParsedResume } from './resumeParser';
import { categorizeSkills, findMatchedSkills, findMissingSkills, SkillCategories } from './skillTaxonomy';
import { IJob } from '../types';

const { TfIdf } = natural;

/**
 * Enhanced ATS Result with detailed breakdown
 */
export interface EnhancedATSResult {
  score: number;
  breakdown: {
    keywordMatch: number;      // 30 points max
    semanticMatch: number;      // 30 points max
    experienceMatch: number;    // 20 points max
    formatQuality: number;      // 10 points max
    educationMatch: number;     // 10 points max
  };
  matchedSkills: string[];
  missingSkills: string[];
  skillCategories: SkillCategories;
  experienceSummary: string;
  educationSummary: string;
  suggestions: string[];
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  resumeSummary: string;
  hasContactInfo: boolean;
  parsedResume?: ParsedResume;
}

/**
 * Legacy ATS Result interface (for backward compatibility)
 */
export interface ATSResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  semantic_match?: number;
  hasContactInfo?: boolean;
  readability?: {
    charCount: number;
    wordCount: number;
  };
}

/**
 * Analyze resume and calculate ATS score
 * @param resumeBuffer - Resume file buffer (PDF)
 * @param jobSkills - Required skills from job posting
 * @param jobDescription - Job description text
 */
export const calculateATSScore = async (
  resumeBuffer: Buffer,
  jobSkills: string[],
  jobDescription: string
): Promise<ATSResult> => {
  try {
    // Extract text from PDF
    console.log('Extracting text from resume PDF...');
    const pdfData = await pdfParse(resumeBuffer);
    const resumeText = pdfData.text || '';
    const resumeTextLower = resumeText.toLowerCase();

    console.log(`Successfully extracted ${resumeText.length} characters from the resume.`);

    if (!resumeText || resumeText.length < 50) {
      console.warn('Resume text extraction resulted in very short or empty content. ATS score might be inaccurate.');
    }

    // Try AI Service first
    const aiUrl = `${config.aiServiceUrl}/ats/analyze`;
    try {
      console.log(`Calling AI Service at ${aiUrl} for ATS analysis...`);
      const aiResponse = await axios.post(aiUrl, {
        resume_text: resumeText,
        job_description: jobDescription,
        skills_required: jobSkills
      }, { timeout: 15000 }); // 15s timeout

      if (aiResponse.data) {
        console.log('AI Service analysis successful. Response Score:', aiResponse.data.score);
        return {
          score: aiResponse.data.score,
          matchedKeywords: aiResponse.data.matching_skills,
          missingKeywords: aiResponse.data.missing_skills,
          suggestions: [aiResponse.data.summary, "Consider adding missing skills to improve your score."],
          semantic_match: aiResponse.data.semantic_match,
          hasContactInfo: aiResponse.data.hasContactInfo,
          readability: aiResponse.data.readability
        };
      }
    } catch (aiError: any) {
      console.warn(`AI Service at ${aiUrl} failed: ${aiError.message}. Falling back to local scoring.`);
    }

    // Fallback Local Logic
    console.log('Using local fallback logic for ATS scoring...');
    const resumeText_local = resumeTextLower;

    // Prepare job requirements
    const requiredSkills = jobSkills.map(skill => skill.toLowerCase());
    const jobDescLower = jobDescription.toLowerCase();

    // Calculate keyword matching
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    requiredSkills.forEach(skill => {
      if (resumeText_local.includes(skill)) {
        matchedKeywords.push(skill);
      } else {
        missingKeywords.push(skill);
      }
    });

    // Calculate base score from keyword matching (50%)
    const keywordMatchScore = (matchedKeywords.length / (requiredSkills.length || 1)) * 50;

    // Simple TF-IDF for fallback semantic similarity (50%)
    const tfidf = new TfIdf();
    tfidf.addDocument(resumeText_local);
    tfidf.addDocument(jobDescLower);

    let semanticScore = 0;
    const terms = jobDescLower.split(/\s+/).filter(term => term.length > 4);

    terms.forEach(term => {
      if (tfidf.tfidf(term, 0) > 0) semanticScore++;
    });

    const normalizedSemanticScore = Math.min((semanticScore / (terms.length || 1)) * 50, 50);

    // Calculate final ATS score
    const finalScore = Math.round(keywordMatchScore + normalizedSemanticScore);

    return {
      score: Math.max(0, Math.min(100, finalScore)),
      matchedKeywords,
      missingKeywords,
      suggestions: [
        `Matched ${matchedKeywords.length} out of ${requiredSkills.length} core keywords.`,
        missingKeywords.length > 0 ? `Try adding: ${missingKeywords.slice(0, 3).join(', ')}` : "Great keyword alignment!"
      ],
      semantic_match: Math.round(normalizedSemanticScore * 2),
      readability: {
        charCount: resumeText.length,
        wordCount: resumeText.split(/\s+/).length
      }
    };
  } catch (error) {
    console.error('ATS Score calculation error:', error);
    return {
      score: 50,
      matchedKeywords: [],
      missingKeywords: jobSkills,
      suggestions: ['Unable to analyze resume. Please ensure it is a valid PDF file.'],
    };
  }
};

/**
 * Enhanced ATS Score Calculation with detailed breakdown
 * @param resumeBuffer - Resume file buffer (PDF)
 * @param job - Complete job object with all details
 * @returns EnhancedATSResult with comprehensive analysis
 */
export const calculateEnhancedATSScore = async (
  resumeBuffer: Buffer,
  job: IJob
): Promise<EnhancedATSResult> => {
  try {
    console.log('Starting enhanced ATS analysis...');

    // Step 1: Parse resume to extract structured data
    const parsedResume = await parseResumePDF(resumeBuffer);
    console.log('Resume parsed successfully');

    // Step 2: Try AI Service for advanced analysis
    const aiUrl = `${config.aiServiceUrl}/ats/analyze`;
    let aiAnalysis: any = null;

    try {
      console.log(`Calling AI Service at ${aiUrl} for enhanced analysis...`);
      const aiResponse = await axios.post(aiUrl, {
        resume_text: parsedResume.rawText,
        job_description: job.description || '',
        skills_required: job.skills || []
      }, { timeout: 20000 });

      if (aiResponse.data) {
        aiAnalysis = aiResponse.data;
        console.log('AI Service analysis successful');
      }
    } catch (aiError: any) {
      console.warn(`AI Service failed: ${aiError.message}. Using local analysis.`);
    }

    // Step 3: Calculate individual score components

    // 3.1 Keyword Match Score (30 points)
    const matched = findMatchedSkills(job.skills || [], parsedResume.skills);
    const missing = findMissingSkills(job.skills || [], parsedResume.skills);
    const keywordMatchScore = job.skills && job.skills.length > 0
      ? (matched.length / job.skills.length) * 30
      : 30;

    // 3.2 Semantic Match Score (30 points) - from AI or fallback
    let semanticMatchScore = 15; // Default
    if (aiAnalysis && aiAnalysis.semantic_match) {
      semanticMatchScore = (aiAnalysis.semantic_match / 100) * 30;
    } else {
      // Fallback: TF-IDF based semantic matching
      const tfidf = new TfIdf();
      tfidf.addDocument(parsedResume.rawText.toLowerCase());
      tfidf.addDocument((job.description || '').toLowerCase());

      let semanticScore = 0;
      const terms = (job.description || '').toLowerCase().split(/\s+/).filter(t => t.length > 4);
      terms.forEach(term => {
        if (tfidf.tfidf(term, 0) > 0) semanticScore++;
      });
      semanticMatchScore = Math.min((semanticScore / (terms.length || 1)) * 30, 30);
    }

    // 3.3 Experience Match Score (20 points)
    let experienceMatchScore = 10; // Default
    const hasExperience = parsedResume.experience.length > 0;
    const hasRelevantProjects = parsedResume.projects.length > 0;

    if (hasExperience) {
      experienceMatchScore = 15;
      // Bonus for multiple experiences
      if (parsedResume.experience.length >= 2) experienceMatchScore = 20;
    } else if (hasRelevantProjects) {
      experienceMatchScore = 12;
    }

    // 3.4 Format Quality Score (10 points)
    const formatQualityScore = (parsedResume.formatQuality.readabilityScore / 100) * 10;

    // 3.5 Education Match Score (10 points)
    let educationMatchScore = 5; // Default
    const hasEducation = parsedResume.education.length > 0;

    if (hasEducation) {
      educationMatchScore = 8;
      // Bonus for higher education or good GPA
      const hasAdvancedDegree = parsedResume.education.some(edu =>
        /master|phd|doctorate/i.test(edu.degree)
      );
      if (hasAdvancedDegree) educationMatchScore = 10;
    }

    // Step 4: Calculate total score
    const totalScore = Math.round(
      keywordMatchScore +
      semanticMatchScore +
      experienceMatchScore +
      formatQualityScore +
      educationMatchScore
    );

    // Step 5: Categorize skills
    const skillCategories = categorizeSkills(parsedResume.skills);

    // Step 6: Generate summaries
    const experienceSummary = parsedResume.experience.length > 0
      ? `${parsedResume.experience.length} work experience(s) found`
      : 'No work experience listed';

    const educationSummary = parsedResume.education.length > 0
      ? parsedResume.education.map(edu => `${edu.degree} from ${edu.institution}`).join('; ')
      : 'No education information found';

    const resumeSummary = aiAnalysis?.summary ||
      `Candidate with ${parsedResume.skills.length} skills, ${parsedResume.experience.length} experience entries, and ${parsedResume.education.length} education qualifications.`;

    // Step 7: Generate suggestions
    const suggestions: string[] = [];

    if (missing.length > 0) {
      suggestions.push(`Add these missing skills: ${missing.slice(0, 5).join(', ')}`);
    }

    if (!parsedResume.contactInfo.email) {
      suggestions.push('Include a professional email address');
    }

    if (!parsedResume.contactInfo.phone) {
      suggestions.push('Add a contact phone number');
    }

    if (parsedResume.experience.length === 0) {
      suggestions.push('Add relevant work experience or projects');
    }

    if (parsedResume.formatQuality.readabilityScore < 60) {
      suggestions.push('Improve resume formatting with clear sections and bullet points');
    }

    if (matched.length === job.skills?.length) {
      suggestions.push('Excellent skill match! Consider highlighting your experience with these skills.');
    }

    // Step 8: Determine status
    let status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    if (totalScore >= 80) status = 'Excellent';
    else if (totalScore >= 60) status = 'Good';
    else if (totalScore >= 40) status = 'Fair';
    else status = 'Poor';

    // Step 9: Check contact info
    const hasContactInfo = !!(parsedResume.contactInfo.email && parsedResume.contactInfo.phone);

    const result: EnhancedATSResult = {
      score: Math.max(0, Math.min(100, totalScore)),
      breakdown: {
        keywordMatch: Math.round(keywordMatchScore),
        semanticMatch: Math.round(semanticMatchScore),
        experienceMatch: Math.round(experienceMatchScore),
        formatQuality: Math.round(formatQualityScore),
        educationMatch: Math.round(educationMatchScore)
      },
      matchedSkills: matched,
      missingSkills: missing,
      skillCategories,
      experienceSummary,
      educationSummary,
      suggestions,
      status,
      resumeSummary,
      hasContactInfo,
      parsedResume
    };

    console.log(`Enhanced ATS analysis completed. Score: ${result.score}/100 (${status})`);
    return result;

  } catch (error: any) {
    console.error('Enhanced ATS calculation error:', error);

    // Return error result
    return {
      score: 0,
      breakdown: {
        keywordMatch: 0,
        semanticMatch: 0,
        experienceMatch: 0,
        formatQuality: 0,
        educationMatch: 0
      },
      matchedSkills: [],
      missingSkills: job.skills || [],
      skillCategories: {
        programming: [],
        frameworks: [],
        tools: [],
        databases: [],
        cloud: [],
        softSkills: [],
        other: []
      },
      experienceSummary: 'Unable to analyze',
      educationSummary: 'Unable to analyze',
      suggestions: ['Failed to analyze resume. Please ensure it is a valid PDF file.'],
      status: 'Poor',
      resumeSummary: 'Analysis failed',
      hasContactInfo: false
    };
  }
};

/**
 * Simple text-based ATS scoring (fallback method)
 */
export const calculateSimpleATSScore = (
  resumeText: string,
  jobSkills: string[]
): ATSResult => {
  const resumeLower = resumeText.toLowerCase();
  const requiredSkills = jobSkills.map(skill => skill.toLowerCase());

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  requiredSkills.forEach(skill => {
    if (resumeLower.includes(skill)) {
      matchedKeywords.push(skill);
    } else {
      missingKeywords.push(skill);
    }
  });

  const score = Math.round((matchedKeywords.length / requiredSkills.length) * 100);

  const suggestions: string[] = [];
  if (missingKeywords.length > 0) {
    suggestions.push(`Add these skills to your resume: ${missingKeywords.slice(0, 3).join(', ')}`);
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    matchedKeywords,
    missingKeywords,
    suggestions,
  };
};

