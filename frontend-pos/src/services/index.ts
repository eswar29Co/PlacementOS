// Export all API services
export { authService } from './authService';
export { jobService } from './jobService';
export { applicationService } from './applicationService';
export { assessmentService } from './assessmentService';
export { notificationService } from './notificationService';
export { professionalService } from './professionalService';
export { studentService } from './studentService';
export { dashboardService } from './dashboardService';
export { adminService } from './adminService';
export { collegeService } from './collegeService';

// Export API client for custom requests
export { default as apiClient, handleApiError } from './api';
