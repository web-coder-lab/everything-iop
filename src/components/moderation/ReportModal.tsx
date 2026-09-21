import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { AlertTriangle, ShieldCheck, X } from 'lucide-react';
import type { ReportReason } from '../../types';

const REPORT_REASONS: ReportReason[] = [
  'Spam',
  'Scam',
  'Harassment',
  'Impersonation',
  'Violence',
  'Hate',
  'Inappropriate content',
  'Other',
];

export const ReportModal: React.FC = () => {
  const { reportTarget, closeReportModal, addToast, currentUser } = useAppStore();
  const [selectedReason, setSelectedReason] = useState<ReportReason>('Spam');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!reportTarget) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Local frontend mode: queue the report payload for the future Trust & Safety backend.
      const queue = JSON.parse(localStorage.getItem('everything_report_queue') || '[]');
      queue.push({ targetType: reportTarget.type, targetId: reportTarget.id, targetPreview: reportTarget.title || `Report on ${reportTarget.type}`, reason: selectedReason, details, reporterId: currentUser?.id || 'anonymous_usr', createdAt: new Date().toISOString() });
      localStorage.setItem('everything_report_queue', JSON.stringify(queue));
      addToast('Report submitted confidentially to Trust & Safety.', 'success');
      closeReportModal();
    } catch {
      addToast('Failed to submit report. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="report-content-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold text-base text-stone-900 dark:text-white">
              Report {reportTarget.type.charAt(0).toUpperCase() + reportTarget.type.slice(1)}
            </h3>
          </div>
          <button
            onClick={closeReportModal}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-500 dark:text-stone-400 mt-3 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          Your identity is 100% confidential and never revealed to the reported account.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2">
              Reason for report
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`px-3 py-2 text-xs rounded-xl font-medium border text-left transition ${
                    selectedReason === reason
                      ? 'border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-semibold'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Additional Details (Optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide context for our moderators..."
              rows={3}
              className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/50 p-3 text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-700 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={closeReportModal}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
