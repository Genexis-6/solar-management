import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }) {
  const [t, setT] = useState(null);
  const toast = useCallback((msg, bad = false) => {
    setT({ msg, bad });
    setTimeout(() => setT(null), 3200);
  }, []);

  return (
    <Ctx.Provider value={toast}>
      {children}
      {t && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-medium transition-all ${
              t.bad
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-zinc-900 border-zinc-800 text-white'
            }`}
          >
            {t.bad ? (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span>{t.msg}</span>
            <button
              onClick={() => setT(null)}
              className="ml-2 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}
