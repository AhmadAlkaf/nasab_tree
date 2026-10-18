'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppStore, readStoredAuth } from '@/lib/store';
import Sidebar from '@/components/layout/Sidebar';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const token = useAppStore((s) => s.token);
  const isAuthReady = useAppStore((s) => s.isAuthReady);
  const setAuth = useAppStore((s) => s.setAuth);
  const setAuthReady = useAppStore((s) => s.setAuthReady);

  useEffect(() => {
    const stored = readStoredAuth();
    if (stored) setAuth(stored);
    else setAuthReady(true);
  }, [setAuth, setAuthReady]);

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isAuthReady || isLoginPage) return;
    if (!token) router.replace('/login');
  }, [isAuthReady, token, isLoginPage, router]);

  if (isLoginPage) return <>{children}</>;

  if (!isAuthReady || !token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
