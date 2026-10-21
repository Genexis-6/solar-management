import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Zap,
  ArrowUpRight,
} from 'lucide-react';
import { Async, Tag, Pagination } from '../components/ui.jsx';
import MaintenanceActions from '../components/MaintenanceActions.jsx';
import { fmt, timeText, useFetch } from '../utils.js';

const FILTERS = [
  { key: 'all', label: 'All Inspections' },
  { key: 'due today', label: 'Due Today' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'rescheduled', label: 'Rescheduled' },
  { key: 'completed', label: 'Completed' },
];

const ITEMS_PER_PAGE = 8;

export default function Maintenance() {
  const [f, setF] = useState('all');
  const [q, setQ] = useState('');
  const [tick, setTick] = useState(0);
  const [page, setPage] = useState(1);

  const res = useFetch(
    '/maintenance' + (f === 'all' ? '' : '?status=' + encodeURIComponent(f)),
    tick
  );

  const handleFilterChange = (key) => {
    setF(key);
    setPage(1);
  };

  const handleSearchChange = (val) => {
    setQ(val);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
          Maintenance Operations
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
          Core inspection schedule: automatic interval calculations, status tracking, and technician sign-offs
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search by customer, system code, or technician notes..."
            value={q}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {FILTERS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange(tab.key)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                f === tab.key
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-gray-100 text-zinc-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Maintenance Items List with Pagination */}
      <Async res={res}>
        {(list) => {
          const filtered = list.filter((m) => {
            if (!q) return true;
            const search = q.toLowerCase();
            const cust = m.installation?.customer?.name?.toLowerCase() || '';
            const code = m.installation?.code?.toLowerCase() || '';
            const notes = m.notes?.toLowerCase() || '';
            return cust.includes(search) || code.includes(search) || notes.includes(search);
          });

          if (filtered.length === 0) {
            return (
              <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
                <Clock className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-zinc-800">No maintenance records found</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  No maintenance inspections match your current filter criteria.
                </p>
              </div>
            );
          }

          const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

          return (
            <div className="space-y-4">
              <div className="space-y-3">
                {paginated.map((m) => {
                  const isOverdue = m.status === 'overdue';
                  const isDueToday = m.status === 'due today';
                  const isCompleted = m.status === 'completed';

                  return (
                    <div
                      key={m._id}
                      className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOverdue
                              ? 'bg-rose-100 text-rose-800'
                              : isDueToday
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : isOverdue ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : isDueToday ? (
                            <Zap className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-extrabold text-zinc-900 tracking-tight">
                              {m.installation?.customer?.name || 'Customer System'}
                            </h4>
                            <span className="text-xs text-zinc-400">•</span>
                            <Link
                              to={'/installations/' + m.installation?._id}
                              className="font-mono text-xs font-bold text-zinc-600 hover:text-black underline"
                            >
                              {m.installation?.code}
                            </Link>
                            <Tag s={m.status} />
                          </div>

                          <p className="text-xs text-zinc-500 font-medium mt-1">
                            Scheduled Due:{' '}
                            <span className="font-bold text-zinc-800">{fmt(m.dueDate)}</span>{' '}
                            <span className="font-semibold text-zinc-600">
                              ({timeText(m)})
                            </span>
                          </p>

                          {m.notes && (
                            <p className="text-xs text-zinc-700 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 mt-2 italic">
                              "{m.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-gray-100">
                        {m.state !== 'completed' ? (
                          <MaintenanceActions
                            id={m._id}
                            due={m.dueDate}
                            onDone={() => setTick((t) => t + 1)}
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Inspected {fmt(m.completedAt)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
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
    </div>
  );
}
