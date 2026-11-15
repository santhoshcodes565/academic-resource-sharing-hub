import { db } from '../config/db.js';

function formatBytes(bytes, decimals = 1) {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const facultyController = {
  // MODULE 1: Faculty Dashboard Statistics
  async getDashboardStats(req, res) {
    try {
      const stats = await db.getFacultyDashboardStats();
      return res.json({
        success: true,
        stats
      });
    } catch (error) {
      console.error('[FacultyController.getDashboardStats Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve faculty dashboard statistics.'
      });
    }
  },

  // MODULE 2: Manage Resources (List, Search, Filter & Pagination)
  async getResources(req, res) {
    try {
      const {
        q,
        department,
        subject,
        resource_type,
        academic_year,
        status,
        sort,
        page,
        limit
      } = req.query;

      const result = await db.getFacultyResources({
        q,
        department,
        subject,
        resourceType: resource_type,
        academicYear: academic_year,
        status,
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
      console.error('[FacultyController.getResources Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve faculty resources.'
      });
    }
  },

  async getResourceById(req, res) {
    try {
      const { id } = req.params;
      const resource = await db.getResourceById(id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }

      return res.json({
        success: true,
        resource
      });
    } catch (error) {
      console.error('[FacultyController.getResourceById Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve resource.'
      });
    }
  },

  // MODULE 3: Faculty Resource Upload
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
        semester,
        status,
        staff_remarks
      } = req.body;

      // Validation
      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, message: 'Resource title is required.' });
      }
      if (!department_id) {
        return res.status(400).json({ success: false, message: 'Department selection is required.' });
      }
      if (!subject_id) {
        return res.status(400).json({ success: false, message: 'Subject selection is required.' });
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

      let fileUrl = req.body.file_url;
      let fileName = req.body.file_name;
      let fileSize = req.body.file_size;
      let fileMime = req.body.file_mime || 'application/pdf';

      if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
        fileName = req.file.originalname;
        fileSize = formatBytes(req.file.size);
        fileMime = req.file.mimetype;
      } else if (!fileUrl) {
        // Sample document placeholder fallback
        fileUrl = `/uploads/faculty_upload_${Date.now()}.pdf`;
        fileName = `${title.trim().replace(/[^a-zA-Z0-9_\-\.]/g, '_').slice(0, 30)}.pdf`;
        fileSize = '1.8 MB';
        fileMime = 'application/pdf';
      }

      const resource = await db.createFacultyResource({
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
        status: status || 'PUBLISHED',
        staff_remarks: staff_remarks || 'Institutional faculty upload — Curricularly approved'
      });

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_UPLOAD_RESOURCE',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Faculty ${req.user.full_name} uploaded and published "${resource.title}" (${resource.id})`
      });

      return res.status(201).json({
        success: true,
        message: 'Academic resource published successfully.',
        resource
      });
    } catch (error) {
      console.error('[FacultyController.uploadResource Error]:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload faculty resource.'
      });
    }
  },

  // Edit Resource Metadata
  async updateResource(req, res) {
    try {
      const { id } = req.params;
      const resource = await db.getResourceById(id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }

      const updated = await db.updateFacultyResource(id, req.body);

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_UPDATE_RESOURCE',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Updated metadata for resource "${updated.title}" (${id})`
      });

      return res.json({
        success: true,
        message: 'Resource updated successfully.',
        resource: updated
      });
    } catch (error) {
      console.error('[FacultyController.updateResource Error]:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update resource.'
      });
    }
  },

  // Archive Resource
  async archiveResource(req, res) {
    try {
      const { id } = req.params;
      const resource = await db.getResourceById(id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }

      const archived = await db.archiveFacultyResource(id);

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_ARCHIVE_RESOURCE',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Archived resource "${resource.title}" (${id})`
      });

      return res.json({
        success: true,
        message: 'Resource archived successfully.',
        resource: archived
      });
    } catch (error) {
      console.error('[FacultyController.archiveResource Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to archive resource.'
      });
    }
  },

  // Delete Resource
  async deleteResource(req, res) {
    try {
      const { id } = req.params;
      const resource = await db.getResourceById(id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found.'
        });
      }

      await db.deleteFacultyResource(id);

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_DELETE_RESOURCE',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Deleted resource "${resource.title}" (${id})`
      });

      return res.json({
        success: true,
        message: 'Resource removed successfully.'
      });
    } catch (error) {
      console.error('[FacultyController.deleteResource Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete resource.'
      });
    }
  },

  // MODULE 4: Department Management
  async getDepartments(req, res) {
    try {
      const departments = await db.getDepartmentsDetailed();
      return res.json({
        success: true,
        departments
      });
    } catch (error) {
      console.error('[FacultyController.getDepartments Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch departments.'
      });
    }
  },

  async createDepartment(req, res) {
    try {
      const { code, name, description, icon } = req.body;
      if (!code || !code.trim()) {
        return res.status(400).json({ success: false, message: 'Department code is required.' });
      }
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Department name is required.' });
      }

      const department = await db.createDepartment({ code, name, description, icon });

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_CREATE_DEPARTMENT',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Created department "${department.name}" (${department.code})`
      });

      return res.status(201).json({
        success: true,
        message: 'Department registered successfully.',
        department
      });
    } catch (error) {
      console.error('[FacultyController.createDepartment Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create department.'
      });
    }
  },

  async updateDepartment(req, res) {
    try {
      const { id } = req.params;
      const { code, name, description, icon } = req.body;

      const department = await db.updateDepartment(id, { code, name, description, icon });
      if (!department) {
        return res.status(404).json({ success: false, message: 'Department not found.' });
      }

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_UPDATE_DEPARTMENT',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Updated department ${id}`
      });

      return res.json({
        success: true,
        message: 'Department updated successfully.',
        department
      });
    } catch (error) {
      console.error('[FacultyController.updateDepartment Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update department.'
      });
    }
  },

  async deleteDepartment(req, res) {
    try {
      const { id } = req.params;
      await db.deleteDepartment(id);

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_DELETE_DEPARTMENT',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Deleted department ${id}`
      });

      return res.json({
        success: true,
        message: 'Department deleted successfully.'
      });
    } catch (error) {
      console.error('[FacultyController.deleteDepartment Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete department.'
      });
    }
  },

  // MODULE 5: Subject Management
  async getSubjects(req, res) {
    try {
      const { department } = req.query;
      const subjects = await db.getSubjectsDetailed(department);
      return res.json({
        success: true,
        subjects
      });
    } catch (error) {
      console.error('[FacultyController.getSubjects Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch subjects.'
      });
    }
  },

  async createSubject(req, res) {
    try {
      const { department_id, code, name, year, semester, description } = req.body;
      if (!department_id) {
        return res.status(400).json({ success: false, message: 'Department association is required.' });
      }
      if (!code || !code.trim()) {
        return res.status(400).json({ success: false, message: 'Subject code is required.' });
      }
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Subject name is required.' });
      }

      const subject = await db.createSubject({
        department_id,
        code,
        name,
        year: parseInt(year) || 1,
        semester: semester || 'Semester 1',
        description
      });

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_CREATE_SUBJECT',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Created subject "${subject.name}" (${subject.code})`
      });

      return res.status(201).json({
        success: true,
        message: 'Subject registered successfully.',
        subject
      });
    } catch (error) {
      console.error('[FacultyController.createSubject Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create subject.'
      });
    }
  },

  async updateSubject(req, res) {
    try {
      const { id } = req.params;
      const subject = await db.updateSubject(id, req.body);
      if (!subject) {
        return res.status(404).json({ success: false, message: 'Subject not found.' });
      }

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_UPDATE_SUBJECT',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Updated subject ${id}`
      });

      return res.json({
        success: true,
        message: 'Subject updated successfully.',
        subject
      });
    } catch (error) {
      console.error('[FacultyController.updateSubject Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update subject.'
      });
    }
  },

  async deleteSubject(req, res) {
    try {
      const { id } = req.params;
      await db.deleteSubject(id);

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_DELETE_SUBJECT',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Deleted subject ${id}`
      });

      return res.json({
        success: true,
        message: 'Subject deleted successfully.'
      });
    } catch (error) {
      console.error('[FacultyController.deleteSubject Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete subject.'
      });
    }
  },

  // MODULE 6: Resource Type Management
  async getResourceTypes(req, res) {
    try {
      const resourceTypes = await db.getResourceTypesDetailed();
      return res.json({
        success: true,
        resourceTypes
      });
    } catch (error) {
      console.error('[FacultyController.getResourceTypes Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch resource types.'
      });
    }
  },

  async createResourceType(req, res) {
    try {
      const { code, name, description, icon } = req.body;
      if (!code || !code.trim()) {
        return res.status(400).json({ success: false, message: 'Resource type code is required.' });
      }
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Resource type name is required.' });
      }

      const resourceType = await db.createResourceType({ code, name, description, icon });

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_CREATE_RESOURCE_TYPE',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Created resource type "${resourceType.name}" (${resourceType.code})`
      });

      return res.status(201).json({
        success: true,
        message: 'Resource type created successfully.',
        resourceType
      });
    } catch (error) {
      console.error('[FacultyController.createResourceType Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create resource type.'
      });
    }
  },

  async updateResourceType(req, res) {
    try {
      const { id } = req.params;
      const resourceType = await db.updateResourceType(id, req.body);
      if (!resourceType) {
        return res.status(404).json({ success: false, message: 'Resource type not found.' });
      }

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_UPDATE_RESOURCE_TYPE',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Updated resource type ${id}`
      });

      return res.json({
        success: true,
        message: 'Resource type updated successfully.',
        resourceType
      });
    } catch (error) {
      console.error('[FacultyController.updateResourceType Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update resource type.'
      });
    }
  },

  async deleteResourceType(req, res) {
    try {
      const { id } = req.params;
      await db.deleteResourceType(id);

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_DELETE_RESOURCE_TYPE',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Deleted resource type ${id}`
      });

      return res.json({
        success: true,
        message: 'Resource type deleted successfully.'
      });
    } catch (error) {
      console.error('[FacultyController.deleteResourceType Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete resource type.'
      });
    }
  },

  // MODULE 7: Academic Year Management
  async getAcademicYears(req, res) {
    try {
      const academicYears = await db.getAcademicYears();
      return res.json({
        success: true,
        academicYears
      });
    } catch (error) {
      console.error('[FacultyController.getAcademicYears Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch academic years.'
      });
    }
  },

  async createAcademicYear(req, res) {
    try {
      const { name, start_date, end_date, is_active } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Academic year designation (e.g. 2025-2026) is required.' });
      }

      const academicYear = await db.createAcademicYear({
        name,
        start_date,
        end_date,
        is_active: Boolean(is_active)
      });

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_CREATE_ACADEMIC_YEAR',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Created academic year "${academicYear.name}"`
      });

      return res.status(201).json({
        success: true,
        message: 'Academic year created successfully.',
        academicYear
      });
    } catch (error) {
      console.error('[FacultyController.createAcademicYear Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to create academic year.'
      });
    }
  },

  async updateAcademicYear(req, res) {
    try {
      const { id } = req.params;
      const academicYear = await db.updateAcademicYear(id, req.body);
      if (!academicYear) {
        return res.status(404).json({ success: false, message: 'Academic year not found.' });
      }

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_UPDATE_ACADEMIC_YEAR',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Updated academic year ${id}`
      });

      return res.json({
        success: true,
        message: 'Academic year updated successfully.',
        academicYear
      });
    } catch (error) {
      console.error('[FacultyController.updateAcademicYear Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update academic year.'
      });
    }
  },

  async setActiveAcademicYear(req, res) {
    try {
      const { id } = req.params;
      const academicYear = await db.setActiveAcademicYear(id);
      if (!academicYear) {
        return res.status(404).json({ success: false, message: 'Academic year not found.' });
      }

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_SET_ACTIVE_ACADEMIC_YEAR',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Activated academic year "${academicYear.name}" (${id})`
      });

      return res.json({
        success: true,
        message: `Academic year "${academicYear.name}" is now designated as the active academic year.`,
        academicYear
      });
    } catch (error) {
      console.error('[FacultyController.setActiveAcademicYear Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to set active academic year.'
      });
    }
  },

  async deleteAcademicYear(req, res) {
    try {
      const { id } = req.params;
      await db.deleteAcademicYear(id);

      await db.logAudit({
        userId: req.user.id,
        action: 'FACULTY_DELETE_ACADEMIC_YEAR',
        status: 'SUCCESS',
        ipAddress: req.ip,
        details: `Deleted academic year ${id}`
      });

      return res.json({
        success: true,
        message: 'Academic year deleted successfully.'
      });
    } catch (error) {
      console.error('[FacultyController.deleteAcademicYear Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete academic year.'
      });
    }
  },

  // ==================== PHASE 4: FACULTY PORTAL PART B ====================

  // MODULE 1: Verify Student Contributions (Listing, Filters & Status Tabs)
  async getVerifications(req, res) {
    try {
      const {
        status,
        department,
        search,
        sort,
        page,
        limit
      } = req.query;

      const result = await db.getStudentContributionsForFaculty({
        status,
        department,
        search,
        sort,
        page,
        limit
      });

      return res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        counts: result.counts
      });
    } catch (error) {
      console.error('[FacultyController.getVerifications Error]:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve student verification queue.'
      });
    }
  },

  // MODULE 2: Resource Review Details & History
  async getVerificationDetails(req, res) {
    try {
      const { id } = req.params;
      const details = await db.getVerificationDetails(id);

      if (!details) {
        return res.status(404).json({
          success: false,
          message: 'Student submission not found.'
        });
      }

      return res.json({
        success: true,
        data: details
      });
    } catch (error) {
      console.error('[FacultyController.getVerificationDetails Error]:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve submission review details.'
      });
    }
  },

  // MODULE 2: Update Verification Status & Store Review Record
  async updateVerificationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, remarks } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Target review status is required.'
        });
      }

      if (status.toUpperCase() === 'REJECTED' && (!remarks || !remarks.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Institutional remarks are mandatory when rejecting a submission.'
        });
      }

      const updated = await db.updateVerificationStatus(id, req.user.id, {
        status,
        remarks
      });

      return res.json({
        success: true,
        message: `Resource verification status successfully transitioned to "${status}".`,
        data: updated
      });
    } catch (error) {
      console.error('[FacultyController.updateVerificationStatus Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update verification status.'
      });
    }
  },

  // MODULE 3: Faculty Request Management
  async getRequests(req, res) {
    try {
      const {
        status,
        department,
        search,
        sort,
        page,
        limit
      } = req.query;

      const result = await db.getFacultyRequests({
        status,
        department,
        search,
        sort,
        page,
        limit
      });

      return res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
        counts: result.counts
      });
    } catch (error) {
      console.error('[FacultyController.getRequests Error]:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve student resource requests.'
      });
    }
  },

  async getRequestDetails(req, res) {
    try {
      const { id } = req.params;
      const request = await db.getFacultyRequestById(id);

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Resource request not found.'
        });
      }

      return res.json({
        success: true,
        request
      });
    } catch (error) {
      console.error('[FacultyController.getRequestDetails Error]:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve request details.'
      });
    }
  },

  async updateRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, staff_remarks } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Request status is required.'
        });
      }

      const updated = await db.updateFacultyRequest(id, req.user.id, {
        status,
        staff_remarks
      });

      return res.json({
        success: true,
        message: `Request status transitioned to "${status}".`,
        request: updated
      });
    } catch (error) {
      console.error('[FacultyController.updateRequestStatus Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update request status.'
      });
    }
  },

  // MODULE 4: Reports & Analytics
  async getReportsAnalytics(req, res) {
    try {
      const analytics = await db.getFacultyReportsAnalytics();
      return res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('[FacultyController.getReportsAnalytics Error]:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to compile faculty reports and analytics.'
      });
    }
  },

  // MODULE 5: Faculty Profile & Security
  async getProfile(req, res) {
    try {
      const profile = await db.getFacultyProfile(req.user.id);
      if (!profile) {
        return res.status(404).json({
          success: false,
          message: 'Faculty profile not found.'
        });
      }

      return res.json({
        success: true,
        profile: profile.user,
        stats: profile.stats
      });
    } catch (error) {
      console.error('[FacultyController.getProfile Error]:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to retrieve faculty profile.'
      });
    }
  },

  async updateProfile(req, res) {
    try {
      const { full_name, department } = req.body;
      const updated = await db.updateFacultyProfile(req.user.id, {
        full_name,
        department
      });

      return res.json({
        success: true,
        message: 'Faculty profile updated successfully.',
        profile: updated
      });
    } catch (error) {
      console.error('[FacultyController.updateProfile Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update profile.'
      });
    }
  },

  async updatePassword(req, res) {
    try {
      const { current_password, new_password } = req.body;
      const result = await db.updateFacultyPassword(req.user.id, {
        current_password,
        new_password
      });

      return res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('[FacultyController.updatePassword Error]:', error);
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update password.'
      });
    }
  }
};
