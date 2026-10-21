import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Plus,
  Trash2,
  AlertTriangle,
  Layers,
  Cpu,
  Battery,
  Sun,
  Zap,
  Shield,
  Cable,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const TAG_STYLES = {
  overdue: 'bg-rose-100/90 text-rose-700 border-rose-200',
  faulty: 'bg-rose-100/90 text-rose-700 border-rose-200',
  completed: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
  active: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
  'due today': 'bg-amber-100/90 text-amber-800 border-amber-200',
  upcoming: 'bg-purple-100/90 text-purple-800 border-purple-200',
  rescheduled: 'bg-indigo-100/90 text-indigo-800 border-indigo-200',
  planned: 'bg-blue-100/90 text-blue-800 border-blue-200',
  decommissioned: 'bg-gray-100 text-gray-600 border-gray-200',
  residential: 'bg-teal-50 text-teal-800 border-teal-200',
  commercial: 'bg-blue-50 text-blue-800 border-blue-200',
  industrial: 'bg-amber-50 text-amber-800 border-amber-200',
};

export const Tag = ({ s, className = '' }) => {
  const norm = String(s || '').toLowerCase();
  const cls = TAG_STYLES[norm] || 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize border ${cls} ${className}`}
    >
      {s}
    </span>
  );
};

export function Async({ res, children }) {
  if (res.error) {
    return (
      <div className="p-6 my-4 bg-rose-50 border border-rose-200 rounded-3xl text-rose-700 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium">{res.error}</span>
      </div>
    );
  }
  if (!res.data) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 gap-3">
        <div className="w-5 h-5 border-2 border-gray-300 border-t-zinc-800 rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading data...</span>
      </div>
    );
  }
  return children(res.data);
}

export function Modal({ title, onClose, children, maxWidth = 'max-w-2xl' }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  const modalElement = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/65 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`bg-white w-full ${maxWidth} rounded-3xl sm:rounded-[32px] shadow-2xl border border-gray-100 flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden my-auto animate-in zoom-in-95 duration-200`}
      >
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0 bg-white">
          <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 tracking-tight">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
}

export function Confirm({ message, onYes, onClose, title = 'Confirm Action' }) {
  const [busy, setBusy] = useState(false);
  const handleYes = async () => {
    setBusy(true);
    try {
      await onYes();
      onClose();
    } catch {
      setBusy(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose} maxWidth="max-w-md">
      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-6">{message}</p>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleYes}
          disabled={busy}
          className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
        >
          {busy ? 'Processing...' : 'Yes, proceed'}
        </button>
      </div>
    </Modal>
  );
}

export const COMPONENT_ICONS = {
  panel: Sun,
  battery: Battery,
  inverter: Zap,
  charge_controller: Cpu,
  cable: Cable,
  protection: Shield,
  mounting: Layers,
};

const TYPES = ['panel', 'battery', 'inverter', 'charge_controller', 'cable', 'protection', 'mounting'];

function Components({ value = [], onChange }) {
  const upd = (i, k, v) => onChange(value.map((c, j) => (j === i ? { ...c, [k]: v } : c)));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500">
          Installed Components & Hardware
        </label>
        <span className="text-[11px] text-gray-400 font-semibold">{value.length} items registered</span>
      </div>

      <div className="space-y-2.5 max-h-56 sm:max-h-60 overflow-y-auto pr-1">
        {value.map((c, i) => (
          <div
            key={i}
            className="bg-gray-50/90 p-3 sm:p-2.5 rounded-2xl border border-gray-100 text-xs flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center"
          >
            {/* Type selector & mobile remove */}
            <div className="flex items-center justify-between sm:col-span-3">
              <select
                value={c.type}
                onChange={(e) => upd(i, 'type', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 capitalize focus:outline-none focus:ring-1 focus:ring-zinc-800"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                className="sm:hidden p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-2"
                title="Remove component"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Brand and Model */}
            <div className="grid grid-cols-2 sm:contents gap-2">
              <div className="sm:col-span-3">
                <input
                  placeholder="Brand (e.g. Jinko)"
                  value={c.brand || ''}
                  onChange={(e) => upd(i, 'brand', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              </div>
              <div className="sm:col-span-3">
                <input
                  placeholder="Model / Specs"
                  value={c.model || ''}
                  onChange={(e) => upd(i, 'model', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              </div>
            </div>

            {/* Quantity and desktop remove */}
            <div className="flex items-center gap-2 sm:contents">
              <div className="flex-1 sm:col-span-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={c.quantity || ''}
                  onChange={(e) => upd(i, 'quantity', Number(e.target.value) || 1)}
                  className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-center font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-zinc-800"
                />
              </div>
              <div className="hidden sm:flex sm:col-span-1 justify-center">
                <button
                  type="button"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  className="p-1 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Remove component"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onChange([...value, { type: 'panel', quantity: 1, brand: '', model: '' }])}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-800 bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add Component
      </button>
    </div>
  );
}

export function Form({ fields, initial = {}, submitLabel = 'Save changes', onSubmit, onCancel }) {
  const [data, setData] = useState(() =>
    Object.fromEntries(
      fields.map((f) => [f.name, initial[f.name] ?? (f.type === 'components' ? [] : '')])
    )
  );
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (n, v) => setData((d) => ({ ...d, [n]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const out = {};
      for (const f of fields) {
        const v = data[f.name];
        out[f.name] =
          f.type === 'components'
            ? v
            : v === ''
            ? null
            : f.type === 'number'
            ? Number(v)
            : v;
      }
      await onSubmit(out);
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
        {fields.map((f) => {
          if (f.type === 'components') {
            return (
              <div className="sm:col-span-2 pt-2" key={f.name}>
                <Components value={data[f.name]} onChange={(v) => set(f.name, v)} />
              </div>
            );
          }
          if (f.type === 'textarea') {
            return (
              <div className={f.full ? 'sm:col-span-2' : ''} key={f.name}>
                <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  {f.label} {f.required && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows={f.rows || 3}
                  value={data[f.name] || ''}
                  placeholder={f.placeholder}
                  required={f.required}
                  onChange={(e) => set(f.name, e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all resize-none"
                />
              </div>
            );
          }
          return (
            <div className={f.full ? 'sm:col-span-2' : ''} key={f.name}>
              <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                {f.label} {f.required && <span className="text-rose-500">*</span>}
              </label>
              {f.type === 'select' ? (
                <select
                  value={data[f.name] ?? ''}
                  required={f.required}
                  onChange={(e) => set(f.name, e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs sm:text-sm font-semibold text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                >
                  {f.options.map((o) => (
                    <option key={o.v} value={o.v}>
                      {o.l}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={f.type || 'text'}
                  value={data[f.name] ?? ''}
                  required={f.required}
                  min={f.min}
                  placeholder={f.placeholder}
                  step={f.type === 'number' ? 'any' : undefined}
                  minLength={f.type === 'password' ? 8 : undefined}
                  autoComplete={f.type === 'password' ? 'new-password' : undefined}
                  onChange={(e) => set(f.name, e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
                />
              )}
            </div>
          );
        })}
      </div>

      {err && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium">
          {err}
        </div>
      )}

      {/* Sticky Bottom Actions so buttons are always visible on mobile */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-xs pt-3 pb-1 border-t border-gray-100 flex items-center justify-end gap-2.5 sm:gap-3 z-10">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={busy}
          className="px-5 sm:px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-zinc-900 hover:bg-black transition-all shadow-md disabled:opacity-50"
        >
          {busy ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function Pagination({
  totalItems,
  itemsPerPage = 6,
  currentPage = 1,
  onPageChange,
  className = '',
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  if (totalPages <= 1) return null;

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(currentPage * itemsPerPage, totalItems);

  const getPages = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const handlePage = (p) => {
    onPageChange(p);
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-6 border-t border-gray-100 ${className}`}>
      <span className="text-xs font-semibold text-zinc-400">
        Showing <span className="text-zinc-800 font-bold">{startIdx}</span> to{' '}
        <span className="text-zinc-800 font-bold">{endIdx}</span> of{' '}
        <span className="text-zinc-800 font-bold">{totalItems}</span> entries
      </span>

      <div className="flex items-center gap-1.5 self-center sm:self-auto">
        <button
          type="button"
          onClick={() => handlePage(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPages().map((p, idx) =>
          p === '...' ? (
            <span key={idx} className="px-2 text-xs text-zinc-400">
              ...
            </span>
          ) : (
            <button
              type="button"
              key={idx}
              onClick={() => handlePage(p)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                currentPage === p
                  ? 'bg-zinc-900 text-white shadow-sm'
                  : 'bg-gray-100 text-zinc-600 hover:bg-gray-200'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          type="button"
          onClick={() => handlePage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-all"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
