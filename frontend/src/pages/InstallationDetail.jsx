import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Sun,
  Zap,
  Battery,
  Cpu,
  Cable,
  Shield,
  Layers,
  MapPin,
  Calendar,
  Wrench,
  Clock,
  ShieldCheck,
  Edit2,
  Trash2,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';
import { Async, Confirm, Form, Modal, Tag, COMPONENT_ICONS } from '../components/ui.jsx';
import { InstallationFormModal } from '../components/forms.jsx';
import MaintenanceActions from '../components/MaintenanceActions.jsx';
import { fmt, label, timeText, useFetch } from '../utils.js';

export default function InstallationDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const { canWrite, isAdmin } = useAuth();
  const res = useFetch('/installations/' + id);
  const [modal, setModal] = useState(null);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => nav('/installations')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Installations</span>
        </button>
      </div>

      <Async res={res}>
        {({ installation: i, maintenance = [] }) => (
          <>
            {/* System Hero Banner (Pastel Warm Yellow) */}
            <div className="bg-[#FDE896] rounded-[32px] p-6 sm:p-8 relative overflow-hidden shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs font-extrabold px-3 py-1 bg-black/10 rounded-full text-zinc-900">
                      {i.code}
                    </span>
                    <Tag s={i.status} />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                    {i.capacityKw} kW Solar Installation
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-800 font-semibold mt-1">
                    Customer:{' '}
                    <Link
                      to={'/customers/' + (i.customer?._id || '')}
                      className="underline hover:text-black font-extrabold"
                    >
                      {i.customer?.name}
                    </Link>
                  </p>
                </div>

                {canWrite ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setModal('edit')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/80 hover:bg-white text-zinc-900 rounded-2xl text-xs font-bold transition-all shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit System</span>
                    </button>
                    <button
                      onClick={() => setModal('add')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-2xl text-xs font-bold transition-all shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule Inspection</span>
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setModal('del')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-2xl text-xs font-bold transition-colors"
                        title="Delete system"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-xs font-bold text-zinc-700 bg-white/80 px-3.5 py-1.5 rounded-2xl border border-black/10 inline-flex items-center gap-1.5 shadow-2xs">
                    <Eye className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Viewer Mode (Read-Only)</span>
                  </span>
                )}
              </div>

              {/* System Specs Metadata Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-black/10 text-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950/70">
                    Site Location
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-900" />
                    <span>{i.location}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950/70">
                    Installation Date
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-900" />
                    <span>{fmt(i.installationDate)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950/70">
                    Warranty Duration
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 mt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-900" />
                    <span>{i.warrantyMonths} Months</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950/70">
                    Maintenance Cycle
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 mt-1">
                    <Clock className="w-3.5 h-3.5 text-amber-900" />
                    <span>Every {i.intervalMonths} Months</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Component Tracking Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                    Component Tracking & Hardware Specs
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">
                    Installed equipment registered for {i.code}
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full">
                  {i.components?.length || 0} Components
                </span>
              </div>

              {(!i.components || i.components.length === 0) ? (
                <div className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-100">
                  <p className="text-xs font-bold text-zinc-600">No components recorded yet.</p>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Click 'Edit System' to record panels, batteries, inverters, cables, and protection devices.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                  {i.components.map((comp, idx) => {
                    const Icon = COMPONENT_ICONS[comp.type] || Zap;
                    return (
                      <div
                        key={idx}
                        className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center">
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs font-extrabold px-2 py-0.5 bg-zinc-900 text-white rounded-lg">
                              Qty: {comp.quantity || 1}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                            {label(comp.type)}
                          </span>
                          <h4 className="text-sm font-extrabold text-zinc-900 mt-0.5">
                            {comp.brand || 'Generic'}
                          </h4>
                          <p className="text-xs text-zinc-600 font-medium mt-0.5">
                            {comp.model || 'Standard Specification'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Maintenance Schedule Timeline Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                    Maintenance Inspection Schedule
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">
                    Periodic inspection history and upcoming scheduled maintenance dates
                  </p>
                </div>

                {canWrite && (
                  <button
                    onClick={() => setModal('add')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Inspection</span>
                  </button>
                )}
              </div>

              {maintenance.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-100">
                  <Clock className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-zinc-600">No maintenance scheduled.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {maintenance.map((m) => (
                    <div
                      key={m._id}
                      className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                            m.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.status === 'overdue'
                              ? 'bg-rose-100 text-rose-800'
                              : m.status === 'due today'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {m.status === 'completed' ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : m.status === 'overdue' ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-zinc-900">
                              {fmt(m.dueDate)}
                            </span>
                            <Tag s={m.status} />
                          </div>
                          <p className="text-xs text-zinc-500 font-medium mt-0.5">
                            {timeText(m)}
                            {m.notes && <span className="text-zinc-700 ml-2 italic">— "{m.notes}"</span>}
                          </p>
                        </div>
                      </div>

                      <div>
                        {m.state !== 'completed' && (
                          <MaintenanceActions
                            id={m._id}
                            due={m.dueDate}
                            onDone={res.reload}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modals */}
            {modal === 'edit' && (
              <InstallationFormModal
                values={i}
                onClose={() => setModal(null)}
                onSaved={res.reload}
              />
            )}

            {modal === 'add' && (
              <Modal title="Schedule Maintenance Inspection" onClose={() => setModal(null)}>
                <Form
                  onCancel={() => setModal(null)}
                  submitLabel="Add Inspection Date"
                  fields={[
                    {
                      name: 'dueDate',
                      label: 'Inspection Due Date',
                      type: 'date',
                      required: true,
                      full: true,
                    },
                    {
                      name: 'notes',
                      label: 'Inspection Instructions / Notes',
                      type: 'textarea',
                      placeholder: 'e.g. Inspect high-voltage DC switchgear, torque terminal lugs, verify inverter grounding.',
                      full: true,
                    },
                  ]}
                  onSubmit={async (v) => {
                    await api.post('/maintenance', { ...v, installation: id });
                    toast('Maintenance inspection scheduled');
                    setModal(null);
                    res.reload();
                  }}
                />
              </Modal>
            )}

            {modal === 'del' && (
              <Confirm
                title="Delete Solar Installation"
                message={`Are you sure you want to delete installation ${i.code}? All component tracking and periodic maintenance schedules will be permanently deleted.`}
                onClose={() => setModal(null)}
                onYes={async () => {
                  await api.del('/installations/' + id);
                  toast('Installation deleted');
                  nav('/installations');
                }}
              />
            )}
          </>
        )}
      </Async>
    </div>
  );
}
