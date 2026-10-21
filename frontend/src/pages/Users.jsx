import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  Users as UsersIcon,
  CheckCircle2,
  Lock,
  Eye,
  Wrench,
  Check,
  X,
  AlertCircle,
  Info,
  Sparkles,
  Search,
} from 'lucide-react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import { useToast } from '../toast.jsx';
import { Async, Confirm, Modal } from '../components/ui.jsx';
import { useFetch } from '../utils.js';

const ROLES = [
  {
    key: 'admin',
    label: 'Administrator',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
    color: 'purple',
    desc: 'Full administrative control over staff, deletion rights, and system settings.',
  },
  {
    key: 'technician',
    label: 'Field Technician',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    color: 'amber',
    desc: 'Operational access to register customers, log hardware specs, and complete maintenance.',
  },
  {
    key: 'viewer',
    label: 'System Viewer',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    color: 'sky',
    desc: 'Read-only observation of all dashboards, systems, schedules, and logs.',
  },
];

const MATRIX = [
  {
    feature: 'Customer Management (Register & Edit Details)',
    admin: true,
    technician: true,
    viewer: false,
    note: 'Technicians & Admins can onboard and update clients',
  },
  {
    feature: 'Solar Installation & Component Tracking Setup',
    admin: true,
    technician: true,
    viewer: false,
    note: 'Record panels, batteries, inverters, cables, and protection devices',
  },
  {
    feature: 'Maintenance Sign-Off & Inspection Notes',
    admin: true,
    technician: true,
    viewer: false,
    note: 'Sign off inspections, log field notes, and reschedule dates',
  },
  {
    feature: 'Client Reminder Email Dispatch (Mailing Center)',
    admin: true,
    technician: true,
    viewer: false,
    note: 'Preview and dispatch automated maintenance notices',
  },
  {
    feature: 'Master Record Deletion (Customers & Installations)',
    admin: true,
    technician: false,
    viewer: false,
    note: 'Admin exclusive: protects against accidental data loss',
  },
  {
    feature: 'Add & Onboard Technicians and Viewers',
    admin: true,
    technician: false,
    viewer: false,
    note: 'Admin exclusive: credentials management restricted to Admins',
  },
  {
    feature: 'Role Reassignment & Account Access Revocation',
    admin: true,
    technician: false,
    viewer: false,
    note: 'Admin exclusive: only Admins can change staff privileges',
  },
  {
    feature: 'Mailer SMTP & Production System Settings',
    admin: true,
    technician: false,
    viewer: false,
    note: 'Admin exclusive: protects production API credentials',
  },
];

export default function Users() {
  const { user: me, isAdmin } = useAuth();
  const toast = useToast();
  const res = useFetch('/users');
  const [form, setForm] = useState(false);
  const [del, setDel] = useState(null);
  const [filterRole, setFilterRole] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Register form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'technician',
  });
  const [formBusy, setFormBusy] = useState(false);
  const [formErr, setFormErr] = useState('');

  const setRole = async (u, role) => {
    if (!isAdmin) {
      toast('Only Administrators have permission to change user roles', true);
      return;
    }
    try {
      await api.patch('/users/' + u._id, { role });
      toast(`Role for ${u.name} updated to ${role}`);
      res.reload();
    } catch (e) {
      toast(e.message, true);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      toast('Only Administrators can add new technicians or viewers', true);
      return;
    }
    if (!formData.name || !formData.email || !formData.password) {
      setFormErr('All fields are required');
      return;
    }
    if (formData.password.length < 8) {
      setFormErr('Password must be at least 8 characters');
      return;
    }

    setFormBusy(true);
    setFormErr('');
    try {
      await api.post('/auth/register', formData);
      toast(`New ${formData.role} account created successfully!`);
      setForm(false);
      setFormData({ name: '', email: '', password: '', role: 'technician' });
      res.reload();
    } catch (err) {
      setFormErr(err.message || 'Registration failed');
    } finally {
      setFormBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
              Access Governance
            </span>
            <span className="text-xs font-bold text-zinc-400">• Separation of Concerns</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Team & System Roles
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5">
            Clear role boundaries between Administrators, Certified Technicians, and Viewers
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={() => {
              setFormErr('');
              setForm(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-900 text-white hover:bg-black font-semibold text-xs sm:text-sm shadow-md transition-all self-start sm:self-auto hover:-translate-y-0.5"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Add Team Member</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-100 border border-zinc-200/80 text-zinc-600 text-xs font-bold self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Admin-Only Management</span>
          </div>
        )}
      </div>

      {/* Security Governance Notice */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-amber-50 rounded-3xl p-5 sm:p-6 border border-purple-100/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-zinc-900 tracking-tight">
                Role Separation of Concerns Enforced
              </h3>
              <p className="text-xs text-zinc-600 font-medium mt-1 leading-relaxed max-w-3xl">
                <strong className="text-zinc-900 font-bold">Only Administrators</strong> have the authority to add new technicians and viewers, reassign roles, or delete customer/system records. 
                <strong className="text-zinc-900 font-bold"> Certified Technicians</strong> manage field customer operations, hardware components, and inspection sign-offs. 
                <strong className="text-zinc-900 font-bold"> Viewers</strong> hold strict read-only observation rights across the entire system.
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[11px] font-bold text-purple-900/80 bg-white/80 px-3 py-1.5 rounded-xl border border-purple-200/60 inline-flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-purple-700" />
              <span>Signed in as: <strong className="capitalize">{me?.role}</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* 3 Role Definitions Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight">
            Role Definitions & Authority Matrix
          </h3>
          <span className="text-xs font-semibold text-zinc-400">3 Established Profiles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Admin Card */}
          <div className="bg-[#EAE2F8] rounded-[30px] p-6 border border-purple-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-white text-purple-800 flex items-center justify-center shadow-2xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-3 py-1 bg-white text-purple-900 rounded-full border border-purple-200 uppercase tracking-wider">
                  Full Authority
                </span>
              </div>

              <h4 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                Administrator
              </h4>
              <p className="text-xs text-zinc-700 font-medium mt-1 leading-relaxed">
                Supreme organizational authority with exclusive custody over team personnel, deletion rights, and system settings.
              </p>

              <div className="mt-5 space-y-2 pt-4 border-t border-purple-200/60 text-xs">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-900 block">
                  Permitted Privileges:
                </span>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                  <span><strong>Only role</strong> with rights to add Technicians & Viewers</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                  <span><strong>Only role</strong> with rights to reassign roles & delete users</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                  <span>Delete customer accounts and solar installations</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                  <span>Configure production SMTP mailer parameters</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
                  <span>Full operational write access to all modules</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-purple-200/60">
              <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                <span>Superuser Status Guaranteed</span>
              </span>
            </div>
          </div>

          {/* 2. Technician Card */}
          <div className="bg-[#FEF3C7] rounded-[30px] p-6 border border-amber-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-white text-amber-800 flex items-center justify-center shadow-2xs">
                  <Wrench className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-3 py-1 bg-white text-amber-900 rounded-full border border-amber-200 uppercase tracking-wider">
                  Field Operations
                </span>
              </div>

              <h4 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                Solar Technician
              </h4>
              <p className="text-xs text-zinc-700 font-medium mt-1 leading-relaxed">
                Field engineer responsible for customer onboarding, equipment setup, component tracking, and inspection sign-offs.
              </p>

              <div className="mt-5 space-y-2 pt-4 border-t border-amber-200/60 text-xs">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900 block">
                  Permitted Privileges:
                </span>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>Register and update customer contact details</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>Create solar installations & configure hardware specs</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>Sign off maintenance inspections & log field notes</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>Reschedule inspection appointment dates</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>Dispatch client maintenance reminder notices</span>
                </div>

                <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-800 block pt-2">
                  Strict Restrictions:
                </span>
                <div className="flex items-start gap-2 text-rose-900">
                  <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>Cannot add technicians or viewers (Admin-only)</span>
                </div>
                <div className="flex items-start gap-2 text-rose-900">
                  <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>Cannot delete customer records or installations</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-amber-200/60">
              <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-700" />
                <span>Core Field Operations Role</span>
              </span>
            </div>
          </div>

          {/* 3. Viewer Card */}
          <div className="bg-[#E0F2FE] rounded-[30px] p-6 border border-sky-200/80 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl bg-white text-sky-800 flex items-center justify-center shadow-2xs">
                  <Eye className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-extrabold px-3 py-1 bg-white text-sky-900 rounded-full border border-sky-200 uppercase tracking-wider">
                  Read-Only Observer
                </span>
              </div>

              <h4 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                System Viewer
              </h4>
              <p className="text-xs text-zinc-700 font-medium mt-1 leading-relaxed">
                Read-only observer for clients, project auditors, support desk, or executive monitoring without write privileges.
              </p>

              <div className="mt-5 space-y-2 pt-4 border-t border-sky-200/60 text-xs">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-900 block">
                  Permitted Privileges:
                </span>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-sky-700 shrink-0 mt-0.5" />
                  <span>Real-time dashboard analytics, metrics, & calendars</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-sky-700 shrink-0 mt-0.5" />
                  <span>Search & inspect customer contact information</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-sky-700 shrink-0 mt-0.5" />
                  <span>Inspect installations & hardware component specs</span>
                </div>
                <div className="flex items-start gap-2 text-zinc-800">
                  <Check className="w-3.5 h-3.5 text-sky-700 shrink-0 mt-0.5" />
                  <span>View maintenance timeline queues & delivery logs</span>
                </div>

                <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-800 block pt-2">
                  Strict Restrictions:
                </span>
                <div className="flex items-start gap-2 text-rose-900">
                  <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>Cannot add, edit, or delete any customer or system</span>
                </div>
                <div className="flex items-start gap-2 text-rose-900">
                  <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>Cannot sign off or reschedule inspections</span>
                </div>
                <div className="flex items-start gap-2 text-rose-900">
                  <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                  <span>Cannot dispatch emails or trigger reminder sweeps</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-sky-200/60">
              <span className="text-[11px] font-bold text-sky-900 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-700" />
                <span>Zero Mutation Risk</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Permissions Matrix Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 tracking-tight">
              Feature vs Role Permissions Matrix
            </h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Granular breakdown of rights enforced across backend endpoints and UI controls
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-zinc-100 text-zinc-700 rounded-full">
            8 Controls Enforced
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-zinc-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 font-bold">Feature / Operational Capability</th>
                <th className="pb-3 font-bold text-center w-32">Administrator</th>
                <th className="pb-3 font-bold text-center w-36">Solar Technician</th>
                <th className="pb-3 font-bold text-center w-32">System Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {MATRIX.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3.5">
                    <span className="font-bold text-zinc-900 block">{row.feature}</span>
                    <span className="text-[11px] text-zinc-400 font-medium mt-0.5 block">{row.note}</span>
                  </td>
                  <td className="py-3.5 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </span>
                  </td>
                  <td className="py-3.5 text-center">
                    {row.technician ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-700">
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 text-center">
                    {row.viewer ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-700">
                        <X className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Roster / Staff List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight">
              Active Organization Staff & Credentials
            </h3>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Registered installers, certified technicians, and viewing accounts
            </p>
          </div>

          {/* Role Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'admin', 'technician', 'viewer'].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRole(r)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                  filterRole === r
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-gray-100 text-zinc-600 hover:bg-gray-200'
                }`}
              >
                {r === 'all' ? 'All Roles' : r + 's'}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search team member by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs sm:text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
          />
        </div>

        {/* User Table Card */}
        <Async res={res}>
          {(list) => {
            const filtered = list.filter((u) => {
              const matchRole = filterRole === 'all' || u.role === filterRole;
              const q = searchQuery.toLowerCase().trim();
              const matchQuery =
                !q ||
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q);
              return matchRole && matchQuery;
            });

            return (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-extrabold text-zinc-900">
                    Personnel Directory ({filtered.length} of {list.length})
                  </h4>
                  {!isAdmin && (
                    <span className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-zinc-400" />
                      Role modifications restricted to Admin
                    </span>
                  )}
                </div>

                {filtered.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400">
                    <UsersIcon className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
                    <p className="text-xs font-bold text-zinc-600">No team members match current filter.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-zinc-400 uppercase tracking-wider text-[11px]">
                          <th className="pb-3 font-bold">Team Member</th>
                          <th className="pb-3 font-bold">Email</th>
                          <th className="pb-3 font-bold">Assigned Role</th>
                          <th className="pb-3 font-bold text-right">
                            {isAdmin ? 'Management' : 'Status'}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.map((u) => {
                          const isMe = u._id === me?.id;
                          const roleObj = ROLES.find((r) => r.key === u.role) || ROLES[1];

                          return (
                            <tr key={u._id} className="hover:bg-gray-50/80 transition-colors">
                              {/* Member info */}
                              <td className="py-3.5 font-bold text-zinc-900">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-9 h-9 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center font-extrabold text-xs shadow-2xs">
                                    {u.name?.slice(0, 2).toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-zinc-900">{u.name}</span>
                                      {isMe && (
                                        <span className="text-[10px] bg-zinc-900 text-white px-2 py-0.5 rounded-full font-bold">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-zinc-400 font-medium block">
                                      ID: {u._id?.slice(-6)}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Email */}
                              <td className="py-3.5 text-zinc-600 font-medium">{u.email}</td>

                              {/* Role selector / badge */}
                              <td className="py-3.5">
                                {isAdmin ? (
                                  <select
                                    value={u.role}
                                    onChange={(e) => setRole(u, e.target.value)}
                                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-zinc-900 capitalize focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
                                  >
                                    {ROLES.map((r) => (
                                      <option key={r.key} value={r.key}>
                                        {r.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <span
                                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${roleObj.badge}`}
                                  >
                                    {roleObj.label}
                                  </span>
                                )}
                              </td>

                              {/* Actions / Status */}
                              <td className="py-3.5 text-right">
                                {isAdmin ? (
                                  !isMe ? (
                                    <button
                                      onClick={() => setDel(u)}
                                      className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                      title="Remove team member account"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <span className="text-[11px] font-bold text-zinc-400 italic">
                                      Active Account
                                    </span>
                                  )
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                    Active
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          }}
        </Async>
      </div>

      {/* Admin-Only: Add Team Member Modal */}
      {form && (
        <Modal
          title="Onboard New Team Member"
          onClose={() => setForm(false)}
          maxWidth="max-w-xl"
        >
          <div className="mb-4 p-3.5 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div className="text-xs text-purple-900">
              <span className="font-extrabold">Administrator Privilege Enforced:</span>
              <p className="mt-0.5 text-purple-800/90 font-medium">
                Only Administrators have the right to register technicians and viewers. Assigned roles strictly control what actions the user can take across the operations portal.
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Samuel Okafor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Email Address (Login Username)
              </label>
              <input
                type="email"
                placeholder="samuel@solar.test"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
                Initial Password (Min 8 Characters)
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Select System Access Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ROLES.map((r) => {
                  const isSelected = formData.role === r.key;
                  return (
                    <button
                      type="button"
                      key={r.key}
                      onClick={() => setFormData({ ...formData, role: r.key })}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-zinc-900 bg-zinc-900 text-white shadow-md'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-zinc-900'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-extrabold text-xs">{r.label}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                        </div>
                        <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>
                          {r.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {formErr && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{formErr}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formBusy}
                className="px-6 py-2.5 rounded-2xl bg-zinc-900 hover:bg-black text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
              >
                {formBusy ? 'Creating Account...' : 'Register Team Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Admin-Only: Delete Member Confirm */}
      {del && (
        <Confirm
          title="Revoke Team Member Access"
          message={`Are you sure you want to permanently revoke system credentials and remove ${del.name} (${del.email})?`}
          onClose={() => setDel(null)}
          onYes={async () => {
            try {
              await api.del('/users/' + del._id);
              toast('User credentials revoked and removed');
            } catch (e) {
              toast(e.message, true);
            }
            res.reload();
          }}
        />
      )}
    </div>
  );
}
