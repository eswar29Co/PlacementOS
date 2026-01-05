// ATS Analysis Utility Functions

export interface ATSAnalysisResult {
  atsScore: number;
  passed: boolean;
  summary: string;
  strengths: string[];
  improvements: string[];
  keywordMatches: Array<{
    keyword: string;
    category: string;
    frequency: number;
  }>;
  missingKeywords: string[];
  readability: {
    charCount: number;
    wordCount: number;
    sentenceCount: number;
    avgWordsPerSentence: number;
  };
  formatting: {
    hasProperStructure: boolean;
    hasContactInfo: boolean;
    hasClearSections: boolean;
    formatIssues: string[];
  };
}

// Extract keywords from text
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().split(/\s+/);
  return words.filter(word => word.length > 3);
}

// Generate dynamic mock ATS analysis based on resume content
export function generateATSAnalysis(
  resumeText: string,
  jobDescription?: string,
  jobTitle?: string
): ATSAnalysisResult {
  // Calculate readability metrics
  const charCount = resumeText.length;
  const words = resumeText.split(/\s+/);
  const wordCount = words.length;
  const sentences = resumeText.split(/[.!?]+/).filter(s => s.trim());
  const sentenceCount = sentences.length;
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);

  // Extract keywords from resume
  const resumeKeywords = extractKeywords(resumeText);
  const resumeKeywordLower = resumeText.toLowerCase();

  // Technical keyword categories
  const TECHNICAL_KEYWORDS = {
    languages: ['java', 'python', 'javascript', 'typescript', 'c#', 'c++', 'go', 'rust', 'ruby', 'kotlin', 'scala'],
    frameworks: ['spring', 'spring boot', 'react', 'angular', 'vue', 'django', 'flask', 'express', 'fastapi', 'aspnet', 'microservices'],
    databases: ['sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'redis', 'elasticsearch', 'cassandra', 'dynamodb'],
    tools: ['git', 'docker', 'kubernetes', 'jenkins', 'maven', 'gradle', 'npm', 'aws', 'azure', 'gcp', 'linux'],
    concepts: ['rest', 'api', 'microservices', 'agile', 'ci/cd', 'devops', 'testing', 'security', 'optimization'],
    soft_skills: ['leadership', 'communication', 'teamwork', 'problem solving', 'analytical', 'adaptable']
  };

  // Job-specific keywords (from job description if provided)
  const jobKeywords = jobDescription 
    ? extractKeywords(jobDescription)
    : [];

  // Find keyword matches with frequency
  const keywordMatches: Array<{keyword: string; category: string; frequency: number}> = [];
  const foundKeywords = new Set<string>();

  for (const [category, keywords] of Object.entries(TECHNICAL_KEYWORDS)) {
    for (const keyword of keywords) {
      try {
        // Simple word boundary matching without complex regex
        const lowerKeyword = keyword.toLowerCase();
        const frequency = (resumeKeywordLower.match(new RegExp(lowerKeyword, 'g')) || []).length;
        
        if (frequency > 0) {
          keywordMatches.push({
            keyword,
            category,
            frequency
          });
          foundKeywords.add(keyword);
        }
      } catch (e) {
        // Skip keywords that cause errors
        console.warn(`Error processing keyword: ${keyword}`, e);
        continue;
      }
    }
  }

  // Find missing keywords
  const allKeywords = Object.values(TECHNICAL_KEYWORDS).flat();
  const missingKeywords = allKeywords.filter(
    k => !foundKeywords.has(k)
  ).slice(0, 5);

  // Calculate score based on multiple factors
  let score = 0;

  // Length check (0-15 points): ideal 250-500 words
  if (wordCount >= 250 && wordCount <= 500) {
    score += 15;
  } else if (wordCount >= 200 && wordCount <= 600) {
    score += 12;
  } else if (wordCount >= 100) {
    score += 8;
  }

  // Keywords match (0-30 points): base score plus job-specific bonus
  const keywordScore = Math.min(30, keywordMatches.length * 3);
  score += keywordScore;

  // Job description keyword match bonus (0-20 points)
  if (jobDescription) {
    const jobKeywordMatches = jobKeywords.filter(kw => resumeKeywordLower.includes(kw)).length;
    const jobBonus = Math.min(20, jobKeywordMatches * 2);
    score += jobBonus;
  } else {
    score += 10; // Base bonus if no job description
  }

  // Readability (0-15 points)
  if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 20) {
    score += 15;
  } else if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 22) {
    score += 12;
  } else {
    score += 8;
  }

  // Contact info check (0-10 points)
  const hasEmail = resumeKeywordLower.includes('@') || resumeKeywordLower.includes('email');
  const hasPhone = /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
  if (hasEmail && hasPhone) {
    score += 10;
  } else if (hasEmail || hasPhone) {
    score += 5;
  }

  // Structure check (0-10 points)
  const hasExperience = resumeKeywordLower.includes('experience') || resumeKeywordLower.includes('work');
  const hasEducation = resumeKeywordLower.includes('education') || resumeKeywordLower.includes('degree');
  const hasSkills = resumeKeywordLower.includes('skills') || resumeKeywordLower.includes('expertise');
  const structurePoints = (hasExperience ? 3 : 0) + (hasEducation ? 3 : 0) + (hasSkills ? 4 : 0);
  score += Math.min(10, structurePoints);

  // Final score (cap at 100)
  score = Math.min(100, Math.max(0, score));

  // Determine if passed (typically 60+)
  const passed = score >= 60;

  // Generate strengths
  const strengths: string[] = [];
  if (wordCount >= 250 && wordCount <= 500) {
    strengths.push("Optimal resume length with comprehensive content");
  }
  if (keywordMatches.length >= 5) {
    strengths.push("Good technical keyword coverage");
  }
  if (hasEmail && hasPhone) {
    strengths.push("Complete contact information provided");
  }
  if (hasExperience && hasEducation && hasSkills) {
    strengths.push("Well-structured with all essential sections");
  }
  if (avgWordsPerSentence >= 12 && avgWordsPerSentence <= 20) {
    strengths.push("Good sentence structure and readability");
  }
  if (jobDescription && keywordMatches.length > 0) {
    strengths.push("Strong alignment with job requirements");
  }
  if (strengths.length === 0) {
    strengths.push("Resume has been successfully parsed and analyzed");
  }

  // Generate improvements
  const improvements: string[] = [];
  if (wordCount < 250) {
    improvements.push("Expand resume to at least 250 words for better ATS recognition");
  }
  if (keywordMatches.length < 5) {
    improvements.push(`Add more technical keywords (currently ${keywordMatches.length}, target 8+)`);
  }
  if (missingKeywords.length > 0) {
    improvements.push(`Consider adding relevant keywords: ${missingKeywords.slice(0, 3).join(', ')}`);
  }
  if (!hasPhone) {
    improvements.push("Include phone number in contact information");
  }
  if (!hasExperience) {
    improvements.push("Add an 'Experience' or 'Work History' section");
  }
  if (avgWordsPerSentence > 20) {
    improvements.push(`Shorten sentences for better readability (current avg: ${avgWordsPerSentence.toFixed(1)} words)`);
  }
  if (improvements.length === 0) {
    improvements.push("Resume meets ATS standards; continue maintaining quality");
  }

  // Generate summary
  let summary = "";
  if (passed) {
    if (score >= 80) {
      summary = `Excellent! Your resume scores ${score}/100 and is highly compatible with ATS systems. Well done!`;
    } else if (score >= 70) {
      summary = `Good! Your resume scores ${score}/100 and is compatible with ATS systems. ${jobDescription ? 'Well-aligned with this job description.' : ''}`;
    } else {
      summary = `Your resume scores ${score}/100. Make suggested improvements to increase compatibility.`;
    }
  } else {
    summary = `Your resume scores ${score}/100. Address the highlighted improvements before applying to maximize your chances.`;
  }

  // Formatting analysis
  const formatting = {
    hasProperStructure: hasExperience && hasEducation,
    hasContactInfo: hasEmail || hasPhone,
    hasClearSections: (hasExperience ? 1 : 0) + (hasEducation ? 1 : 0) + (hasSkills ? 1 : 0) >= 2,
    formatIssues: [] as string[]
  };

  if (!formatting.hasProperStructure) {
    formatting.formatIssues.push("Missing standard resume sections");
  }
  if (!formatting.hasContactInfo) {
    formatting.formatIssues.push("Contact information not clearly visible");
  }

  return {
    atsScore: Math.round(score),
    passed,
    summary,
    strengths,
    improvements,
    keywordMatches: keywordMatches.slice(0, 12),
    missingKeywords,
    readability: {
      charCount,
      wordCount,
      sentenceCount: Math.max(1, sentenceCount),
      avgWordsPerSentence: parseFloat(avgWordsPerSentence.toFixed(1))
    },
    formatting
  };
}

// Extract job keywords from job description
export function extractJobKeywords(jobDescription: string): string[] {
  const keywords = extractKeywords(jobDescription);
  const uniqueKeywords = [...new Set(keywords)];
  return uniqueKeywords.filter(k => k.length > 4).slice(0, 20);
}
