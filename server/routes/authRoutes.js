import express from 'express';
import {
  registerStudent,
  loginStudent,
  loginFaculty,
  blockFacultyRegistration,
  getCurrentUser,
  forgotPassword,
  logout
} from '../controllers/authController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Authentication Endpoints
router.post('/student/register', registerStudent);
router.post('/student/login', loginStudent);
router.post('/faculty/login', loginFaculty);
router.post('/faculty/register', blockFacultyRegistration); // Explicitly blocks public faculty registration
router.post('/forgot-password', forgotPassword);

// Session Verification & Lifecycle Endpoints
router.get('/me', authenticateToken, getCurrentUser);
router.post('/logout', authenticateToken, logout);

// RBAC Protected Test Verification Endpoints
router.get('/student-only-data', authenticateToken, requireRole('student'), (req, res) => {
  res.json({
    success: true,
    message: 'Authorized access to student-only protected academic resources.',
    user: req.user
  });
});

router.get('/faculty-only-data', authenticateToken, requireRole('faculty', 'admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Authorized access to faculty-only protected administrative portal.',
    user: req.user
  });
});

export default router;
