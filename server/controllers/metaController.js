import { db } from '../config/db.js';

export const metaController = {
  // Get all departments
  async getDepartments(req, res) {
    try {
      const departments = await db.getDepartments();
      return res.json({
        success: true,
        departments
      });
    } catch (error) {
      console.error('[MetaController.getDepartments Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve academic departments.'
      });
    }
  },

  // Get subjects (optionally filtered by department)
  async getSubjects(req, res) {
    try {
      const { department } = req.query;
      const subjects = await db.getSubjects(department);
      return res.json({
        success: true,
        subjects
      });
    } catch (error) {
      console.error('[MetaController.getSubjects Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve academic subjects.'
      });
    }
  },

  // Get all resource types
  async getResourceTypes(req, res) {
    try {
      const resourceTypes = await db.getResourceTypes();
      return res.json({
        success: true,
        resourceTypes
      });
    } catch (error) {
      console.error('[MetaController.getResourceTypes Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve resource types.'
      });
    }
  },

  // Get all academic years
  async getAcademicYears(req, res) {
    try {
      const academicYears = await db.getAcademicYears();
      return res.json({
        success: true,
        academicYears
      });
    } catch (error) {
      console.error('[MetaController.getAcademicYears Error]:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve academic years.'
      });
    }
  }
};
