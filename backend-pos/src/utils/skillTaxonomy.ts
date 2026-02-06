/**
 * Skill Taxonomy and Categorization System
 * Maps skills to categories and handles synonyms
 */

export interface SkillCategories {
    programming: string[];
    frameworks: string[];
    tools: string[];
    databases: string[];
    cloud: string[];
    softSkills: string[];
    other: string[];
}

/**
 * Comprehensive skill categories
 */
export const SKILL_CATEGORIES: Record<string, string[]> = {
    programming: [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Ruby', 'Go', 'Rust',
        'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Shell', 'Bash',
        'HTML', 'CSS', 'SQL', 'NoSQL', 'GraphQL'
    ],
    frameworks: [
        'React', 'Angular', 'Vue', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby',
        'Node.js', 'Express', 'NestJS', 'Fastify', 'Koa',
        'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'Hibernate',
        'Laravel', 'Symfony', 'Rails', 'ASP.NET', '.NET Core',
        'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy'
    ],
    tools: [
        'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN',
        'Docker', 'Kubernetes', 'Jenkins', 'Travis CI', 'CircleCI', 'GitHub Actions',
        'Webpack', 'Babel', 'Vite', 'Rollup', 'Gulp', 'Grunt',
        'Jest', 'Mocha', 'Cypress', 'Selenium', 'Postman', 'Insomnia',
        'VS Code', 'IntelliJ', 'Eclipse', 'PyCharm', 'Vim', 'Emacs',
        'Jira', 'Confluence', 'Trello', 'Asana', 'Slack', 'Teams'
    ],
    databases: [
        'MongoDB', 'PostgreSQL', 'MySQL', 'MariaDB', 'SQLite', 'Oracle', 'SQL Server',
        'Redis', 'Memcached', 'Elasticsearch', 'Cassandra', 'DynamoDB', 'Firebase',
        'Neo4j', 'CouchDB', 'InfluxDB'
    ],
    cloud: [
        'AWS', 'Azure', 'GCP', 'Google Cloud', 'Heroku', 'DigitalOcean', 'Vercel', 'Netlify',
        'EC2', 'S3', 'Lambda', 'CloudFront', 'RDS', 'ECS', 'EKS',
        'Cloud Functions', 'Cloud Run', 'App Engine', 'Cloud Storage',
        'Terraform', 'CloudFormation', 'Ansible', 'Puppet', 'Chef'
    ],
    softSkills: [
        'Leadership', 'Communication', 'Teamwork', 'Problem Solving', 'Critical Thinking',
        'Time Management', 'Project Management', 'Agile', 'Scrum', 'Kanban',
        'Analytical Skills', 'Creativity', 'Adaptability', 'Collaboration',
        'Presentation', 'Public Speaking', 'Mentoring', 'Coaching'
    ]
};

/**
 * Skill synonyms and variations mapping
 */
export const SKILL_SYNONYMS: Record<string, string> = {
    // Programming Languages
    'JS': 'JavaScript',
    'TS': 'TypeScript',
    'Py': 'Python',
    'C++': 'CPlusPlus',
    'C#': 'CSharp',

    // Frameworks
    'ReactJS': 'React',
    'React.js': 'React',
    'AngularJS': 'Angular',
    'Angular.js': 'Angular',
    'VueJS': 'Vue',
    'Vue.js': 'Vue',
    'NodeJS': 'Node.js',
    'ExpressJS': 'Express',
    'NextJS': 'Next.js',

    // Technologies
    'ML': 'Machine Learning',
    'AI': 'Artificial Intelligence',
    'DL': 'Deep Learning',
    'NLP': 'Natural Language Processing',
    'CV': 'Computer Vision',
    'CI/CD': 'Continuous Integration',
    'REST API': 'REST',
    'RESTful': 'REST',

    // Databases
    'Mongo': 'MongoDB',
    'Postgres': 'PostgreSQL',
    'MSSQL': 'SQL Server',

    // Cloud
    'Amazon Web Services': 'AWS',
    'Google Cloud Platform': 'GCP',
    'Microsoft Azure': 'Azure',

    // Methodologies
    'Agile Methodology': 'Agile',
    'Scrum Master': 'Scrum',
    'PM': 'Project Management'
};

/**
 * Normalize skill name (handle synonyms and variations)
 */
export const normalizeSkill = (skill: string): string => {
    const trimmed = skill.trim();

    // Check if it's a known synonym
    if (SKILL_SYNONYMS[trimmed]) {
        return SKILL_SYNONYMS[trimmed];
    }

    // Check case-insensitive match in all categories
    for (const category of Object.values(SKILL_CATEGORIES)) {
        const found = category.find(s => s.toLowerCase() === trimmed.toLowerCase());
        if (found) {
            return found;
        }
    }

    // Return original if no match found
    return trimmed;
};

/**
 * Categorize a skill
 */
export const categorizeSkill = (skill: string): string => {
    const normalized = normalizeSkill(skill);

    for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
        if (skills.some(s => s.toLowerCase() === normalized.toLowerCase())) {
            return category;
        }
    }

    return 'other';
};

/**
 * Categorize multiple skills
 */
export const categorizeSkills = (skills: string[]): SkillCategories => {
    const categorized: SkillCategories = {
        programming: [],
        frameworks: [],
        tools: [],
        databases: [],
        cloud: [],
        softSkills: [],
        other: []
    };

    skills.forEach(skill => {
        const normalized = normalizeSkill(skill);
        const category = categorizeSkill(normalized);

        if (category in categorized) {
            (categorized as any)[category].push(normalized);
        } else {
            categorized.other.push(normalized);
        }
    });

    return categorized;
};

/**
 * Find missing skills by comparing required vs actual
 */
export const findMissingSkills = (
    requiredSkills: string[],
    actualSkills: string[]
): string[] => {
    const normalizedActual = actualSkills.map(s => normalizeSkill(s).toLowerCase());

    return requiredSkills.filter(required => {
        const normalized = normalizeSkill(required).toLowerCase();
        return !normalizedActual.includes(normalized);
    });
};

/**
 * Find matched skills
 */
export const findMatchedSkills = (
    requiredSkills: string[],
    actualSkills: string[]
): string[] => {
    const normalizedActual = actualSkills.map(s => normalizeSkill(s).toLowerCase());

    return requiredSkills.filter(required => {
        const normalized = normalizeSkill(required).toLowerCase();
        return normalizedActual.includes(normalized);
    });
};

/**
 * Calculate skill match percentage
 */
export const calculateSkillMatchPercentage = (
    requiredSkills: string[],
    actualSkills: string[]
): number => {
    if (requiredSkills.length === 0) return 100;

    const matched = findMatchedSkills(requiredSkills, actualSkills);
    return Math.round((matched.length / requiredSkills.length) * 100);
};
