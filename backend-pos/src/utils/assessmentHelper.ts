import { Assessment } from '../models/Assessment';
import { config } from '../config';

// Sample question bank
export const questionBank = {
    mcq: [
        {
            id: 'mcq_1',
            question: 'What is the time complexity of binary search?',
            options: ['O(n)', 'O(log n)', 'O(n^2)', 'O(1)'],
            correctOption: 1,
        },
        {
            id: 'mcq_2',
            question: 'Which data structure uses LIFO principle?',
            options: ['Queue', 'Stack', 'Array', 'Tree'],
            correctOption: 1,
        },
        {
            id: 'mcq_3',
            question: 'What does REST stand for?',
            options: [
                'Representational State Transfer',
                'Remote State Transfer',
                'Resource State Transfer',
                'Representational System Transfer',
            ],
            correctOption: 0,
        },
        {
            id: 'mcq_4',
            question: 'Which HTTP method is used to update a resource?',
            options: ['GET', 'POST', 'PUT', 'DELETE'],
            correctOption: 2,
        },
        {
            id: 'mcq_5',
            question: 'What is the purpose of a primary key in a database?',
            options: [
                'To uniquely identify a record',
                'To create an index',
                'To define relationships',
                'To encrypt data',
            ],
            correctOption: 0,
        },
        {
            id: 'mcq_6',
            question: 'What is polymorphism in OOP?',
            options: [
                'Ability to take many forms',
                'Data hiding',
                'Code reusability',
                'Multiple inheritance',
            ],
            correctOption: 0,
        },
        {
            id: 'mcq_7',
            question: 'Which sorting algorithm has best average case time complexity?',
            options: ['Bubble Sort', 'Quick Sort', 'Selection Sort', 'Insertion Sort'],
            correctOption: 1,
        },
        {
            id: 'mcq_8',
            question: 'What is the default port for HTTPS?',
            options: ['80', '443', '8080', '3000'],
            correctOption: 1,
        },
    ],
    coding: [
        {
            id: 'code_1',
            title: 'Two Sum',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            examples: [
                { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' },
                { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
            ],
            constraints: [
                '2 <= nums.length <= 10^4',
                '-10^9 <= nums[i] <= 10^9',
                'Only one valid answer exists',
            ],
            difficulty: 'Easy' as const,
            testCases: [
                { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
                { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
                { input: '[3,3]\n6', expectedOutput: '[0,1]' },
            ],
        },
        {
            id: 'code_2',
            title: 'Reverse String',
            description: 'Write a function that reverses a string. The input string is given as an array of characters.',
            examples: [
                { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
                { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
            ],
            constraints: ['1 <= s.length <= 10^5'],
            difficulty: 'Easy' as const,
            testCases: [
                { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
                { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' },
            ],
        },
        {
            id: 'code_3',
            title: 'Valid Palindrome',
            description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.',
            examples: [
                { input: 's = "A man, a plan, a canal: Panama"', output: 'true' },
                { input: 's = "race a car"', output: 'false' },
            ],
            constraints: ['1 <= s.length <= 2 * 10^5'],
            difficulty: 'Easy' as const,
            testCases: [
                { input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true' },
                { input: '"race a car"', expectedOutput: 'false' },
            ],
        },
    ],
};

export const createAssessmentRecord = async (applicationId: string, jobId: string, duration: number = 60) => {
    // Select random MCQs
    const shuffledMCQs = [...questionBank.mcq].sort(() => Math.random() - 0.5);
    const selectedMCQs = shuffledMCQs.slice(0, config.assessment.mcqCount || 5);

    // Select random coding question
    const randomCodingQuestion = questionBank.coding[
        Math.floor(Math.random() * questionBank.coding.length)
    ];

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);

    const assessment = await Assessment.create({
        applicationId,
        jobId,
        deadline,
        duration,
        mcqQuestions: selectedMCQs,
        codingQuestion: randomCodingQuestion,
        status: 'pending',
    });

    return assessment;
};
