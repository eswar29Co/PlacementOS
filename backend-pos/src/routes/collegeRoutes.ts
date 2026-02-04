import { Router } from 'express';
import { registerCollege, getColleges, getCollegeDetails } from '../controllers/collegeController';

const router = Router();

router.post('/register', registerCollege);
router.get('/', getColleges);
router.get('/:id', getCollegeDetails);

export default router;
