import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Wrench, CheckCircle2, Clock } from 'lucide-react';
import { fmt } from '../utils.js';

export default function CalendarWidget({ maintenanceList = [], onSelectDate, selectedDate }) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1);
  // In standard JS: 0=Sun, 1=Mon... Let's map to Monday start (0=Mon... 6=Sun)
  let startingDay = firstDayOfMonth.getDay() - 1;
  if (startingDay === -1) startingDay = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Map maintenance items to day keys "YYYY-MM-DD"
  const maintenanceMap = {};
  maintenanceList.forEach((m) => {
    if (!m.dueDate) return;
    const d = new Date(m.dueDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!maintenanceMap[key]) maintenanceMap[key] = [];
    maintenanceMap[key].push(m);
  });

  const calendarDays = [];

  // Previous month trailing days
  for (let i = startingDay - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const key = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    calendarDays.push({
      day: dayNum,
      date: prevDate,
      isCurrentMonth: false,
      key,
      isDashed: true,
      hasEvents: !!maintenanceMap[key],
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const thisDate = new Date(year, month, i);
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const today = new Date();
    const isToday =
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === i;

    calendarDays.push({
      day: i,
      date: thisDate,
      isCurrentMonth: true,
      key,
      isToday,
      hasEvents: !!maintenanceMap[key],
      events: maintenanceMap[key] || [],
    });
  }

  // Next month leading days to complete grid (up to 35 or 42)
  const remaining = 35 - calendarDays.length;
  if (remaining > 0) {
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const key = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      calendarDays.push({
        day: i,
        date: nextDate,
        isCurrentMonth: false,
        key,
        isDashed: true,
        hasEvents: !!maintenanceMap[key],
      });
    }
  }

  const selectedKey = selectedDate
    ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    : null;

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-extrabold text-zinc-900 tracking-tight">
          {monthNames[month]} {year}
        </h4>
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-colors"
            title="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-colors"
            title="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['MON', 'THU', 'WED', 'TUE', 'FRI', 'SAT', 'SUN'].map((d) => (
          <span key={d} className="text-[11px] font-bold text-zinc-400 tracking-wider">
            {d}
          </span>
        ))}
      </div>

      {/* Calendar Date Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((item, idx) => {
          const isSelected = selectedKey && selectedKey === item.key;
          const hasMaintenance = item.hasEvents;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate && onSelectDate(isSelected ? null : item.date)}
              className={`h-9 w-9 mx-auto rounded-full text-xs font-semibold flex items-center justify-center relative transition-all ${
                isSelected
                  ? 'bg-zinc-900 text-white shadow-md scale-105'
                  : hasMaintenance
                  ? 'bg-zinc-900 text-white font-bold hover:scale-105 shadow-sm'
                  : item.isToday
                  ? 'ring-2 ring-zinc-900 text-zinc-900 font-bold'
                  : item.isCurrentMonth
                  ? 'text-zinc-700 hover:bg-zinc-100'
                  : item.isDashed
                  ? 'border border-dashed border-zinc-300 text-zinc-400'
                  : 'text-zinc-300'
              }`}
            >
              <span>{item.day}</span>
              {hasMaintenance && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 bg-amber-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
