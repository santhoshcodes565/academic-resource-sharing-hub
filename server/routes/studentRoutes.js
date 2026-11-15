import express from 'express';
import { studentController } from '../controllers/studentController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { uploadResourceFile } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Enforce student role for all /api/student/* endpoints
router.use(authenticateToken);
router.use(requireRole('student'));

// MODULE 1: Dashboard Stats
router.get('/dashboard-stats', studentController.getDashboardStats);

// MODULE 2 & 3: Resource Library
router.get('/resources', studentController.getResources);
router.get('/resources/:id', studentController.getResourceById);
router.post('/resources/:id/download', studentController.downloadResource);

// MODULE 5: Bookmarks
router.get('/bookmarks', studentController.getBookmarks);
router.post('/bookmarks/:resourceId', studentController.addBookmark);
router.delete('/bookmarks/:resourceId', studentController.removeBookmark);

// MODULE 6: Upload Resource (multipart file upload support)
router.post('/upload', uploadResourceFile.single('file'), studentController.uploadResource);

// MODULE 7: My Contributions
router.get('/contributions', studentController.getContributions);

// MODULE 8: Resource Requests
router.get('/requests', studentController.getRequests);
router.post('/requests', studentController.createRequest);

// MODULE 9: Student Profile
router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);
router.put('/profile/password', studentController.updatePassword);

export default router;
