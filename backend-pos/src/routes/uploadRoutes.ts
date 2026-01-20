import { Router } from 'express';
import { upload } from '../middleware/upload';
import { ApiResponse } from '../utils/ApiResponse';

const router = Router();

router.post('/', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return ApiResponse.badRequest(res, 'No file uploaded');
    }

    // Return the relative path to the file
    // req.file.filename contains the filename saved in public/uploads
    // We return /uploads/filename.pdf

    const filePath = `/uploads/${req.file.filename}`;

    return ApiResponse.success(res, {
      url: filePath,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    }, 'File uploaded successfully');
  } catch (error: any) {
    console.error('Upload error:', error);
    return ApiResponse.error(res, error.message || 'File upload failed');
  }
});

export default router;
