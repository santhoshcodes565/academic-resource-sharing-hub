import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FacultyLayout } from '../../components/layout/FacultyLayout';
import { facultyApi } from '../../services/facultyApi';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  BookMarked, 
  Calendar, 
  Tags, 
  ShieldCheck, 
  ArrowLeft,
  X,
  File
} from 'lucide-react';

export const FacultyResourceUploadPage = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [year, setYear] = useState('1');
  const [semester, setSemester] = useState('Semester 1');
  const [subjectId, setSubjectId] = useState('');
  const [resourceTypeId, setResourceTypeId] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [status, setStatus] = useState('PUBLISHED');
  const [staffRemarks, setStaffRemarks] = useState('');
  const [file, setFile] = useState(null);

  // Metadata Lists
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Allowed file extensions
  const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.zip', '.epub'];

  // Load Metadata
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [depts, subjs, types, years] = await Promise.all([
          facultyApi.getDepartments(),
          facultyApi.getSubjects(),
          facultyApi.getResourceTypes(),
          facultyApi.getAcademicYears()
        ]);
        setDepartments(depts);
        setSubjects(subjs);
        setResourceTypes(types);
        setAcademicYears(years);

        if (depts.length > 0) setDepartmentId(depts[0].id);
        if (types.length > 0) setResourceTypeId(types[0].id);
        const activeY = years.find(y => y.is_active === 1 || y.is_active === true);
        if (activeY) setAcademicYear(activeY.name);
      } catch (err) {
        console.error('Failed to load upload metadata:', err);
      }
    };
    loadMeta();
  }, []);

  // Filter subjects by selected department
  const availableSubjects = subjects.filter(s => s.department_id === departmentId);

  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.some(s => s.id === subjectId)) {
      setSubjectId(availableSubjects[0].id);
    }
  }, [departmentId, availableSubjects]);

  // Handle Drag & Drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    const name = selectedFile.name.toLowerCase();
    const isValidExt = ALLOWED_EXTENSIONS.some(ext => name.endsWith(ext));
    if (!isValidExt) {
      setError(`Invalid format. Allowed formats: ${ALLOWED_EXTENSIONS.join(', ')}`);
      return;
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      setError('File size exceeds institutional limit (25 MB).');
      return;
    }
    setError(null);
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Resource title is required.');
      return;
    }
    if (!departmentId) {
      setError('Department selection is required.');
      return;
    }
    if (!subjectId) {
      setError('Subject selection is required.');
      return;
    }
    if (!resourceTypeId) {
      setError('Resource type selection is required.');
      return;
    }
    if (!academicYear) {
      setError('Academic year is required.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('department_id', departmentId);
      formData.append('subject_id', subjectId);
      formData.append('resource_type_id', resourceTypeId);
      formData.append('academic_year', academicYear);
      formData.append('year', year);
      formData.append('semester', semester);
      formData.append('status', status);
      formData.append('staff_remarks', staffRemarks.trim() || 'Institutional faculty upload — Curricularly approved');

      if (file) {
        formData.append('file', file);
      }

      await facultyApi.uploadResource(formData);
      navigate('/faculty/resources');
    } catch (err) {
      console.error('Resource upload error:', err);
      setError(err.message || 'Failed to publish faculty resource.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FacultyLayout darkMode={darkMode} setDarkMode={setDarkMode} title="Upload Resource">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back navigation & Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <Link
              to="/faculty/resources"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Faculty Resource Publishing
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload and publish verified academic lecture materials, previous exams, and curriculum guides.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
            <ShieldCheck className="w-4 h-4" />
            <span>Curricular Authority</span>
          </div>
        </div>

        {/* Institutional Authorization Notice */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/50 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1">
          <div className="flex items-center gap-2 text-indigo-800 dark:text-indigo-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Automatic Institutional Publication Rule</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
            Resources uploaded by authenticated faculty members bypass peer-review staging and are immediately published with verified academic integrity endorsement.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
          
          {/* Section 1: Resource Metadata */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Material Information</span>
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Resource Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., CS201: Comprehensive Trees, Graphs & Backtracking Midterm Prep"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Curriculum Summary & Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Summarize course topics covered, exam years referenced, or laboratory requirements..."
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Section 2: Academic Classification */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span>Academic Classification</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Department */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Year Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="1">1st Year (Freshman)</option>
                  <option value="2">2nd Year (Sophomore)</option>
                  <option value="3">3rd Year (Junior)</option>
                  <option value="4">4th Year (Senior)</option>
                </select>
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Semester <span className="text-rose-500">*</span>
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                  <option value="Semester 7">Semester 7</option>
                  <option value="Semester 8">Semester 8</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Course Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  {availableSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              {/* Resource Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Resource Type <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={resourceTypeId}
                  onChange={(e) => setResourceTypeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  {resourceTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              {/* Academic Year Term */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Year <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  {academicYears.map(y => (
                    <option key={y.id} value={y.name}>{y.name} {y.is_active ? '(Active Term)' : ''}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Section 3: File Upload Dropzone */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-indigo-500" />
              <span>Document File Upload</span>
            </h3>

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-800/20'
              }`}
            >
              {file ? (
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <File className="w-5 h-5 text-indigo-500 shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto" />
                  <div className="text-xs text-slate-600 dark:text-slate-300">
                    <label htmlFor="file-upload" className="font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline">
                      Click to browse
                    </label>
                    <span> or drag and drop your syllabus file here</span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP up to 25 MB
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.epub"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Moderation & Remarks */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Publishing Governance</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Initial Publishing Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="PUBLISHED">Published (Immediately available to students)</option>
                  <option value="UNDER REVIEW">Under Review (Staged for department review)</option>
                  <option value="PENDING">Pending Approval</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Faculty Remarks / Endorsement Note
                </label>
                <input
                  type="text"
                  value={staffRemarks}
                  onChange={(e) => setStaffRemarks(e.target.value)}
                  placeholder="e.g. Official department lecture notes for 2024-2025"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Submission Bar */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Link
              to="/faculty/resources"
              className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{loading ? 'Publishing Material...' : 'Publish Academic Resource'}</span>
            </button>
          </div>

        </form>

      </div>
    </FacultyLayout>
  );
};
