import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { DEPARTMENTS, RESOURCE_CATEGORIES } from '../../data/mockResources';

export const UploadModal = ({ isOpen, onClose, onAddResource }) => {
  if (!isOpen) return null;

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('cs');
  const [courseCode, setCourseCode] = useState('');
  const [professor, setProfessor] = useState('');
  const [semester, setSemester] = useState('Fall 2024');
  const [category, setCategory] = useState('notes');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [pledgeChecked, setPledgeChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile({
        name: droppedFile.name,
        size: (droppedFile.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: droppedFile.name.endsWith('.pdf') ? 'PDF' : 'DOCX'
      });
      if (!title) setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile({
        name: selected.name,
        size: (selected.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: selected.name.endsWith('.pdf') ? 'PDF' : 'DOCX'
      });
      if (!title) setTitle(selected.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pledgeChecked) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const deptObj = DEPARTMENTS.find(d => d.id === department);
      const newResource = {
        id: `res-${Date.now()}`,
        title: title || 'Untitled Course Resource',
        department: department,
        departmentName: deptObj ? deptObj.name : 'Computer Science',
        courseCode: courseCode.toUpperCase() || 'GEN-101',
        courseTitle: title,
        category: category,
        semester: semester,
        professor: professor || 'Faculty Staff',
        university: 'University Network',
        fileType: file ? file.type : 'PDF',
        fileSize: file ? file.size : '3.2 MB',
        pages: 18,
        downloads: 1,
        likes: 1,
        rating: 5.0,
        reviewsCount: 1,
        isVerified: true,
        isHighYield: category === 'exam',
        uploadedAt: 'Just now',
        author: {
          name: 'Alex Chen (You)',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'Contributor',
          karma: 4830
        },
        description: description || 'Student uploaded lecture notes & study resources.',
        tags: tags ? tags.split(',').map(t => t.trim()) : ['Lecture Notes', 'Study Guide'],
        previewPages: [
          {
            pageNumber: 1,
            title: title,
            content: description || 'Uploaded resource document preview.'
          }
        ],
        comments: []
      };

      onAddResource(newResource);
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-12 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              Contribute Academic Material
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Step {step} of 3: {step === 1 ? 'Upload File' : step === 2 ? 'Course Metadata' : 'Honor Code & Review'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div 
            className="bg-blue-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="p-6">
          {/* STEP 1: File Upload */}
          {step === 1 && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20' 
                    : file 
                    ? 'border-emerald-500/60 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:border-blue-400'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <UploadCloud className="w-7 h-7" />
                </div>

                {file ? (
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                      <Check className="w-3.5 h-3.5" />
                      <span>{file.name} ({file.size})</span>
                    </div>
                    <p className="text-xs text-slate-500">File attached and scanned for integrity.</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      Drag & Drop your document here
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Supports PDF, LaTeX (.tex), Markdown (.md), and Word (.docx) up to 25MB.
                    </p>
                    <label className="mt-4 inline-block px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors">
                      Browse Files
                      <input type="file" className="hidden" onChange={handleFileSelect} accept=".pdf,.docx,.zip,.tex" />
                    </label>
                  </div>
                )}
              </div>

              {/* Sample file fallback button if user does not drag */}
              {!file && (
                <button
                  onClick={() => setFile({ name: 'CS106B_Lecture_Notes_2024.pdf', size: '3.4 MB', type: 'PDF' })}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mx-auto"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Use sample academic document for quick test</span>
                </button>
              )}

              <div className="flex justify-end pt-2">
                <button
                  disabled={!file}
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <span>Continue to Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Course & Material Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Resource Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. CS 106B: Recursion & Backtracking Midterm Guide"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    placeholder="e.g. CS-106B"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Instructor / Professor
                  </label>
                  <input
                    type="text"
                    value={professor}
                    onChange={(e) => setProfessor(e.target.value)}
                    placeholder="e.g. Dr. Keith Schwarz"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Material Type
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="exam">Past Exam / Midterm</option>
                    <option value="notes">Lecture Notes</option>
                    <option value="cheatsheet">Cheatsheet & Formulas</option>
                    <option value="lab">Lab Report / Code</option>
                    <option value="assignment">Problem Set Solutions</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Summary / What is covered?
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key concepts, algorithms, theorems, or exam year covered in this resource..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!title}
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                >
                  <span>Review & Publish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Academic Honor Code & Affirmation */}
          {step === 3 && (
            <div className="space-y-5">
              
              {/* Summary Card Preview */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded">
                    {courseCode || 'CS-106B'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{title}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 line-clamp-2">
                  {description || 'Comprehensive student lecture notes and study guide.'}
                </p>
                <div className="flex items-center gap-3 text-slate-400 text-[11px] pt-1">
                  <span>File: {file?.name || 'Document.pdf'}</span>
                  <span>•</span>
                  <span>Size: {file?.size || '3.2 MB'}</span>
                </div>
              </div>

              {/* Honor Code Affirmation Box */}
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-xs space-y-3">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Academic Integrity Affirmation</span>
                </div>
                <p className="text-amber-700 dark:text-amber-400 leading-relaxed text-[11px]">
                  By submitting this material, you certify that this document represents your own study summaries, open course materials, or permissible past examination preparations. It does NOT contain live active exam solutions or infringe upon university copyright.
                </p>
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pledgeChecked}
                    onChange={(e) => setPledgeChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-amber-300"
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    I affirm this material complies with academic honor standards and Creative Commons Open-Access.
                  </span>
                </label>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={!pledgeChecked || isSubmitting}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Publishing Material...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Publish to Hub (+50 Rep)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
