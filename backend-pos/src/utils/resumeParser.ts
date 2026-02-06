import pdfParse from 'pdf-parse';

/**
 * Structured resume data interface
 */
export interface ParsedResume {
    rawText: string;
    contactInfo: {
        email?: string;
        phone?: string;
        linkedin?: string;
        github?: string;
        location?: string;
        name?: string;
    };
    summary?: string;
    education: Array<{
        degree: string;
        institution: string;
        year?: string;
        gpa?: string;
    }>;
    experience: Array<{
        title: string;
        company: string;
        duration?: string;
        description: string;
    }>;
    skills: string[];
    certifications: string[];
    projects: Array<{
        name: string;
        description: string;
        technologies?: string[];
    }>;
    formatQuality: {
        hasProperSections: boolean;
        isWellFormatted: boolean;
        readabilityScore: number;
    };
}

/**
 * Extract contact information from resume text
 */
const extractContactInfo = (text: string): ParsedResume['contactInfo'] => {
    const contactInfo: ParsedResume['contactInfo'] = {};

    // Email extraction
    const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/gi;
    const emailMatch = text.match(emailRegex);
    if (emailMatch && emailMatch.length > 0) {
        contactInfo.email = emailMatch[0].toLowerCase();
    }

    // Phone extraction (supports various formats)
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10}/g;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch && phoneMatch.length > 0) {
        contactInfo.phone = phoneMatch[0];
    }

    // LinkedIn extraction
    const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w-]+/gi;
    const linkedinMatch = text.match(linkedinRegex);
    if (linkedinMatch && linkedinMatch.length > 0) {
        contactInfo.linkedin = linkedinMatch[0];
    }

    // GitHub extraction
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+/gi;
    const githubMatch = text.match(githubRegex);
    if (githubMatch && githubMatch.length > 0) {
        contactInfo.github = githubMatch[0];
    }

    // Name extraction (first line often contains name)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
        const firstLine = lines[0].trim();
        // Check if first line looks like a name (2-4 words, no special chars)
        if (/^[A-Za-z\s]{3,50}$/.test(firstLine) && firstLine.split(' ').length >= 2 && firstLine.split(' ').length <= 4) {
            contactInfo.name = firstLine;
        }
    }

    return contactInfo;
};

/**
 * Extract education information from resume text
 */
const extractEducation = (text: string): ParsedResume['education'] => {
    const education: ParsedResume['education'] = [];
    const educationKeywords = ['education', 'academic', 'qualification', 'degree'];

    // Find education section
    const lines = text.split('\n');
    let inEducationSection = false;
    let educationText = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase().trim();

        // Check if we're entering education section
        if (educationKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
            inEducationSection = true;
            continue;
        }

        // Check if we're leaving education section (hit another major section)
        if (inEducationSection && /^(experience|work|skills|projects|certifications)/i.test(line) && line.length < 50) {
            break;
        }

        if (inEducationSection) {
            educationText += lines[i] + '\n';
        }
    }

    // Parse education entries
    const degreePatterns = [
        /(?:bachelor|b\.?s\.?|b\.?tech|b\.?e\.?|ba|bsc)/gi,
        /(?:master|m\.?s\.?|m\.?tech|m\.?e\.?|ma|msc|mba)/gi,
        /(?:phd|ph\.?d\.?|doctorate)/gi,
        /(?:diploma|associate)/gi
    ];

    const educationLines = educationText.split('\n').filter(l => l.trim().length > 0);

    for (let i = 0; i < educationLines.length; i++) {
        const line = educationLines[i];

        // Check if line contains a degree
        const hasDegree = degreePatterns.some(pattern => pattern.test(line));

        if (hasDegree) {
            const entry: ParsedResume['education'][0] = {
                degree: line.trim(),
                institution: educationLines[i + 1]?.trim() || 'Unknown',
            };

            // Extract year (4 digits)
            const yearMatch = line.match(/\b(19|20)\d{2}\b/);
            if (yearMatch) {
                entry.year = yearMatch[0];
            }

            // Extract GPA
            const gpaMatch = line.match(/(?:gpa|cgpa)[:\s]*(\d+\.?\d*)/i);
            if (gpaMatch) {
                entry.gpa = gpaMatch[1];
            }

            education.push(entry);
        }
    }

    return education;
};

/**
 * Extract work experience from resume text
 */
const extractExperience = (text: string): ParsedResume['experience'] => {
    const experience: ParsedResume['experience'] = [];
    const experienceKeywords = ['experience', 'work history', 'employment', 'professional experience'];

    const lines = text.split('\n');
    let inExperienceSection = false;
    let experienceText = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase().trim();

        if (experienceKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
            inExperienceSection = true;
            continue;
        }

        if (inExperienceSection && /^(education|skills|projects|certifications)/i.test(line) && line.length < 50) {
            break;
        }

        if (inExperienceSection) {
            experienceText += lines[i] + '\n';
        }
    }

    // Parse experience entries (simplified - can be enhanced)
    const experienceLines = experienceText.split('\n').filter(l => l.trim().length > 0);

    for (let i = 0; i < experienceLines.length; i++) {
        const line = experienceLines[i].trim();

        // Look for job titles (lines that might be positions)
        if (line.length > 5 && line.length < 100 && !line.startsWith('-') && !line.startsWith('•')) {
            const entry: ParsedResume['experience'][0] = {
                title: line,
                company: experienceLines[i + 1]?.trim() || 'Unknown',
                description: experienceLines.slice(i + 2, i + 6).join(' ').trim()
            };

            // Extract duration
            const durationMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|present)/i);
            if (durationMatch) {
                entry.duration = durationMatch[0];
            }

            if (entry.description.length > 10) {
                experience.push(entry);
            }
        }
    }

    return experience.slice(0, 5); // Limit to 5 entries
};

/**
 * Extract skills from resume text
 */
const extractSkills = (text: string): string[] => {
    const skills: Set<string> = new Set();
    const skillsKeywords = ['skills', 'technical skills', 'technologies', 'expertise'];

    const lines = text.split('\n');
    let inSkillsSection = false;
    let skillsText = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase().trim();

        if (skillsKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
            inSkillsSection = true;
            continue;
        }

        if (inSkillsSection && /^(experience|education|projects|certifications)/i.test(line) && line.length < 50) {
            break;
        }

        if (inSkillsSection) {
            skillsText += lines[i] + ' ';
        }
    }

    // Common skill patterns
    const commonSkills = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP',
        'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'CI/CD',
        'Machine Learning', 'Deep Learning', 'AI', 'NLP', 'Computer Vision',
        'HTML', 'CSS', 'REST', 'GraphQL', 'Microservices', 'Agile', 'Scrum'
    ];

    // Extract skills from skills section
    const skillsTextLower = skillsText.toLowerCase();
    commonSkills.forEach(skill => {
        if (skillsTextLower.includes(skill.toLowerCase())) {
            skills.add(skill);
        }
    });

    // Also check the entire resume for common skills
    const fullTextLower = text.toLowerCase();
    commonSkills.forEach(skill => {
        if (fullTextLower.includes(skill.toLowerCase())) {
            skills.add(skill);
        }
    });

    return Array.from(skills);
};

/**
 * Extract certifications from resume text
 */
const extractCertifications = (text: string): string[] => {
    const certifications: string[] = [];
    const certKeywords = ['certification', 'certificate', 'certified'];

    const lines = text.split('\n');
    let inCertSection = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase().trim();

        if (certKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
            inCertSection = true;
            continue;
        }

        if (inCertSection && /^(experience|education|skills|projects)/i.test(line) && line.length < 50) {
            break;
        }

        if (inCertSection && lines[i].trim().length > 5) {
            certifications.push(lines[i].trim());
        }
    }

    return certifications.slice(0, 10);
};

/**
 * Extract projects from resume text
 */
const extractProjects = (text: string): ParsedResume['projects'] => {
    const projects: ParsedResume['projects'] = [];
    const projectKeywords = ['projects', 'personal projects', 'academic projects'];

    const lines = text.split('\n');
    let inProjectSection = false;
    let projectText = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].toLowerCase().trim();

        if (projectKeywords.some(keyword => line.includes(keyword)) && line.length < 50) {
            inProjectSection = true;
            continue;
        }

        if (inProjectSection && /^(experience|education|skills|certifications)/i.test(line) && line.length < 50) {
            break;
        }

        if (inProjectSection) {
            projectText += lines[i] + '\n';
        }
    }

    const projectLines = projectText.split('\n').filter(l => l.trim().length > 0);

    for (let i = 0; i < projectLines.length; i += 3) {
        if (projectLines[i]) {
            projects.push({
                name: projectLines[i].trim(),
                description: projectLines[i + 1]?.trim() || '',
                technologies: projectLines[i + 2]?.split(',').map(t => t.trim()) || []
            });
        }
    }

    return projects.slice(0, 5);
};

/**
 * Assess format quality of resume
 */
const assessFormatQuality = (text: string): ParsedResume['formatQuality'] => {
    const sections = ['education', 'experience', 'skills'];
    const textLower = text.toLowerCase();

    const hasProperSections = sections.filter(section =>
        textLower.includes(section)
    ).length >= 2;

    // Check for proper formatting indicators
    const hasBulletPoints = /[•\-\*]/.test(text);
    const hasProperSpacing = text.split('\n\n').length > 3;
    const wordCount = text.split(/\s+/).length;

    const isWellFormatted = hasBulletPoints && hasProperSpacing && wordCount > 100;

    // Readability score (0-100)
    let readabilityScore = 50;
    if (hasProperSections) readabilityScore += 20;
    if (isWellFormatted) readabilityScore += 20;
    if (wordCount > 200 && wordCount < 1000) readabilityScore += 10;

    return {
        hasProperSections,
        isWellFormatted,
        readabilityScore: Math.min(100, readabilityScore)
    };
};

/**
 * Main function to parse resume PDF and extract structured data
 * @param resumeBuffer - PDF file buffer
 * @returns ParsedResume object with structured data
 */
export const parseResumePDF = async (resumeBuffer: Buffer): Promise<ParsedResume> => {
    try {
        console.log('Starting PDF parsing...');

        // Extract raw text from PDF
        const pdfData = await pdfParse(resumeBuffer);
        const rawText = pdfData.text || '';

        if (!rawText || rawText.length < 50) {
            console.warn('PDF parsing resulted in very short or empty content');
            throw new Error('Unable to extract text from PDF. Please ensure it is a valid, text-based PDF.');
        }

        console.log(`Successfully extracted ${rawText.length} characters from PDF`);

        // Extract structured data
        const contactInfo = extractContactInfo(rawText);
        const education = extractEducation(rawText);
        const experience = extractExperience(rawText);
        const skills = extractSkills(rawText);
        const certifications = extractCertifications(rawText);
        const projects = extractProjects(rawText);
        const formatQuality = assessFormatQuality(rawText);

        const parsedResume: ParsedResume = {
            rawText,
            contactInfo,
            summary: undefined, // Will be generated by AI service
            education,
            experience,
            skills,
            certifications,
            projects,
            formatQuality
        };

        console.log('Resume parsing completed successfully');
        console.log(`Extracted: ${skills.length} skills, ${education.length} education entries, ${experience.length} experience entries`);

        return parsedResume;
    } catch (error: any) {
        console.error('Resume parsing error:', error);
        throw new Error(`Failed to parse resume: ${error.message}`);
    }
};
