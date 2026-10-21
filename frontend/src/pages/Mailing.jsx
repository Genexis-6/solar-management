import React, { useState } from 'react';
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Settings,
  History,
  FileText,
  User,
  Shield,
  Sun,
  Zap,
  MapPin,
  Calendar,
  AlertTriangle,
  Lock,
} from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';
import { Async, Tag, Pagination } from '../components/ui.jsx';
import { fmt, useFetch } from '../utils.js';

export default function Mailing() {
  const { canWrite, isAdmin } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('composer'); // 'composer', 'history', 'config'
  const [selectedReminderId, setSelectedReminderId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [tick, setTick] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);

  // Future SMTP settings state
  const [smtpConfig, setSmtpConfig] = useState({
    provider: 'resend',
    apiKey: 're_live_••••••••••••••••••••••••',
    fromEmail: 'operations@solarguard.energy',
    fromName: 'SolarGuard Maintenance Dispatch',
    replyTo: 'support@solarguard.energy',
  });

  const remindersRes = useFetch('/reminders?days=60', tick);
  const historyRes = useFetch('/mail/history', tick);
  const customersRes = useFetch('/customers');

  const sendEmail = async (reminder, customerEmail) => {
    if (!canWrite) return;
    setBusy(true);
    try {
      const subject = `[Scheduled Maintenance Notice] ${reminder.customer} — ${reminder.system}`;
      await api.post('/mail/send', {
        recipient: customerEmail || `${reminder.customer.toLowerCase().replace(/\W+/g, '.')}@example.com`,
        customer: reminder.customer,
        subject,
        message: `Maintenance scheduled for ${fmt(reminder.maintenanceDate)} (${reminder.message}).`,
      });
      toast(`Reminder email successfully dispatched to ${reminder.customer}!`);
      setTick((t) => t + 1);
    } catch (e) {
      toast(e.message, true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            Mailing Center & Client Dispatch
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-0.5">
            Automated customer notification flow, live email previewer, and mailer configuration
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setTab('composer')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'composer' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Reminder Dispatch & Preview</span>
          </button>
          <button
            onClick={() => setTab('history')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'history' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Dispatch Log</span>
          </button>
          <button
            onClick={() => setTab('config')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tab === 'config' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Mailer Config</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Dispatch & Preview */}
      {tab === 'composer' && (
        <Async res={remindersRes}>
          {(remindersList) => {
            const activeReminder =
              remindersList.find((r) => r.id === selectedReminderId) ||
              remindersList[0] ||
              null;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Panel: Approaching Reminders Queue */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">
                      Pending Client Notices ({remindersList.length})
                    </h3>
                    <span className="text-[11px] font-semibold text-zinc-400">
                      Select to preview email
                    </span>
                  </div>

                  {remindersList.length === 0 ? (
                    <div className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-100">
                      <Clock className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-zinc-700">No approaching reminders</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
                      {remindersList.map((r) => {
                        const isSelected = activeReminder && activeReminder.id === r.id;
                        const isOverdue = r.daysRemaining < 0;
                        const isDueToday = r.daysRemaining === 0;

                        return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedReminderId(r.id)}
                            className={`p-4 rounded-3xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-zinc-900 text-white border-zinc-900 shadow-md scale-[1.01]'
                                : 'bg-white hover:bg-gray-50 text-zinc-800 border-gray-100 shadow-2xs'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span
                                className={`text-xs font-extrabold truncate ${
                                  isSelected ? 'text-white' : 'text-zinc-900'
                                }`}
                              >
                                {r.customer}
                              </span>
                              <Tag s={r.status} />
                            </div>

                            <p
                              className={`text-xs truncate ${
                                isSelected ? 'text-zinc-300' : 'text-zinc-500'
                              }`}
                            >
                              {r.system} • {r.location}
                            </p>

                            <div className="mt-3 flex items-center justify-between text-[11px]">
                              <span
                                className={`font-semibold ${
                                  isSelected ? 'text-amber-300' : 'text-zinc-700'
                                }`}
                              >
                                {fmt(r.maintenanceDate)}
                              </span>
                              <span
                                className={`font-bold px-2 py-0.5 rounded-lg ${
                                  isSelected
                                    ? 'bg-zinc-800 text-white'
                                    : isOverdue
                                    ? 'bg-rose-100 text-rose-800'
                                    : isDueToday
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {r.message}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Panel: Live Branded HTML Email Preview */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-7 space-y-6">
                  {activeReminder ? (
                    <>
                      {/* Email Metadata Header */}
                      <div className="space-y-2 border-b border-gray-100 pb-4 text-xs">
                        <div className="flex items-center gap-2 text-zinc-500">
                          <span className="font-bold text-zinc-400 w-16">Subject:</span>
                          <span className="font-bold text-zinc-900">
                            [Action Required] Solar Maintenance Scheduled for {activeReminder.customer}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500">
                          <span className="font-bold text-zinc-400 w-16">From:</span>
                          <span>SolarGuard Dispatch &lt;{smtpConfig.fromEmail}&gt;</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500">
                          <span className="font-bold text-zinc-400 w-16">To:</span>
                          <span className="font-medium text-zinc-800">
                            {activeReminder.customer.toLowerCase().replace(/\W+/g, '.')}@example.com
                          </span>
                        </div>
                      </div>

                      {/* Branded Email Canvas Mockup */}
                      <div className="border border-gray-200 rounded-3xl bg-[#FAFAFA] p-6 sm:p-8 shadow-inner">
                        {/* Email Brand Header */}
                        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-extrabold text-sm">
                              S.
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-zinc-900 leading-none">
                                SolarGuard Operations
                              </h4>
                              <span className="text-[10px] text-zinc-400">
                                Photovoltaic Care & Reliability
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                            Routine Service Notice
                          </span>
                        </div>

                        {/* Email Body */}
                        <div className="py-6 space-y-4 text-xs text-zinc-700 leading-relaxed">
                          <p className="text-sm font-bold text-zinc-900">
                            Dear {activeReminder.customer},
                          </p>
                          <p>
                            This is an automated maintenance notification regarding your solar energy
                            system. To ensure maximum power yield, fire protection, and compliance with
                            equipment warranty terms, a comprehensive periodic inspection has been scheduled.
                          </p>

                          {/* Inspection Highlight Box */}
                          <div className="bg-white rounded-2xl p-4 border border-gray-200 space-y-2 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-500 font-semibold">Installed System:</span>
                              <span className="font-bold text-zinc-900">{activeReminder.system}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-500 font-semibold">Installation Location:</span>
                              <span className="font-bold text-zinc-900">{activeReminder.location}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-500 font-semibold">Inspection Date:</span>
                              <span className="font-extrabold text-amber-700">
                                {fmt(activeReminder.maintenanceDate)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-zinc-500 font-semibold">Status:</span>
                              <span className="font-bold text-zinc-900 capitalize">
                                {activeReminder.message}
                              </span>
                            </div>
                          </div>

                          {/* Inspection Checklist preview */}
                          <div className="pt-2">
                            <h5 className="font-bold text-zinc-900 mb-1.5">
                              Our technician will complete:
                            </h5>
                            <ul className="list-disc pl-4 space-y-1 text-zinc-600">
                              <li>Solar PV array dirt & shading analysis</li>
                              <li>Inverter heat-sink cleaning & error log download</li>
                              <li>Lithium battery state-of-health and cell balancing verification</li>
                              <li>DC isolator, SPD surge arrestor, and torque inspection</li>
                            </ul>
                          </div>

                          {/* Call To Action Button in Email */}
                          <div className="pt-4 text-center">
                            <button
                              type="button"
                              className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold shadow-sm"
                            >
                              Confirm Inspection Date & Site Access
                            </button>
                          </div>
                        </div>

                        {/* Email Footer */}
                        <div className="pt-4 border-t border-gray-200 text-center text-[10px] text-zinc-400">
                          SolarGuard Maintenance Dispatch Center • 24/7 Monitoring & Safety
                        </div>
                      </div>

                      {/* Dispatch Action Button */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                        <span className="text-xs text-zinc-400 font-medium">
                          Simulated dispatch ready • logs to delivery history
                        </span>

                        {canWrite ? (
                          <button
                            type="button"
                            onClick={() => sendEmail(activeReminder)}
                            disabled={busy}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-zinc-900 hover:bg-black text-white font-semibold text-xs sm:text-sm shadow-md transition-all disabled:opacity-50 self-start sm:self-auto"
                          >
                            <Send className="w-4 h-4 text-amber-400" />
                            <span>{busy ? 'Sending Notice...' : 'Send Reminder Email'}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-zinc-500 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200 inline-flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Viewer Mode: Dispatch Restricted</span>
                            </span>
                            <button
                              type="button"
                              disabled
                              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gray-200 text-zinc-400 font-semibold text-xs sm:text-sm cursor-not-allowed"
                            >
                              <Send className="w-4 h-4 text-zinc-400" />
                              <span>Send Reminder Email</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-zinc-400">
                      <Mail className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
                      <p className="text-xs font-bold">No reminder selected</p>
                    </div>
                  )}
                </div>
              </div>
            );
          }}
        </Async>
      )}

      {/* Tab 2: Sent Mail History Log */}
      {tab === 'history' && (
        <Async res={historyRes}>
          {(history) => (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
              <h3 className="text-base font-extrabold text-zinc-900 mb-4 tracking-tight">
                Email Dispatch Activity Log ({history.length})
              </h3>

              {history.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">
                  <Mail className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
                  <p className="text-xs font-bold text-zinc-600">No emails dispatched yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-zinc-400 uppercase tracking-wider text-[11px]">
                          <th className="pb-3 font-bold">Recipient</th>
                          <th className="pb-3 font-bold">Customer</th>
                          <th className="pb-3 font-bold">Subject</th>
                          <th className="pb-3 font-bold">Status</th>
                          <th className="pb-3 font-bold">Sent Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {history
                          .slice((historyPage - 1) * 8, historyPage * 8)
                          .map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                              <td className="py-3.5 font-bold text-zinc-900">{item.recipient}</td>
                              <td className="py-3.5 text-zinc-600">{item.customer}</td>
                              <td className="py-3.5 text-zinc-700 font-medium max-w-xs truncate">
                                {item.subject}
                              </td>
                              <td className="py-3.5">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                                  <CheckCircle2 className="w-3 h-3" /> Delivered
                                </span>
                              </td>
                              <td className="py-3.5 text-zinc-400">
                                {fmt(item.sentAt)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  <Pagination
                    totalItems={history.length}
                    itemsPerPage={8}
                    currentPage={historyPage}
                    onPageChange={(p) => setHistoryPage(p)}
                  />
                </div>
              )}

            </div>
          )}
        </Async>
      )}

      {/* Tab 3: Future Mailer Configuration */}
      {tab === 'config' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 max-w-2xl space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight">
              Production Email Provider Settings
            </h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Configure credentials for live SMTP or transactional email providers (Resend, SendGrid, Amazon SES)
            </p>
          </div>

          <div className="space-y-4">
            {!isAdmin && (
              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-2.5 text-xs text-purple-900">
                <Lock className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold">Administrator-Only Configuration</span>
                  <p className="mt-0.5 text-purple-800 font-medium">
                    Only Administrators can modify outbound email provider API keys and sender credentials. These settings are currently read-only.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Email Dispatch Provider
              </label>
              <select
                disabled={!isAdmin}
                value={smtpConfig.provider}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, provider: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="resend">Resend API (Recommended)</option>
                <option value="sendgrid">SendGrid Web API</option>
                <option value="smtp">Custom SMTP Server (Host, Port, TLS)</option>
                <option value="ses">Amazon SES</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                API Key / Secret Token
              </label>
              <input
                disabled={!isAdmin}
                type="password"
                value={smtpConfig.apiKey}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, apiKey: e.target.value })}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 font-mono disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Sender Email (From)
                </label>
                <input
                  disabled={!isAdmin}
                  type="email"
                  value={smtpConfig.fromEmail}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                  Sender Display Name
                </label>
                <input
                  disabled={!isAdmin}
                  type="text"
                  value={smtpConfig.fromName}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-zinc-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-bold">Mailing Interface Ready</span>
                <p className="mt-0.5 text-emerald-700">
                  Email reminder previews are active. When ready for live external mail delivery, enter your production API key and click Save Configuration.
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => toast('Mailer configuration saved successfully')}
                className="px-6 py-2.5 bg-zinc-900 hover:bg-black text-white rounded-2xl text-xs font-bold shadow-md transition-all"
              >
                Save Configuration
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
