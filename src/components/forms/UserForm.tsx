'use client';

import { useState } from 'react';
import { AdminUser, Group, UserFormData } from '@/types';
import { createAdminUser, updateAdminUser } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Save, User } from 'lucide-react';

interface UserFormProps {
  existing?: AdminUser | null;
  groups: Group[];
  onSuccess?: () => void;
}

export default function UserForm({ existing, groups, onSuccess }: UserFormProps) {
  const [form, setForm] = useState<UserFormData>(() => ({
    username: existing?.username ?? '',
    password: '',
    first_name: existing?.first_name ?? '',
    last_name: existing?.last_name ?? '',
    email: existing?.email ?? '',
    is_active: existing?.is_active ?? true,
    is_staff: existing?.is_staff ?? false,
    is_superuser: existing?.is_superuser ?? false,
    groups: existing?.groups ?? [],
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast, triggerRefresh } = useAppStore();

  const isEdit = Boolean(existing);

  const updateField = <K extends keyof UserFormData>(key: K, value: UserFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const toggleGroup = (groupId: number) => {
    setForm(prev => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter(g => g !== groupId)
        : [...prev.groups, groupId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!form.username.trim()) newErrors.username = 'اسم المستخدم مطلوب';
    if (!isEdit && !form.password) newErrors.password = 'كلمة المرور مطلوبة';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = existing
        ? await updateAdminUser(existing.id, form)
        : await createAdminUser(form);

      if (result.success && result.data) {
        addToast({ type: 'success', message: isEdit ? 'تم حفظ تعديل المستخدم' : 'تم إنشاء المستخدم بنجاح' });
        triggerRefresh();
        onSuccess?.();
      } else {
        addToast({ type: 'error', message: result.error || 'حدث خطأ' });
      }
    } catch {
      addToast({ type: 'error', message: 'حدث خطأ غير متوقع' });
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        padding: '10px 14px',
        background: isEdit ? 'rgba(59,130,246,0.06)' : 'rgba(212,168,83,0.06)',
        borderRadius: 'var(--radius-md)',
        border: isEdit ? '1px solid rgba(59,130,246,0.2)' : '1px solid var(--border-gold)',
        marginBottom: 20,
        fontSize: 13,
        color: isEdit ? 'var(--blue-400)' : 'var(--gold-400)',
      }}>
        <User size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
        {isEdit ? `تعديل المستخدم: ${existing?.username}` : 'إنشاء مستخدم جديد'}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">
            <span className="required">*</span>
            اسم المستخدم
          </label>
          <input
            className={`form-input ${errors.username ? 'error' : ''}`}
            type="text"
            value={form.username}
            onChange={(e) => updateField('username', e.target.value)}
            placeholder="اسم الدخول"
          />
          {errors.username && <div className="form-error">{errors.username}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">
            {!isEdit && <span className="required">*</span>}
            كلمة المرور
          </label>
          <input
            className={`form-input ${errors.password ? 'error' : ''}`}
            type="password"
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            placeholder={isEdit ? 'اتركها فارغة لعدم تغييرها' : 'كلمة المرور'}
          />
          {errors.password && <div className="form-error">{errors.password}</div>}
          {isEdit && <div className="form-hint">اترك فارغاً للإبقاء على كلمة المرور الحالية</div>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">الاسم الأول</label>
          <input
            className="form-input"
            type="text"
            value={form.first_name}
            onChange={(e) => updateField('first_name', e.target.value)}
            placeholder="الاسم الأول"
          />
        </div>
        <div className="form-group">
          <label className="form-label">الاسم الأخير</label>
          <input
            className="form-input"
            type="text"
            value={form.last_name}
            onChange={(e) => updateField('last_name', e.target.value)}
            placeholder="الاسم الأخير"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">البريد الإلكتروني</label>
        <input
          className="form-input"
          type="email"
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="email@example.com"
        />
      </div>

      <div className="form-section">
        <div className="form-section-title">الحالة والصلاحيات</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="toggle-wrapper" onClick={() => updateField('is_active', !form.is_active)}>
            <div className={`toggle ${form.is_active ? 'active' : ''}`} />
            <span className="toggle-label">مستخدم فعال (يمكنه الدخول)</span>
          </div>
          <div className="toggle-wrapper" onClick={() => updateField('is_staff', !form.is_staff)}>
            <div className={`toggle ${form.is_staff ? 'active' : ''}`} />
            <span className="toggle-label">عضو طاقم (دخول لوحة الإدارة)</span>
          </div>
          <div className="toggle-wrapper" onClick={() => updateField('is_superuser', !form.is_superuser)}>
            <div className={`toggle ${form.is_superuser ? 'active' : ''}`} />
            <span className="toggle-label">مستخدم فائق (كافة الصلاحيات)</span>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-title">المجموعات</div>
        {groups.length === 0 ? (
          <div className="form-hint">لا توجد مجموعات — أنشئ مجموعة أولاً من قسم المجموعات</div>
        ) : (
          <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 8 }}>
            {groups.map(group => (
              <label key={group.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 2px', cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.groups.includes(group.id)}
                  onChange={() => toggleGroup(group.id)}
                />
                <span>{group.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start', paddingTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading-spinner" /> : <Save size={16} />}
          {isEdit ? 'حفظ التعديل' : 'إنشاء المستخدم'}
        </button>
      </div>
    </form>
  );
}