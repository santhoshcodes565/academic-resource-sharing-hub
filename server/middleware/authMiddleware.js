import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { db } from '../config/db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'arh_enterprise_super_secret_jwt_key_2026_!@#$%^&*';

// Verify JWT token from Authorization header (Bearer <token>)
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Always fetch fresh verified user status from database (never trust client payload alone)
    const user = await db.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User account no longer exists.'
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact administrator.'
      });
    }

    req.user = user; // user contains { id, email, full_name, role, department, academic_year, semester }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication session expired. Please sign in again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid authentication token.'
    });
  }
};

// Role-based authorization middleware
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Access is restricted to [${allowedRoles.join(', ')}] role(s). Your verified role is '${req.user.role}'.`
      });
    }

    next();
  };
};
