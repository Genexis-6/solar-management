import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  Sun,
  Plus,
  Edit2,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Eye,
} from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { Async, Tag } from '../components/ui.jsx';
import { CustomerFormModal, InstallationFormModal } from '../components/forms.jsx';
import { fmt, useFetch } from '../utils.js';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const res = useFetch('/customers/' + id);
  const [modal, setModal] = useState(null);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/customers')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Customers</span>
        </button>
      </div>

      <Async res={res}>
        {({ customer: c, installations = [] }) => (
          <>
            {/* Customer Hero Card */}
            <div className="bg-[#D5EBE5] rounded-[32px] p-6 sm:p-8 relative overflow-hidden shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag s={c.installationType || 'residential'} />
                    <span className="text-xs font-bold text-emerald-900/80">
                      Customer Since {fmt(c.installationDate || c.createdAt)}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                    {c.name}
                  </h2>
                </div>

                {canWrite ? (
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setModal('edit')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/80 hover:bg-white text-zinc-800 rounded-2xl text-xs font-bold transition-all shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Customer</span>
                    </button>
                    <button
                      onClick={() => setModal('install')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-black text-white rounded-2xl text-xs font-bold transition-all shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Solar Installation</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-emerald-950 bg-white/80 px-3.5 py-1.5 rounded-2xl border border-emerald-900/10 inline-flex items-center gap-1.5 shadow-2xs">
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Viewer Mode (Read-Only)</span>
                  </span>
                )}
              </div>

              {/* Contact and Metadata Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-emerald-900/10 text-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/70">
                    Phone Contact
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 mt-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{c.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/70">
                    Email Address
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 mt-1">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{c.email || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/70">
                    Site Location
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{c.address || 'Not specified'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/70">
                    Assigned Technician
                  </span>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-900 mt-1">
                    <Wrench className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{c.technician ? c.technician.name : 'Unassigned'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Installations Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                    Solar Installations ({installations.length})
                  </h3>
                  <p className="text-xs text-zinc-400 font-medium mt-0.5">
                    Photovoltaic systems deployed for {c.name}
                  </p>
                </div>

                {canWrite && installations.length > 0 && (
                  <button
                    onClick={() => setModal('install')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Installation</span>
                  </button>
                )}
              </div>

              {installations.length === 0 ? (
                <div className="bg-gray-50 rounded-3xl p-10 text-center border border-gray-100">
                  <Sun className="w-10 h-10 text-amber-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-zinc-800">No solar installations yet</p>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    Record the first solar installation for this customer to begin periodic maintenance tracking.
                  </p>
                  {canWrite && (
                    <button
                      onClick={() => setModal('install')}
                      className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      Create First Installation
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {installations.map((inst) => (
                    <div
                      key={inst._id}
                      className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-mono text-xs font-bold text-zinc-400">
                            {inst.code}
                          </span>
                          <Tag s={inst.status} />
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-9 h-9 rounded-2xl bg-[#FEF0C7] text-amber-800 flex items-center justify-center font-extrabold text-xs">
                            <Zap className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-extrabold text-zinc-900">
                              {inst.capacityKw} kW Solar Array
                            </h4>
                            <span className="text-xs text-zinc-500 font-medium">
                              {inst.location}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100 text-xs">
                          <div>
                            <span className="text-[11px] text-zinc-400">Commissioned</span>
                            <p className="font-bold text-zinc-800">{fmt(inst.installationDate)}</p>
                          </div>
                          <div>
                            <span className="text-[11px] text-zinc-400">Warranty</span>
                            <p className="font-bold text-zinc-800">{inst.warrantyMonths} Months</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-zinc-500 font-medium">
                          {inst.components?.length || 0} hardware components
                        </span>
                        <Link
                          to={'/installations/' + inst._id}
                          className="inline-flex items-center gap-1 text-xs font-bold text-zinc-900 hover:text-amber-600 transition-colors"
                        >
                          <span>Manage System</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modals */}
            {modal === 'edit' && (
              <CustomerFormModal
                values={c}
                onClose={() => setModal(null)}
                onSaved={res.reload}
              />
            )}
            {modal === 'install' && (
              <InstallationFormModal
                customerId={id}
                onClose={() => setModal(null)}
                onSaved={res.reload}
              />
            )}
          </>
        )}
      </Async>
    </div>
  );
}
