import pdfParse from 'pdf-parse';
import natural from 'natural';
import axios from 'axios';
import { config } from '../config';

const { TfIdf } = natural;

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
