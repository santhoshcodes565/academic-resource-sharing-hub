import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StudentLayout } from '../../components/layout/StudentLayout';
import { studentApi } from '../../services/studentApi';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Info,
  X
} from 'lucide-react';

export const StudentUploadPage = ({ darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  // Metadata dropdown state
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [resourceTypeId, setResourceTypeId] = useState('');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [year, setYear] = useState('1');
  const [semester, setSemester] = useState('Semester 1');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  // Load initial meta
  useEffect(() => {
    async function loadMeta() {
      const [deptList, typeList] = await Promise.all([
        studentApi.getDepartments(),
        studentApi.getResourceTypes()
      ]);
      setDepartments(deptList || []);
      setResourceTypes(typeList || []);
      if (deptList?.length > 0) setDepartmentId(deptList[0].id);
      if (typeList?.length > 0) setResourceTypeId(typeList[0].id);
    }
    loadMeta();
  }, []);

  // Update subjects on department change
  useEffect(() => {
    async function updateSubjects() {
      if (!departmentId) return;
      const subList = await studentApi.getSubjects(departmentId);
      setSubjects(subList || []);
      if (subList?.length > 0) {
        setSubjectId(subList[0].id);
      } else {
        setSubjectId('');
      }
    }
    updateSubjects();
  }, [departmentId]);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  };

  const handleSelectedFile = (selectedFile) => {
    setError(null);
    // Check format
    const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt', '.zip', '.epub'];
    const ext = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      setError(`Invalid format (${ext}). Supported formats: PDF, DOCX, PPTX, TXT, ZIP, EPUB.`);
      return;
    }

    // Check size (25MB)
    if (selectedFile.size > 25 * 1024 * 1024) {
      setError('File size exceeds maximum allowable limit of 25 MB.');
      return;
    }

    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) return setError('Please enter a descriptive title for your resource.');
    if (!departmentId) return setError('Please select an academic department.');
    if (!subjectId) return setError('Please select an academic subject or course.');
    if (!resourceTypeId) return setError('Please specify the resource type.');
    if (!academicYear) return setError('Please select the academic year.');
    if (!semester) return setError('Please specify the semester.');
    if (!file) return setError('Please upload an academic document.');

    setSubmitting(true);
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
      formData.append('file', file);

      const res = await studentApi.uploadResource(formData);
      setSuccessData(res.resource || { title });
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to submit resource contribution.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <StudentLayout darkMode={darkMode} setDarkMode={setDarkMode} title="Upload Resource">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Page Title */}
        <div className="pb-2 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Contribute Academic Resource
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Share verified lecture notes, exam guides, and solutions with fellow students.
          </p>
        </div>

        {/* Success Confirmation Modal / Card */}
        {successData ? (
          <div className="bg-white dark:bg-[#0F172A] border border-emerald-200 dark:border-emerald-800/80 rounded-3xl p-8 text-center space-y-5 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[11px] font-bold border border-amber-200 dark:border-amber-800">
                Status: PENDING REVIEW
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Resource Contribution Submitted!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you for contributing <span className="font-semibold">"{title}"</span>. In accordance with university academic standards, student submissions enter <span className="font-semibold text-amber-600 dark:text-amber-400">PENDING</span> status and will be verified by faculty before being published to the general student repository.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/student/contributions"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <span>Track in My Contributions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => {
                  setSuccessData(null);
                  setTitle('');
                  setDescription('');
                  setFile(null);
                }}
                className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Upload Another Resource
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Policy Notice */}
            <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Academic Integrity & Review Policy</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  All uploads must adhere to institutional honor codes. Student uploads are placed in <strong className="text-amber-600 dark:text-amber-400">PENDING</strong> review and are never automatically published.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Drag & Drop File Zone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Academic Document File <span className="text-red-500">*</span>
              </label>

              {!file ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    isDragging 
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30' 
                      : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Drag and drop your syllabus, exam, or notes here
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Supports PDF, DOCX, PPTX, TXT, ZIP, EPUB up to 25 MB
                  </p>

                  <label className="inline-block mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-semibold rounded-xl cursor-pointer transition-all">
                    <span>Browse Local Files</span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.epub"
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Resource Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Resource Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CS201 Midterm Solved Papers & Solutions"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Academic Department & Subject Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Academic Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Course / Subject <span className="text-red-500">*</span>
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {subjects.length === 0 ? (
                    <option value="">No subjects found for department</option>
                  ) : (
                    subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Type, Academic Year, Year, Semester */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Resource Type
                </label>
                <select
                  value={resourceTypeId}
                  onChange={(e) => setResourceTypeId(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {resourceTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Academic Year
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <option value="2025-2026">2025–2026</option>
                  <option value="2024-2025">2024–2025</option>
                  <option value="2023-2024">2023–2024</option>
                  <option value="2022-2023">2022–2023</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Study Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <option value="1">Year 1 (Freshman)</option>
                  <option value="2">Year 2 (Sophomore)</option>
                  <option value="3">Year 3 (Junior)</option>
                  <option value="4">Year 4 (Senior)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((sem) => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Description & Notes
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Include key topics covered, exam year, or professor references..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/student/resources')}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
              >
                {submitting ? 'Submitting to Review Queue...' : 'Submit Resource'}
              </button>
            </div>

          </form>
        )}

      </div>
    </StudentLayout>
  );
};
