import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { db } from '../config/db.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'arh_enterprise_super_secret_jwt_key_2026_!@#$%^&*';

// Helper to generate signed JWT token
function generateToken(user, rememberMe = false) {
  const expiresIn = rememberMe ? '7d' : (process.env.JWT_EXPIRES_IN || '24h');
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn }
  );
}

// 1. Student Registration
export const registerStudent = async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const { fullName, email, password, confirmPassword, department, academicYear, semester } = req.body;

  // Validation
  if (!fullName || !email || !password || !confirmPassword || !department) {
    return res.status(400).json({
      success: false,
      message: 'All required fields must be provided (Full Name, Email, Password, Confirm Password, Department).'
    });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid institutional or collegiate email address.'
    });
  }

  // Password confirmation check
  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: 'Password and Confirm Password do not match.'
    });
  }

  // Password strength check (min 8 chars)
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters in length and include alphanumeric characters.'
    });
  }

  try {
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      await db.logAudit({
        action: 'STUDENT_REGISTER_DUPLICATE',
        status: 'FAILURE',
        ipAddress,
        details: `Duplicate registration attempt for email: ${email}`
      });
      return res.status(409).json({
        success: false,
        message: 'An account with this email address is already registered.'
      });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // CRITICAL SECURITY: Never trust role from frontend. Always force role='student'
    const newUser = await db.createUser({
      email,
      password_hash: passwordHash,
      full_name: fullName.trim(),
      role: 'student',
      department: department.trim(),
      academic_year: academicYear || '1st Year',
      semester: semester || 'Semester 1'
    });

    const token = generateToken(newUser, false);

    await db.logAudit({
      userId: newUser.id,
      action: 'STUDENT_REGISTER_SUCCESS',
      status: 'SUCCESS',
      ipAddress,
      details: `New student registered: ${newUser.email}`
    });

    return res.status(201).json({
      success: true,
      message: 'Student account registered successfully.',
      token,
      user: newUser
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected server error occurred during registration.'
    });
  }
};

// 2. Student Sign In
export const loginStudent = async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Both email and password are required.'
    });
  }

  try {
    const user = await db.findUserByEmail(email);
    if (!user) {
      await db.logAudit({
        action: 'STUDENT_LOGIN_UNKNOWN_EMAIL',
        status: 'FAILURE',
        ipAddress,
        details: `Login attempt with non-existent email: ${email}`
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    // Role check: ensure this is a student account
    if (user.role !== 'student') {
      await db.logAudit({
        userId: user.id,
        action: 'STUDENT_LOGIN_WRONG_ROLE',
        status: 'FAILURE',
        ipAddress,
        details: `User with role ${user.role} attempted student login`
      });
      return res.status(403).json({
        success: false,
        message: user.role === 'faculty'
          ? 'This account is registered as Faculty. Please use the Faculty Sign In portal.'
          : 'Access denied for this portal.'
      });
    }

    // Verify password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await db.logAudit({
        userId: user.id,
        action: 'STUDENT_LOGIN_INVALID_PASSWORD',
        status: 'FAILURE',
        ipAddress
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser, !!rememberMe);

    await db.logAudit({
      userId: safeUser.id,
      action: 'STUDENT_LOGIN_SUCCESS',
      status: 'SUCCESS',
      ipAddress
    });

    return res.status(200).json({
      success: true,
      message: 'Student authentication successful.',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Student login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

// 3. Faculty Sign In
export const loginFaculty = async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Official faculty email and password are required.'
    });
  }

  try {
    const user = await db.findUserByEmail(email);
    if (!user) {
      await db.logAudit({
        action: 'FACULTY_LOGIN_UNKNOWN_EMAIL',
        status: 'FAILURE',
        ipAddress,
        details: `Faculty login attempt with non-existent email: ${email}`
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid faculty credentials. Faculty accounts must be provisioned by the institution.'
      });
    }

    // Role check: verify actual faculty role
    if (user.role !== 'faculty') {
      await db.logAudit({
        userId: user.id,
        action: 'FACULTY_LOGIN_ROLE_MISMATCH',
        status: 'FAILURE',
        ipAddress,
        details: `User with role ${user.role} attempted faculty login`
      });
      return res.status(403).json({
        success: false,
        message: user.role === 'student'
          ? 'This account is registered as a Student. Please use the Student Sign In portal.'
          : 'Access denied. Only authorized faculty may access this portal.'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await db.logAudit({
        userId: user.id,
        action: 'FACULTY_LOGIN_INVALID_PASSWORD',
        status: 'FAILURE',
        ipAddress
      });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your official email and password.'
      });
    }

    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser, !!rememberMe);

    await db.logAudit({
      userId: safeUser.id,
      action: 'FACULTY_LOGIN_SUCCESS',
      status: 'SUCCESS',
      ipAddress
    });

    return res.status(200).json({
      success: true,
      message: 'Faculty authentication successful.',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Faculty login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during faculty authentication.'
    });
  }
};

// 4. Block Public Faculty Registration
export const blockFacultyRegistration = (req, res) => {
  return res.status(403).json({
    success: false,
    message: 'Unrestricted public faculty registration is not permitted. Faculty accounts must be provisioned or approved by an authorized administrator.'
  });
};

// 5. Current User / Session Verification
export const getCurrentUser = async (req, res) => {
  // req.user has been verified and attached by authenticateToken middleware
  return res.status(200).json({
    success: true,
    user: req.user
  });
};

// 6. Forgot Password Request
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const ipAddress = req.ip || req.connection.remoteAddress;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required to initiate password reset.'
    });
  }

  try {
    const user = await db.findUserByEmail(email);
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.createPasswordReset(user.id, tokenHash, expiresAt);
      await db.logAudit({
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        status: 'SUCCESS',
        ipAddress
      });
    }

    // Always return neutral security response to prevent user enumeration
    return res.status(200).json({
      success: true,
      message: 'If an authorized account is associated with this email, institutional password reset instructions have been dispatched.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing password reset request.'
    });
  }
};

// 7. Logout
export const logout = async (req, res) => {
  const ipAddress = req.ip || req.connection.remoteAddress;
  if (req.user) {
    await db.logAudit({
      userId: req.user.id,
      action: 'USER_LOGOUT',
      status: 'SUCCESS',
      ipAddress
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Session closed successfully.'
  });
};
