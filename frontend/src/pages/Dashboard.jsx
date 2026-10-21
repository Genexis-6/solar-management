import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Sun,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  Battery,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Async, Tag } from '../components/ui.jsx';
import CalendarWidget from '../components/CalendarWidget.jsx';
import MaintenanceActions from '../components/MaintenanceActions.jsx';
import { fmt, useFetch } from '../utils.js';

const ORDER = ['overdue', 'due today', 'upcoming', 'rescheduled', 'completed'];

export default function Dashboard() {
  const [tick, setTick] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();

  const stats = useFetch('/dashboard', tick);
  const reminders = useFetch('/reminders?days=60', tick);
  const allMaintenance = useFetch('/maintenance', tick);

  const refreshAll = () => setTick((t) => t + 1);

  return (
    <div className="space-y-8">
      <Async res={stats}>
        {(d) => {
          const m = d.maintenance || {};
          const overdueCount = m['overdue'] || 0;
          const dueTodayCount = m['due today'] || 0;
          const upcomingCount = m['upcoming'] || 0;
          const completedCount = m['completed'] || 0;
          const totalActivities = overdueCount + dueTodayCount + upcomingCount;

          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column (Activities, Cards, Metric Tiles, Wide Feature Card) */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-7">
                
                {/* 1. "Your activities today" section with 2 Hero Pastel Cards */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
                      Your activities today{' '}
                      <span className="text-zinc-400 font-medium">({totalActivities})</span>
                    </h2>
                    <Link
                      to="/maintenance"
                      className="text-xs font-bold text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition-colors"
                    >
                      View all <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Pastel Mint Card */}
                    <div className="bg-[#D5EBE5] rounded-[28px] p-5 sm:p-6 flex flex-col justify-between min-h-[170px] relative card-hover-effect shadow-sm comp-enter delay-1">
                      <div className="flex items-center justify-between">
                        {/* Technician Avatar Stack */}
                        <div className="flex items-center -space-x-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center border-2 border-[#D5EBE5]">
                            JD
                          </div>
                          <div className="w-7 h-7 rounded-full bg-teal-800 text-white text-[11px] font-bold flex items-center justify-center border-2 border-[#D5EBE5]">
                            AM
                          </div>
                          <div className="w-7 h-7 rounded-full bg-zinc-800 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#D5EBE5]">
                            +2
                          </div>
                        </div>

                        {/* Top Rating / Priority Badge */}
                        <div className="bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-zinc-800 flex items-center gap-1 shadow-2xs">
                          <span className="text-amber-500">★</span> 4.9
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-6">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800/80">
                            Solar Array Inspection
                          </span>
                          <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight mt-0.5">
                            PV Panels & Tilt Health
                          </h3>
                        </div>

                        <Link
                          to="/maintenance"
                          className="w-9 h-9 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-sm hover:scale-110 transition-transform shrink-0"
                          title="Open inspections"
                        >
                          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                        </Link>
                      </div>
                    </div>

                    {/* Pastel Pink Card */}
                    <div className="bg-[#FCD8E2] rounded-[28px] p-5 sm:p-6 flex flex-col justify-between min-h-[170px] relative card-hover-effect shadow-sm comp-enter delay-2">
                      <div className="flex items-center justify-between">
                        {/* Technician Avatar Stack */}
                        <div className="flex items-center -space-x-2">
                          <div className="w-7 h-7 rounded-full bg-rose-700 text-white text-[11px] font-bold flex items-center justify-center border-2 border-[#FCD8E2]">
                            TK
                          </div>
                          <div className="w-7 h-7 rounded-full bg-pink-800 text-white text-[11px] font-bold flex items-center justify-center border-2 border-[#FCD8E2]">
                            SL
                          </div>
                          <div className="w-7 h-7 rounded-full bg-zinc-800 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#FCD8E2]">
                            +3
                          </div>
                        </div>

                        {/* Top Rating Badge */}
                        <div className="bg-white/80 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-zinc-800 flex items-center gap-1 shadow-2xs">
                          <span className="text-amber-500">★</span> 4.8
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-6">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800/80">
                            Power Storage Audit
                          </span>
                          <h3 className="text-lg font-extrabold text-zinc-900 tracking-tight mt-0.5">
                            Battery & Inverter Diagnostic
                          </h3>
                        </div>

                        <Link
                          to="/installations"
                          className="w-9 h-9 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-sm hover:scale-110 transition-transform shrink-0"
                          title="Open installations"
                        >
                          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                        </Link>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 2. "Maintenance progress" section */}
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
                    Maintenance progress
                  </h2>

                  {/* Metric Pills Row (Completed, Due today, Upcoming, Overdue) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {/* Completed */}
                    <div className="bg-[#DDF3ED] rounded-3xl p-4 flex flex-col justify-between min-h-[110px] relative card-hover-effect comp-enter delay-2">
                      <span className="text-xs font-bold text-emerald-800/70">Completed</span>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-extrabold text-zinc-900">{completedCount}</span>
                        <Link
                          to="/maintenance?status=completed"
                          className="w-7 h-7 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-2xs hover:scale-110 transition-transform"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </Link>
                      </div>
                    </div>

                    {/* Due Today */}
                    <div className="bg-[#FEF0C7] rounded-3xl p-4 flex flex-col justify-between min-h-[110px] relative card-hover-effect comp-enter delay-2">
                      <span className="text-xs font-bold text-amber-800/70">Due today</span>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-extrabold text-zinc-900">{dueTodayCount}</span>
                        <Link
                          to="/maintenance?status=due%20today"
                          className="w-7 h-7 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-2xs hover:scale-110 transition-transform"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </Link>
                      </div>
                    </div>

                    {/* Upcoming */}
                    <div className="bg-[#ECE2FA] rounded-3xl p-4 flex flex-col justify-between min-h-[110px] relative card-hover-effect comp-enter delay-3">
                      <span className="text-xs font-bold text-purple-800/70">Upcoming</span>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-extrabold text-zinc-900">{upcomingCount}</span>
                        <Link
                          to="/maintenance?status=upcoming"
                          className="w-7 h-7 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-2xs hover:scale-110 transition-transform"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </Link>
                      </div>
                    </div>

                    {/* Overdue */}
                    <div className="bg-[#FDE2E4] rounded-3xl p-4 flex flex-col justify-between min-h-[110px] relative card-hover-effect comp-enter delay-3">
                      <span className="text-xs font-bold text-rose-800/70">Overdue</span>
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-extrabold text-rose-900">{overdueCount}</span>
                        <Link
                          to="/maintenance?status=overdue"
                          className="w-7 h-7 rounded-full bg-white text-rose-900 flex items-center justify-center shadow-2xs hover:scale-110 transition-transform"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Wide Feature Card 1 (Pastel Warm Yellow) */}
                  <div className="bg-[#FDE896] rounded-[28px] p-6 relative shadow-sm card-hover-effect comp-enter delay-4">
                    <div className="flex items-start justify-between">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/70 backdrop-blur-xs rounded-full text-xs font-bold text-zinc-800">
                        <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                        <span>High Priority System</span>
                      </div>

                      <Link
                        to="/installations"
                        className="w-8 h-8 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-2xs hover:scale-110 transition-transform"
                      >
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      </Link>
                    </div>

                    <div className="mt-4">
                      <span className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                        10 kW Commercial Solar Array • Abuja
                      </span>
                      <h4 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight mt-1">
                        Periodic Inverter & Protection Calibration
                      </h4>
                      <p className="text-xs text-zinc-700 font-medium mt-1">
                        Automatic 6-month cycle • Inspection window active
                      </p>
                    </div>

                    {/* Dark Progress Bar */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-800 mb-1.5">
                        <span>Cycle Progress</span>
                        <span>82%</span>
                      </div>
                      <div className="w-full h-2.5 bg-black/10 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-900 rounded-full w-[82%]" />
                      </div>
                    </div>
                  </div>

                  {/* Wide Feature Card 2 (Pastel Pink) */}
                  <div className="bg-[#FCD8E2] rounded-[28px] p-5 sm:p-6 relative shadow-sm flex items-center justify-between card-hover-effect comp-enter delay-5">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/70 backdrop-blur-xs rounded-full text-xs font-bold text-zinc-800 mb-2">
                        <Battery className="w-3.5 h-3.5 text-rose-600" />
                        <span>Lithium Battery Storage</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-extrabold text-zinc-900 tracking-tight">
                        Pylontech US5000 Cells Health & State of Charge
                      </h4>
                      <p className="text-xs text-zinc-600 font-medium mt-0.5">
                        All monitored strings operating at optimal voltage
                      </p>
                    </div>

                    <Link
                      to="/installations"
                      className="w-8 h-8 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-2xs hover:scale-110 transition-transform shrink-0 ml-4"
                    >
                      <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                    </Link>
                  </div>
                </div>
              </div>


              {/* Right Column (Maintenance Schedule Header, Monthly Calendar, and Schedule Items) */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight">
                      Maintenance schedule
                    </h2>
                    <span className="text-xs font-bold text-zinc-400">
                      {selectedDate ? fmt(selectedDate) : 'This Month'}
                    </span>
                  </div>

                  {/* Interactive Calendar Widget */}
                  <Async res={allMaintenance}>
                    {(mList) => (
                      <CalendarWidget
                        maintenanceList={mList}
                        selectedDate={selectedDate}
                        onSelectDate={(d) => setSelectedDate(d)}
                      />
                    )}
                  </Async>
                </div>

                {/* Upcoming Schedule Items List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-extrabold text-zinc-800 tracking-tight">
                      {selectedDate ? `Inspections for ${fmt(selectedDate)}` : 'Upcoming Reminders'}
                    </h3>
                    {selectedDate && (
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="text-xs font-bold text-zinc-500 hover:text-zinc-900 underline"
                      >
                        Show all
                      </button>
                    )}
                  </div>

                  <Async res={reminders}>
                    {(list) => {
                      // Filter by selected date if one is clicked
                      const displayList = selectedDate
                        ? list.filter((r) => {
                            const rd = new Date(r.maintenanceDate);
                            return (
                              rd.getFullYear() === selectedDate.getFullYear() &&
                              rd.getMonth() === selectedDate.getMonth() &&
                              rd.getDate() === selectedDate.getDate()
                            );
                          })
                        : list.slice(0, 5);

                      if (displayList.length === 0) {
                        return (
                          <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-center">
                            <Clock className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                            <p className="text-xs font-bold text-zinc-600">No scheduled inspections</p>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              {selectedDate
                                ? 'No inspections scheduled on this day.'
                                : 'All systems in good standing.'}
                            </p>
                          </div>
                        );
                      }

                      return displayList.map((r, i) => {
                        const isOverdue = r.daysRemaining < 0;
                        const isDueToday = r.daysRemaining === 0;
                        const cardBg =
                          i % 3 === 0
                            ? 'bg-[#E2F0EC]'
                            : i % 3 === 1
                            ? 'bg-[#FDECF0]'
                            : 'bg-[#F4F6F8]';

                        return (
                          <div
                            key={r.id}
                            className={`${cardBg} rounded-3xl p-4 transition-all card-hover-effect comp-enter delay-3 border border-black/5`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                                {isOverdue ? (
                                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                                ) : isDueToday ? (
                                  <Zap className="w-4 h-4 text-amber-400" />
                                ) : (
                                  <Sun className="w-4 h-4 text-amber-300" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <Link
                                    to={`/installations/${r.installationId}`}
                                    className="text-xs font-extrabold text-zinc-900 hover:underline truncate"
                                  >
                                    {r.customer}
                                  </Link>
                                  <Tag s={r.status} />
                                </div>

                                <p className="text-[11px] text-zinc-600 font-medium mt-0.5 truncate">
                                  {r.system} • {r.location}
                                </p>

                                <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/5 text-[11px]">
                                  <span className="font-bold text-zinc-700">
                                    {fmt(r.maintenanceDate)} ({r.message})
                                  </span>
                                  <MaintenanceActions
                                    id={r.id}
                                    due={r.maintenanceDate}
                                    onDone={refreshAll}
                                    compact
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    }}
                  </Async>
                </div>
              </div>
            </div>
          );
        }}
      </Async>
    </div>
  );
}
