import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  AlertTriangle,
  Clock,
  Zap,
  Calendar,
  MapPin,
  ArrowUpRight,
  Mail,
} from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';
import { Async, Tag, Pagination } from '../components/ui.jsx';
import { fmt, useFetch } from '../utils.js';

export default function Notifications() {
  const { canWrite } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState('reminders');
  const [remPage, setRemPage] = useState(1);
  const [logPage, setLogPage] = useState(1);

  const notesRes = useFetch('/notifications');
  const remindersRes = useFetch('/reminders?days=30');

  const refresh = () => {
    window.dispatchEvent(new Event('notes'));
    notesRes.reload();
    remindersRes.reload();
  };

  const checkRemindersNow = async () => {
    setBusy(true);
    try {
      const r = await api.post('/notifications/run', {});
      toast(`Reminders engine checked: ${r.created} new alerts generated`);
      refresh();
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusy(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read');
      toast('All notifications marked as read');
      refresh();
    } catch (e) {
      toast(e.message, true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            Reminders & Notifications
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
            Automated alerts triggered at 30 days, 7 days, 1 day, due date, and when overdue
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {canWrite && (
            <button
              onClick={checkRemindersNow}
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${busy ? 'animate-spin' : ''}`} />
              <span>Check For Reminders Now</span>
            </button>
          )}

          <button
            onClick={markAllRead}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-900 hover:bg-black text-white font-semibold text-xs sm:text-sm shadow-md transition-all"
          >
            <CheckCheck className="w-4 h-4 text-emerald-400" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        <button
          onClick={() => setActiveTab('reminders')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'reminders'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-500 hover:bg-zinc-100'
          }`}
        >
          Approaching Maintenance Reminders
        </button>
        <button
          onClick={() => setActiveTab('log')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'log'
              ? 'bg-zinc-900 text-white shadow-sm'
              : 'text-zinc-500 hover:bg-zinc-100'
          }`}
        >
          Notification History Log
        </button>
      </div>

      {/* Tab 1: Approaching Maintenance Reminders with Pagination */}
      {activeTab === 'reminders' && (
        <Async res={remindersRes}>
          {(list) => {
            if (list.length === 0) {
              return (
                <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
                  <Clock className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-zinc-800">
                    No approaching maintenance
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                    All solar installations are in good standing with no inspections due in the next 30 days.
                  </p>
                </div>
              );
            }

            const paginated = list.slice((remPage - 1) * 6, remPage * 6);

            return (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginated.map((r) => {
                    const isOverdue = r.daysRemaining < 0;
                    const isDueToday = r.daysRemaining === 0;

                    return (
                      <div
                        key={r.id}
                        className={`rounded-3xl p-5 border transition-all shadow-sm ${
                          isOverdue
                            ? 'bg-[#FDE2E4] border-rose-200'
                            : isDueToday
                            ? 'bg-[#FEF0C7] border-amber-200'
                            : 'bg-[#DDF3ED] border-emerald-200'
                        }`}
                      >
                        {/* Top Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-black/10">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-zinc-900">
                              Maintenance Reminder
                            </span>
                          </div>
                          <Tag s={r.status} />
                        </div>

                        {/* Structured Details matching user prompt format */}
                        <div className="py-3.5 space-y-2 text-xs">
                          <div className="flex items-baseline justify-between">
                            <span className="text-zinc-600 font-semibold">Customer:</span>
                            <span className="font-extrabold text-zinc-900 text-right">{r.customer}</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-zinc-600 font-semibold">System:</span>
                            <span className="font-bold text-zinc-900 text-right">{r.system}</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-zinc-600 font-semibold">Location:</span>
                            <span className="font-bold text-zinc-900 text-right">{r.location}</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-zinc-600 font-semibold">Maintenance Date:</span>
                            <span className="font-extrabold text-zinc-900 text-right">{fmt(r.maintenanceDate)}</span>
                          </div>
                        </div>

                        {/* Prominent Remaining Time Tag & Actions */}
                        <div className="pt-3 border-t border-black/10 flex items-center justify-between">
                          <span className="font-extrabold text-xs px-3 py-1.5 rounded-xl bg-white shadow-2xs text-zinc-900">
                            {r.message}
                          </span>

                          <div className="flex items-center gap-2">
                            <Link
                              to="/mailing"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-zinc-800 text-xs font-bold hover:bg-zinc-50 shadow-2xs transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5 text-zinc-600" />
                              <span>Email Client</span>
                            </Link>

                            <Link
                              to={'/installations/' + r.installationId}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-black shadow-sm transition-colors"
                            >
                              <span>View System</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Pagination
                  totalItems={list.length}
                  itemsPerPage={6}
                  currentPage={remPage}
                  onPageChange={(p) => setRemPage(p)}
                />
              </div>
            );
          }}
        </Async>
      )}

      {/* Tab 2: Notification History Log with Pagination */}
      {activeTab === 'log' && (
        <Async res={notesRes}>
          {(d) => {
            if (d.items.length === 0) {
              return (
                <div className="bg-gray-50 rounded-3xl p-12 text-center border border-gray-100">
                  <p className="text-xs font-bold text-zinc-600">No notifications in history.</p>
                </div>
              );
            }

            const paginated = d.items.slice((logPage - 1) * 10, logPage * 10);

            return (
              <div className="space-y-4">
                <div className="space-y-2.5">
                  {paginated.map((n) => (
                    <div
                      key={n._id}
                      className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                        n.read
                          ? 'bg-white border-gray-100 text-zinc-700'
                          : 'bg-amber-50/70 border-amber-200 text-zinc-900 shadow-2xs font-semibold'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            n.level === 'danger'
                              ? 'bg-rose-100 text-rose-700'
                              : n.level === 'warning'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm">{n.message}</p>
                          <span className="text-[11px] text-zinc-400 font-normal mt-0.5 block">
                            {fmt(n.createdAt)}
                          </span>
                        </div>
                      </div>

                      {!n.read && (
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full shrink-0 mt-1.5" />
                      )}
                    </div>
                  ))}
                </div>

                <Pagination
                  totalItems={d.items.length}
                  itemsPerPage={10}
                  currentPage={logPage}
                  onPageChange={(p) => setLogPage(p)}
                />
              </div>
            );
          }}
        </Async>
      )}
    </div>
  );
}
