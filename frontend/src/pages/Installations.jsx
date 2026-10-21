import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Plus,
  Search,
  Zap,
  MapPin,
  Calendar,
  Wrench,
  ShieldCheck,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { useAuth } from '../auth.jsx';
import { Async, Tag, Pagination } from '../components/ui.jsx';
import { InstallationFormModal } from '../components/forms.jsx';
import { fmt, useFetch } from '../utils.js';

const ITEMS_PER_PAGE = 6;

export default function Installations() {
  const { canWrite } = useAuth();
  const [form, setForm] = useState(false);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const res = useFetch('/installations');

  const handleStatusChange = (s) => {
    setStatusFilter(s);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setQ(val);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            Solar Installations
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
            Photovoltaic systems, capacity ratings, warranties, and component tracking
          </p>
        </div>

        {canWrite ? (
          <button
            onClick={() => setForm(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 text-white hover:bg-black font-semibold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Installation</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-zinc-500 bg-gray-100 px-3.5 py-2 rounded-2xl border border-gray-200 self-start sm:self-auto inline-flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            <span>Viewer Mode (Read-Only)</span>
          </span>
        )}
      </div>

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search by code, customer, or location..."
            value={q}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'active', 'planned', 'faulty', 'decommissioned'].map((s) => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-gray-100 text-zinc-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Installations Grid with Pagination */}
      <Async res={res}>
        {(list) => {
          const filtered = list.filter((inst) => {
            const matchesQuery =
              !q ||
              inst.code?.toLowerCase().includes(q.toLowerCase()) ||
              inst.customer?.name?.toLowerCase().includes(q.toLowerCase()) ||
              inst.location?.toLowerCase().includes(q.toLowerCase());
            const matchesStatus =
              statusFilter === 'all' || inst.status === statusFilter;
            return matchesQuery && matchesStatus;
          });

          if (filtered.length === 0) {
            return (
              <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
                <Sun className="w-10 h-10 text-amber-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-zinc-800">No installations found</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search criteria or register a new solar installation.
                </p>
              </div>
            );
          }

          const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginated.map((i) => (
                  <div
                    key={i._id}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-0.5 duration-200"
                  >
                    <div>
                      {/* Top Row: Code & Status */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 bg-zinc-100 rounded-xl text-zinc-700">
                          {i.code}
                        </span>
                        <Tag s={i.status} />
                      </div>

                      {/* Capacity & Customer */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#FEF0C7] text-amber-800 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                            {i.capacityKw} kW System
                          </h3>
                          <p className="text-xs font-bold text-zinc-500 truncate mt-0.5">
                            {i.customer?.name || 'Unknown Customer'}
                          </p>
                        </div>
                      </div>

                      {/* Meta info */}
                      <div className="space-y-1.5 text-xs text-zinc-600">
                        <div className="flex items-center gap-2 text-zinc-500">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{i.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>Commissioned {fmt(i.installationDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500">
                          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{i.warrantyMonths} Months Warranty</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer & Link */}
                    <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-zinc-400">
                        Tech: {i.technician?.name || 'Unassigned'}
                      </span>
                      <Link
                        to={'/installations/' + i._id}
                        className="inline-flex items-center gap-1 text-xs font-extrabold text-zinc-900 hover:text-amber-600 group-hover:translate-x-0.5 transition-all"
                      >
                        <span>View System & Components</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Pagination */}
              <Pagination
                totalItems={filtered.length}
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={page}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          );
        }}
      </Async>

      {/* New Installation Modal */}
      {form && (
        <InstallationFormModal
          onClose={() => setForm(false)}
          onSaved={res.reload}
        />
      )}
    </div>
  );
}
