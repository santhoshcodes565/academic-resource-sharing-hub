import express from 'express';
import { facultyController } from '../controllers/facultyController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { uploadResourceFile } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Enforce authentication & faculty/admin role strictly on all /api/faculty/* endpoints
router.use(authenticateToken);
router.use(requireRole('faculty', 'admin'));

// MODULE 1: Dashboard Stats
router.get('/dashboard-stats', facultyController.getDashboardStats);

// MODULE 2 & 3: Resource Management & Upload
router.get('/resources', facultyController.getResources);
router.get('/resources/:id', facultyController.getResourceById);
router.post('/resources', uploadResourceFile.single('file'), facultyController.uploadResource);
router.put('/resources/:id', facultyController.updateResource);
router.patch('/resources/:id/archive', facultyController.archiveResource);
router.delete('/resources/:id', facultyController.deleteResource);

// MODULE 4: Department Management
router.get('/departments', facultyController.getDepartments);
router.post('/departments', facultyController.createDepartment);
router.put('/departments/:id', facultyController.updateDepartment);
router.delete('/departments/:id', facultyController.deleteDepartment);

// MODULE 5: Subject Management
router.get('/subjects', facultyController.getSubjects);
router.post('/subjects', facultyController.createSubject);
router.put('/subjects/:id', facultyController.updateSubject);
router.delete('/subjects/:id', facultyController.deleteSubject);

// MODULE 6: Resource Type Management
router.get('/resource-types', facultyController.getResourceTypes);
router.post('/resource-types', facultyController.createResourceType);
router.put('/resource-types/:id', facultyController.updateResourceType);
router.delete('/resource-types/:id', facultyController.deleteResourceType);

// MODULE 7: Academic Year Management
router.get('/academic-years', facultyController.getAcademicYears);
router.post('/academic-years', facultyController.createAcademicYear);
router.put('/academic-years/:id', facultyController.updateAcademicYear);
router.patch('/academic-years/:id/set-active', facultyController.setActiveAcademicYear);
router.delete('/academic-years/:id', facultyController.deleteAcademicYear);

// MODULE 8: Verify Student Contributions (Workflow: PENDING -> UNDER REVIEW -> VERIFIED/REJECTED -> PUBLISHED -> ARCHIVED)
router.get('/verification', facultyController.getVerifications);
router.get('/verification/:id', facultyController.getVerificationDetails);
router.patch('/verification/:id/status', facultyController.updateVerificationStatus);

// MODULE 9: Resource Requests Management
router.get('/requests', facultyController.getRequests);
router.get('/requests/:id', facultyController.getRequestDetails);
router.patch('/requests/:id', facultyController.updateRequestStatus);

// MODULE 10: Reports & Analytics
router.get('/reports/analytics', facultyController.getReportsAnalytics);

// MODULE 11: Faculty Profile & Credential Management
router.get('/profile', facultyController.getProfile);
router.put('/profile', facultyController.updateProfile);
router.put('/profile/password', facultyController.updatePassword);

export default router;
