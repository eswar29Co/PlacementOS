import pdfParse from 'pdf-parse';
import natural from 'natural';

const { TfIdf } = natural;

export interface ATSResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
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
    const pdfData = await pdfParse(resumeBuffer);
    const resumeText = pdfData.text.toLowerCase();

    // Prepare job requirements
    const requiredSkills = jobSkills.map(skill => skill.toLowerCase());
    const jobDescLower = jobDescription.toLowerCase();

    // Calculate keyword matching
    const matchedKeywords: string[] = [];
    const missingKeywords: string[] = [];

    requiredSkills.forEach(skill => {
      if (resumeText.includes(skill)) {
        matchedKeywords.push(skill);
      } else {
        missingKeywords.push(skill);
      }
    });

    // Calculate base score from keyword matching
    const keywordMatchScore = (matchedKeywords.length / requiredSkills.length) * 60;

    // Use TF-IDF for semantic similarity
    const tfidf = new TfIdf();
    tfidf.addDocument(resumeText);
    tfidf.addDocument(jobDescLower);

    // Calculate semantic similarity score
    let semanticScore = 0;
    const terms = jobDescLower.split(/\s+/).filter(term => term.length > 3);
    
    terms.forEach(term => {
      const resumeScore = tfidf.tfidf(term, 0);
      const jobScore = tfidf.tfidf(term, 1);
      
      if (resumeScore > 0 && jobScore > 0) {
        semanticScore += Math.min(resumeScore, jobScore);
      }
    });

    // Normalize semantic score (0-40)
    const normalizedSemanticScore = Math.min((semanticScore / terms.length) * 40, 40);

    // Calculate final ATS score
    const finalScore = Math.round(keywordMatchScore + normalizedSemanticScore);

    // Generate suggestions
    const suggestions: string[] = [];
    
    if (matchedKeywords.length < requiredSkills.length * 0.7) {
      suggestions.push('Add more relevant technical skills from the job description');
    }
    
    if (missingKeywords.length > 0) {
      suggestions.push(`Include these important skills: ${missingKeywords.slice(0, 3).join(', ')}`);
    }
    
    if (finalScore < 60) {
      suggestions.push('Tailor your resume to better match the job requirements');
      suggestions.push('Use industry-standard terminology and keywords');
    }

    if (resumeText.split(/\s+/).length < 200) {
      suggestions.push('Consider adding more details about your experience and projects');
    }

    return {
      score: Math.max(0, Math.min(100, finalScore)),
      matchedKeywords,
      missingKeywords,
      suggestions,
    };
  } catch (error) {
    console.error('ATS Score calculation error:', error);
    // Return default score if parsing fails
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
