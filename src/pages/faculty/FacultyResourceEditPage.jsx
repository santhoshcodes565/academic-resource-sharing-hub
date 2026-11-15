import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FacultyLayout } from '../../components/layout/FacultyLayout';
import { facultyApi } from '../../services/facultyApi';
import { 
  Edit, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Building2, 
  Calendar, 
  ShieldCheck, 
  Save,
  Download
} from 'lucide-react';

export const FacultyResourceEditPage = ({ darkMode, setDarkMode }) => {
  const { id } = useParams();
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
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [downloadCount, setDownloadCount] = useState(0);

  // Metadata Lists
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load Metadata & Resource Details
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [depts, subjs, types, years, res] = await Promise.all([
          facultyApi.getDepartments(),
          facultyApi.getSubjects(),
          facultyApi.getResourceTypes(),
          facultyApi.getAcademicYears(),
          facultyApi.getResourceById(id)
        ]);

        setDepartments(depts);
        setSubjects(subjs);
        setResourceTypes(types);
        setAcademicYears(years);

        // Prepopulate form
        setTitle(res.title || '');
        setDescription(res.description || '');
        setDepartmentId(res.department_id || '');
        setYear(String(res.year || 1));
        setSemester(res.semester || 'Semester 1');
        setSubjectId(res.subject_id || '');
        setResourceTypeId(res.resource_type_id || '');
        setAcademicYear(res.academic_year || '2024-2025');
        setStatus(res.status || 'PUBLISHED');
        setStaffRemarks(res.staff_remarks || '');
        setFileName(res.file_name || 'document.pdf');
        setFileSize(res.file_size || '1.0 MB');
        setDownloadCount(res.download_count || 0);
      } catch (err) {
        console.error('Error fetching resource for editing:', err);
        setError(err.message || 'Failed to load resource details.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const availableSubjects = subjects.filter(s => s.department_id === departmentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await facultyApi.updateResource(id, {
        title: title.trim(),
        description: description.trim(),
        department_id: departmentId,
        subject_id: subjectId,
        resource_type_id: resourceTypeId,
        academic_year: academicYear,
        year: parseInt(year) || 1,
        semester,
        status,
        staff_remarks: staffRemarks.trim()
      });

      setSuccess(true);
      setTimeout(() => navigate('/faculty/resources'), 1200);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update resource metadata.');
      setSaving(false);
    }
  };

  return (
    <FacultyLayout darkMode={darkMode} setDarkMode={setDarkMode} title="Edit Resource">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
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
                Edit Resource Metadata
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Update course taxonomy, publishing status, and institutional faculty notes.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400">
            ID: {id}
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Metadata updated successfully. Redirecting to repository...</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-400">
            Loading resource specifications...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            
            {/* File Info Bar */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-indigo-500" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{fileName}</p>
                  <p className="text-[11px] text-slate-400">{fileSize} • {downloadCount} downloads</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                Attached Document
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Resource Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description / Syllabus Summary
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Department, Course & Taxonomy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Department
                </label>
                <select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject Course
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  {availableSubjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Resource Type
                </label>
                <select
                  value={resourceTypeId}
                  onChange={(e) => setResourceTypeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  {resourceTypes.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Year
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  {academicYears.map(y => (
                    <option key={y.id} value={y.name}>{y.name} {y.is_active ? '(Active Term)' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Semester
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

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Year Level
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </div>

            </div>

            {/* Moderation Status & Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Publication Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="PUBLISHED">PUBLISHED (Live on Student Portal)</option>
                  <option value="PENDING">PENDING (Awaiting Review)</option>
                  <option value="UNDER REVIEW">UNDER REVIEW (Faculty Moderation)</option>
                  <option value="ARCHIVED">ARCHIVED (Preserved, Hidden from Search)</option>
                  <option value="REJECTED">REJECTED (Academic Non-Compliance)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Faculty Endorsement Remarks
                </label>
                <input
                  type="text"
                  value={staffRemarks}
                  onChange={(e) => setStaffRemarks(e.target.value)}
                  placeholder="e.g. Verified syllabus alignment for current semester"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

            </div>

            {/* Submission Actions */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <Link
                to="/faculty/resources"
                className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Changes...' : 'Save Resource Metadata'}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </FacultyLayout>
  );
};
