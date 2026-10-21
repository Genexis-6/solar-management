import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  Edit2,
  Trash2,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';
import { Async, Confirm, Tag, Pagination } from '../components/ui.jsx';
import { CustomerFormModal } from '../components/forms.jsx';
import { fmt, useFetch } from '../utils.js';

const ITEMS_PER_PAGE = 6;

export default function Customers() {
  const { canWrite, isAdmin } = useAuth();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [dq, setDq] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDq(q);
      setPage(1);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const res = useFetch('/customers?q=' + encodeURIComponent(dq));
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);

  const handleTypeChange = (t) => {
    setTypeFilter(t);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            Customer Directory
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
            Manage solar clients, installation locations, and assigned technician teams
          </p>
        </div>

        {canWrite ? (
          <button
            onClick={() => setForm({})}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 text-white hover:bg-black font-semibold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Customer</span>
          </button>
        ) : (
          <span className="text-xs font-bold text-zinc-500 bg-gray-100 px-3.5 py-2 rounded-2xl border border-gray-200 self-start sm:self-auto inline-flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-zinc-400" />
            <span>Viewer Mode (Read-Only)</span>
          </span>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search by name, phone, email, or installation address..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all"
          />
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'residential', 'commercial', 'industrial'].map((t) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                typeFilter === t
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-gray-100 text-zinc-600 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Cards & Table View with Pagination */}
      <Async res={res}>
        {(list) => {
          const filtered =
            typeFilter === 'all'
              ? list
              : list.filter((c) => c.installationType === typeFilter);

          if (filtered.length === 0) {
            return (
              <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
                <Users className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-zinc-800">No customers found</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search criteria or register a new solar customer.
                </p>
              </div>
            );
          }

          const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

          return (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginated.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:-translate-y-0.5 duration-200"
                  >
                    <div>
                      {/* Top Row: Type & Actions */}
                      <div className="flex items-center justify-between mb-3">
                        <Tag s={c.installationType || 'residential'} />
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          {canWrite && (
                            <button
                              onClick={() => setForm(c)}
                              className="p-1.5 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors"
                              title="Edit customer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => setDel(c)}
                              className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Delete customer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Customer Name */}
                      <Link
                        to={'/customers/' + c._id}
                        className="text-lg font-extrabold text-zinc-900 group-hover:text-black tracking-tight flex items-center justify-between"
                      >
                        <span className="truncate">{c.name}</span>
                        <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
                      </Link>

                      {/* Details List */}
                      <div className="mt-3.5 space-y-1.5 text-xs text-zinc-600">
                        {c.phone && (
                          <div className="flex items-center gap-2 text-zinc-500">
                            <Phone className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{c.phone}</span>
                          </div>
                        )}
                        {c.email && (
                          <div className="flex items-center gap-2 text-zinc-500">
                            <Mail className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{c.email}</span>
                          </div>
                        )}
                        {c.address && (
                          <div className="flex items-center gap-2 text-zinc-500">
                            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="truncate">{c.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Footer Info */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-zinc-400" />
                        {fmt(c.installationDate || c.createdAt)}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 font-semibold">
                        <Wrench className="w-3 h-3 text-zinc-500" />
                        {c.technician ? c.technician.name : 'Unassigned'}
                      </span>
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

      {/* Customer Form Modal */}
      {form && (
        <CustomerFormModal
          values={form}
          onClose={() => setForm(null)}
          onSaved={res.reload}
        />
      )}

      {/* Delete Confirmation */}
      {del && (
        <Confirm
          title="Delete Customer Record"
          message={`Are you sure you want to delete "${del.name}"? This action will permanently remove all associated solar installations, components, and maintenance inspection schedules.`}
          onClose={() => setDel(null)}
          onYes={async () => {
            await api.del('/customers/' + del._id);
            toast('Customer and associated installations deleted');
            res.reload();
          }}
        />
      )}
    </div>
  );
}
