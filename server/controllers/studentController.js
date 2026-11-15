import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

export const studentController = {
  // MODULE 1: Student Dashboard Statistics
  async getDashboardStats(req, res) {
    try {
      const stats = await db.getStudentDashboardStats(req.user.id);
      return res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('[StudentController.getDashboardStats Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch student dashboard statistics.'
      });
    }
  },

  // MODULE 2 & 3: Resource Library Search & Filters
  async getResources(req, res) {
    try {
      const {
        q,
        department,
        academic_year,
        year,
        semester,
        subject,
        resource_type,
        sort,
        page,
        limit
      } = req.query;

      const result = await db.getResources({
        q,
        department,
        academicYear: academic_year,
        year,
        semester,
        subject,
        resourceType: resource_type,
        sort,
        page,
        limit
      });

      return res.json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('[StudentController.getResources Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to query resource library.'
      });
    }
  },

  // MODULE 4: Resource Details
  async getResourceById(req, res) {
    try {
      const { id } = req.params;
      const resource = await db.getResourceById(id, req.user.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }

      // Security check: Only PUBLISHED resources can be viewed by general students,
      // UNLESS the student is the original uploader of the resource.
      if (resource.status !== 'PUBLISHED' && resource.uploader_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Access restricted. This resource is undergoing academic review and is not published.'
        });
      }

      return res.json({
        success: true,
        resource
      });
    } catch (error) {
      console.error('[StudentController.getResourceById Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve resource details.'
      });
    }
  },

  // Download Action with Counter Increment & Permission Check
  async downloadResource(req, res) {
    try {
      const { id } = req.params;
      const resource = await db.getResourceById(id, req.user.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }

      // Verification check
      if (resource.status !== 'PUBLISHED' && resource.uploader_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Download unavailable. Material is pending verification.'
        });
      }

      // Increment downloads in database and log activity
      await db.incrementResourceDownloads(id, req.user.id);
      await db.logAudit({
        userId: req.user.id,
        action: 'DOWNLOAD_RESOURCE',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Downloaded resource "${resource.title}" (${id})`
      });

      // Check if file exists on disk
      let localFilePath = null;
      if (resource.file_url && resource.file_url.startsWith('/uploads/')) {
        const fileName = path.basename(resource.file_url);
        localFilePath = path.join(uploadsDir, fileName);
      }

      if (localFilePath && fs.existsSync(localFilePath)) {
        return res.download(localFilePath, resource.file_name);
      }

      // If file is simulated/seeded fixture, dynamically serve a verified academic resource document
      const sampleContent = `%PDF-1.4
% Academic Resource Sharing Hub - Verified Material
% Title: ${resource.title}
% Subject: ${resource.subject_code} - ${resource.subject_name}
% Department: ${resource.department_name}
% Academic Year: ${resource.academic_year} | ${resource.semester}
% Verified By: Faculty / Peer Review Board

1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 18 Tf
50 720 Td
(${resource.title}) Tj
/F1 12 Tf
0 -30 Td
(Course: ${resource.subject_code} - ${resource.subject_name}) Tj
0 -20 Td
(Department: ${resource.department_name} | Term: ${resource.academic_year} ${resource.semester}) Tj
0 -40 Td
(Description: ${resource.description ? resource.description.slice(0, 80) : 'Academic Material'}) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
0000000215 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
466
%%EOF`;

      res.setHeader('Content-Type', resource.file_mime || 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(resource.file_name || 'academic_resource.pdf')}"`);
      return res.send(sampleContent);
    } catch (error) {
      console.error('[StudentController.downloadResource Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to download resource.'
      });
    }
  },

  // MODULE 5: Bookmarks
  async getBookmarks(req, res) {
    try {
      const bookmarks = await db.getBookmarks(req.user.id);
      return res.json({
        success: true,
        bookmarks
      });
    } catch (error) {
      console.error('[StudentController.getBookmarks Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve saved bookmarks.'
      });
    }
  },

  async addBookmark(req, res) {
    try {
      const { resourceId } = req.params;
      
      const resource = await db.getResourceById(resourceId);
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }

      const result = await db.addBookmark(req.user.id, resourceId);

      await db.logAudit({
        userId: req.user.id,
        action: 'ADD_BOOKMARK',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Bookmarked resource ${resourceId}`
      });

      return res.status(result.alreadyExists ? 200 : 201).json({
        success: true,
        message: result.alreadyExists ? 'Resource is already bookmarked.' : 'Resource saved to bookmarks.',
        bookmarkId: result.id
      });
    } catch (error) {
      console.error('[StudentController.addBookmark Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to save bookmark.'
      });
    }
  },

  async removeBookmark(req, res) {
    try {
      const { resourceId } = req.params;
      const removed = await db.removeBookmark(req.user.id, resourceId);

      return res.json({
        success: true,
        message: removed ? 'Bookmark removed.' : 'Bookmark was not found.'
      });
    } catch (error) {
      console.error('[StudentController.removeBookmark Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to remove bookmark.'
      });
    }
  },

  // MODULE 6: Upload Resource (Always enters PENDING status)
  async uploadResource(req, res) {
    try {
      const {
        title,
        description,
        department_id,
        subject_id,
        resource_type_id,
        academic_year,
        year,
        semester
      } = req.body;

      // Validation
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Resource title is required.' });
      }
      if (!department_id) {
        return res.status(400).json({ success: false, message: 'Academic department is required.' });
      }
      if (!subject_id) {
        return res.status(400).json({ success: false, message: 'Subject is required.' });
      }
      if (!resource_type_id) {
        return res.status(400).json({ success: false, message: 'Resource type is required.' });
      }
      if (!academic_year) {
        return res.status(400).json({ success: false, message: 'Academic year is required.' });
      }
      if (!semester) {
        return res.status(400).json({ success: false, message: 'Semester is required.' });
      }

      // Check file
      let fileUrl = '';
      let fileName = '';
      let fileSize = '1.2 MB';
      let fileMime = 'application/pdf';

      if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
        fileName = req.file.originalname;
        fileSize = (req.file.size / (1024 * 1024)).toFixed(1) + ' MB';
        fileMime = req.file.mimetype || 'application/pdf';
      } else if (req.body.file_url) {
        // Direct link or simulated payload
        fileUrl = req.body.file_url;
        fileName = req.body.file_name || `${title.replace(/\s+/g, '_')}.pdf`;
        fileSize = req.body.file_size || '2.0 MB';
        fileMime = req.body.file_mime || 'application/pdf';
      } else {
        return res.status(400).json({
          success: false,
          message: 'An academic document file is required.'
        });
      }

      // SECURITY INVARIANT: Student uploads MUST enter PENDING status
      const createdResource = await db.createResource({
        title: title.trim(),
        description: (description || '').trim(),
        department_id,
        subject_id,
        resource_type_id,
        academic_year,
        year: parseInt(year) || 1,
        semester,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        file_mime: fileMime,
        uploader_id: req.user.id,
        status: 'PENDING' // Never published automatically
      });

      await db.logAudit({
        userId: req.user.id,
        action: 'UPLOAD_RESOURCE',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Student submitted resource "${title}" (Status: PENDING)`
      });

      return res.status(201).json({
        success: true,
        message: 'Resource submitted successfully. Your contribution is now PENDING peer and faculty review.',
        resource: createdResource
      });
    } catch (error) {
      console.error('[StudentController.uploadResource Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload resource contribution.'
      });
    }
  },

  // MODULE 7: My Contributions
  async getContributions(req, res) {
    try {
      const contributions = await db.getStudentContributions(req.user.id);
      return res.json({
        success: true,
        contributions
      });
    } catch (error) {
      console.error('[StudentController.getContributions Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve student contributions.'
      });
    }
  },

  // MODULE 8: Resource Requests
  async getRequests(req, res) {
    try {
      const requests = await db.getStudentRequests(req.user.id);
      return res.json({
        success: true,
        requests
      });
    } catch (error) {
      console.error('[StudentController.getRequests Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve resource requests.'
      });
    }
  },

  async createRequest(req, res) {
    try {
      const { department_id, subject_id, title, description } = req.body;

      if (!department_id) {
        return res.status(400).json({ success: false, message: 'Department is required.' });
      }
      if (!subject_id) {
        return res.status(400).json({ success: false, message: 'Subject is required.' });
      }
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Request title is required.' });
      }
      if (!description || !description.trim()) {
        return res.status(400).json({ success: false, message: 'Request description is required.' });
      }

      const request = await db.createStudentRequest({
        user_id: req.user.id,
        department_id,
        subject_id,
        title: title.trim(),
        description: description.trim()
      });

      await db.logAudit({
        userId: req.user.id,
        action: 'CREATE_RESOURCE_REQUEST',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Student created resource request "${title}"`
      });

      return res.status(201).json({
        success: true,
        message: 'Resource request created successfully. Faculty and peer contributors have been notified.',
        request
      });
    } catch (error) {
      console.error('[StudentController.createRequest Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to submit resource request.'
      });
    }
  },

  // MODULE 9: Student Profile
  async getProfile(req, res) {
    try {
      const user = await db.findUserById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }

      const stats = await db.getStudentDashboardStats(req.user.id);

      return res.json({
        success: true,
        profile: {
          ...user,
          stats: {
            bookmarksCount: stats.totalBookmarks,
            downloadsCount: stats.totalDownloads,
            contributionsCount: stats.myContributions.total,
            requestsCount: stats.activeRequests
          }
        }
      });
    } catch (error) {
      console.error('[StudentController.getProfile Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile.'
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const { full_name, department, academic_year, semester } = req.body;

      // Note: email, role, is_active, is_verified are strictly not editable by students
      const updatedUser = await db.updateUserProfile(req.user.id, {
        full_name: full_name ? full_name.trim() : undefined,
        department: department ? department.trim() : undefined,
        academic_year: academic_year ? academic_year.trim() : undefined,
        semester: semester ? semester.trim() : undefined
      });

      await db.logAudit({
        userId: req.user.id,
        action: 'UPDATE_PROFILE',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: 'Student updated profile details'
      });

      return res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: updatedUser
      });
    } catch (error) {
      console.error('[StudentController.updateProfile Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile.'
      });
    }
  },

  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Both current password and new password are required.'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'New password and confirm password do not match.'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long.'
        });
      }

      // Fetch user with password_hash
      const fullUser = await db.findUserByEmail(req.user.email);
      const isMatch = await bcrypt.compare(currentPassword, fullUser.password_hash);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match our records.'
        });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);
      await db.updateUserPassword(req.user.id, newPasswordHash);

      await db.logAudit({
        userId: req.user.id,
        action: 'CHANGE_PASSWORD',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: 'Student changed password'
      });

      return res.json({
        success: true,
        message: 'Password changed successfully.'
      });
    } catch (error) {
      console.error('[StudentController.updatePassword Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to change password.'
      });
    }
  }
};
