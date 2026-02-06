import { Router } from 'express';
import {
    registerCollege,
    getColleges,
    getAllColleges,
    getCollegeDetails,
    approveCollege,
    rejectCollege
} from '../controllers/collegeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', registerCollege);
router.get('/', getColleges); // Only approved colleges

// SuperAdmin routes
router.get('/all', authenticate, authorize('superadmin'), getAllColleges); // All colleges
router.get('/:id', getCollegeDetails);
router.patch('/:id/approve', authenticate, authorize('superadmin'), approveCollege);
router.patch('/:id/reject', authenticate, authorize('superadmin'), rejectCollege);

export default router;
