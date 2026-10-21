import React, { useState } from 'react';
import { CheckCircle2, CalendarClock } from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';
import { dateVal } from '../utils.js';
import { Form, Modal } from './ui.jsx';

export default function MaintenanceActions({ id, due, onDone, compact = false }) {
  const { canWrite } = useAuth();
  const toast = useToast();
  const [mode, setMode] = useState(null);

  if (!canWrite) {
    if (compact) return null;
    return (
      <span className="text-[11px] font-bold text-zinc-400 bg-gray-100/80 px-2.5 py-1 rounded-xl border border-gray-200 inline-flex items-center gap-1">
        <span>Scheduled</span>
      </span>
    );
  }
  const complete = mode === 'complete';

  return (
    <>
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          type="button"
          onClick={() => setMode('complete')}
          className={`inline-flex items-center gap-1 font-semibold rounded-xl transition-all shadow-sm ${
            compact
              ? 'px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              : 'px-3 py-1.5 text-xs bg-zinc-900 text-white hover:bg-black'
          }`}
          title="Mark inspection as completed"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Complete</span>
        </button>

        <button
          type="button"
          onClick={() => setMode('reschedule')}
          className={`inline-flex items-center gap-1 font-semibold rounded-xl transition-all ${
            compact
              ? 'px-2.5 py-1 text-xs bg-gray-100 text-zinc-700 hover:bg-gray-200'
              : 'px-3 py-1.5 text-xs bg-gray-100 text-zinc-700 hover:bg-gray-200 border border-gray-200'
          }`}
          title="Reschedule to a new inspection date"
        >
          <CalendarClock className="w-3.5 h-3.5 text-zinc-500" />
          <span>Reschedule</span>
        </button>
      </div>

      {mode && (
        <Modal
          title={complete ? 'Complete Solar Maintenance' : 'Reschedule Inspection'}
          onClose={() => setMode(null)}
          maxWidth="max-w-lg"
        >
          <p className="text-xs text-zinc-500 mb-4">
            {complete
              ? 'Marking this inspection completed will log completion notes, archive this cycle, and automatically schedule the next periodic inspection.'
              : 'Specify the new inspection date. The system will update the maintenance calendar and recalculate upcoming reminders.'}
          </p>

          <Form
            onCancel={() => setMode(null)}
            submitLabel={complete ? 'Confirm Inspection Completed' : 'Save New Inspection Date'}
            initial={{ dueDate: dateVal(due) }}
            fields={
              complete
                ? [
                    {
                      name: 'notes',
                      label: 'Technician Inspection Notes',
                      type: 'textarea',
                      placeholder: 'e.g. Cleaned 24x panels, checked inverter firmware, torqued MC4 terminals, tested battery state of charge (98%).',
                      full: true,
                    },
                  ]
                : [
                    {
                      name: 'dueDate',
                      label: 'New Inspection Date',
                      type: 'date',
                      required: true,
                      full: true,
                    },
                    {
                      name: 'reason',
                      label: 'Rescheduling Reason (optional)',
                      placeholder: 'e.g. Customer requested weekend appointment',
                      full: true,
                    },
                  ]
            }
            onSubmit={async (v) => {
              await api.patch(
                `/maintenance/${id}/${mode}`,
                complete ? { notes: v.notes || '' } : { dueDate: v.dueDate }
              );
              toast(
                complete
                  ? 'Inspection completed and next cycle generated!'
                  : 'Maintenance inspection rescheduled successfully!'
              );
              setMode(null);
              onDone();
            }}
          />
        </Modal>
      )}
    </>
  );
}
