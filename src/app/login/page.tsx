'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setAuth = useAppStore((s) => s.setAuth);
  const addToast = useAppStore((s) => s.addToast);
  const token = useAppStore((s) => s.token);
  const isAuthReady = useAppStore((s) => s.isAuthReady);
  const router = useRouter();

  useEffect(() => {
    if (isAuthReady && token) router.replace('/');
  }, [isAuthReady, token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    const res = await login(username.trim(), password);

    if (res.success && res.data) {
      setAuth({
        token: res.data.token,
        username: res.data.username,
        isStaff: res.data.is_staff,
        permissions: res.data.permissions || [],
      });
      addToast({ type: 'success', message: res.data.message || 'تم تسجيل الدخول بنجاح' });
      router.replace('/');
      return;
    }

    setError(res.error || 'فشل تسجيل الدخول، حاول مرة أخرى');
    setIsSubmitting(false);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">نسب</div>
          <div className="login-title">تسجيل الدخول</div>
          <div className="login-subtitle">نظام إدارة الشجرة النسبية</div>
        </div>

        {error && (
          <div className="login-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">اسم المستخدم</label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 12, color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                className="form-input"
                style={{ paddingRight: 38 }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: 12, color: 'var(--text-muted)' }}
              />
              <input
                type="password"
                className="form-input"
                style={{ paddingRight: 38 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="loading-spinner" /> : <LogIn size={16} />}
            {isSubmitting ? 'جارٍ تسجيل الدخول...' : 'دخول'}
          </button>
        </form>

        <div className="login-footer">
          شجرة الأنساب — نظام إدارة الشجرة النسبية
        </div>
      </div>
    </div>
  );
}