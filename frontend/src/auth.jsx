import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, stored } from './api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (stored.get() || {}).user || null);
  useEffect(() => { const f = () => setUser(null); window.addEventListener('logout', f); return () => window.removeEventListener('logout', f); }, []);
  const login = async (email, password) => { const r = await api.post('/auth/login', { email, password }); stored.set(r); setUser(r.user); };
  const logout = () => { stored.clear(); setUser(null); };
  const role = user && user.role;
  const isAdmin = role === 'admin';
  const isTechnician = role === 'technician';
  const isViewer = role === 'viewer';
  const canWrite = isAdmin || isTechnician;
  const canManageUsers = isAdmin;

  return (
    <Ctx.Provider
      value={{
        user,
        role,
        login,
        logout,
        isAdmin,
        isTechnician,
        isViewer,
        canWrite,
        canManageUsers,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
