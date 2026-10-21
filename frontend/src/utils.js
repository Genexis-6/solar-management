import { useEffect, useState } from 'react';
import { api } from './api.js';

export const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
export const dateVal = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
export const label = (t) => String(t || '').replace('_', ' ');
export const timeText = (m) => (m.daysRemaining === null ? 'Completed ' + fmt(m.completedAt) : m.daysRemaining < 0 ? -m.daysRemaining + ' days overdue' : m.daysRemaining === 0 ? 'Due today' : m.daysRemaining + ' days remaining');

export function useFetch(path, tick = 0) {
  const [s, setS] = useState({ data: null, error: '' });
  const [n, setN] = useState(0);
  useEffect(() => {
    let live = true;
    api.get(path).then((data) => live && setS({ data, error: '' })).catch((e) => live && setS({ data: null, error: e.message }));
    return () => { live = false; };
  }, [path, tick, n]);
  return { ...s, reload: () => setN((x) => x + 1) };
}
