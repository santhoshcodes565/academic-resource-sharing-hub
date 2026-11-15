import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Users, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Award,
  Lock,
  HeartHandshake,
  FileCheck2
} from 'lucide-react';

export const AboutView = ({ onNavigateCatalog, onOpenUpload }) => {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "Is sharing course materials permitted under university honor codes?",
      a: "Yes, under Fair Use and university Open Educational Resource (OER) policies, students are encouraged to share their own syntheses, lecture summaries, problem set breakdowns, and permissible past examination study guides. We strictly prohibit uploading unreleased live exam solutions or confidential faculty assessment materials."
    },
    {
      q: "How does the Peer & TA Verification process work?",
      a: "When a student uploads a study pack, it undergoes an automated structural and integrity scan before being routed to verified Teaching Assistants (TAs) or upperclassmen in that specific course. Materials matching official syllabus standards receive the green 'Verified' badge."
    },
    {
      q: "How does the Academic Reputation & Karma system work?",
      a: "Contributors earn Reputation points (+50 Rep for publishing verified materials, +5 Rep per peer upvote, +10 Rep for helpful discussion answers). Higher tiers unlock Verified Contributor status, special badges, and priority search placement."
    },
    {
      q: "Can course instructors or department chairs moderate materials?",
      a: "Absolutely. We provide dedicated faculty portals where professors and department staff can endorse resources, add recommended reading tags, or request immediate takedowns for proprietary content."
    }
  ];

  const pillars = [
    {
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60',
      title: 'Peer & TA Endorsed',
      desc: 'Every study pack and midterm review is vetted against syllabus rubrics by verified teaching assistants.'
    },
    {
      icon: Lock,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/60',
      title: 'Honor Code Compliant',
      desc: 'Built strictly around academic integrity principles, encouraging ethical learning over shortcut solutions.'
    },
    {
      icon: BookOpen,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60',
      title: '100% Open Access',
      desc: 'No paywalls, no forced subscriptions, and no predatory pay-to-read barriers for enrolled students.'
    },
    {
      icon: Users,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/60',
      title: 'Collegiate Network',
      desc: 'Connecting thousands of learners across top university departments to collaborate and excel together.'
    }
  ];

  const pipeline = [
    {
      step: '01',
      title: 'Student Submission',
      desc: 'Students upload structured lecture summaries, LaTeX formula sheets, or worked past midterms.'
    },
    {
      step: '02',
      title: 'Automated Integrity Check',
      desc: 'Files are scanned for formatting, readable typography, and potential copyright conflicts.'
    },
    {
      step: '03',
      title: 'TA & Peer Review',
      desc: 'Department TAs review solutions, grading criteria alignment, and award the official Verified Badge.'
    },
    {
      step: '04',
      title: 'Community Feedback',
      desc: 'Enrolled peers rate, upvote, and ask questions in threaded discussion reader canvas.'
    }
  ];

  return (
    <div className="py-6 sm:py-10 space-y-16 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
          <span>About Academic Resource Sharing Hub</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
          Democratizing Verified Collegiate Knowledge
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
          The Academic Resource Sharing Hub was founded to replace chaotic Google Drive folders and lost WhatsApp chat attachments with an organized, peer-verified, and honor-code compliant academic repository.
        </p>
      </div>

      {/* Core Value Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-blue-500/50 transition-colors"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {p.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {p.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* How Verification Works (The 4-Step Pipeline) */}
      <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
              Standard of Excellence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              The Peer Verification Pipeline
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              How we guarantee accuracy and syllabus alignment for every uploaded study guide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {pipeline.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="font-mono text-2xl font-extrabold text-blue-400">
                  {item.step}
                </span>
                <h4 className="font-bold text-sm text-white">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Collegiate Network Badges */}
      <div className="text-center space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Active Student Contributions Across Major Universities
        </h3>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
          <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            🌲 Stanford University
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            🏛️ MIT
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            🐻 UC Berkeley
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            🎓 Harvard University
          </span>
          <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            🐅 Princeton University
          </span>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500">
            Everything you need to know about academic integrity, verification, and sharing.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 dark:text-white focus:outline-none"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-blue-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Call to Action Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-500/20">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-extrabold">Ready to Boost Your Exam Prep?</h3>
          <p className="text-xs sm:text-sm text-blue-100 max-w-md">
            Browse thousands of peer-verified lecture packs or share your own notes to build academic reputation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateCatalog}
            className="px-5 py-2.5 rounded-xl bg-white text-blue-600 text-xs font-bold hover:bg-blue-50 transition-colors shadow-sm"
          >
            Explore Catalog
          </button>
          <button
            onClick={onOpenUpload}
            className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors border border-blue-400/40"
          >
            Contribute Notes
          </button>
        </div>
      </div>

    </div>
  );
};
