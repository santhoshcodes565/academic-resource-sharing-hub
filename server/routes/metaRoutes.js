import express from 'express';
import { metaController } from '../controllers/metaController.js';

const router = express.Router();

router.get('/departments', metaController.getDepartments);
router.get('/subjects', metaController.getSubjects);
router.get('/resource-types', metaController.getResourceTypes);
router.get('/academic-years', metaController.getAcademicYears);

export default router;
