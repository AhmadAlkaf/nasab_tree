'use client';

import { useState } from 'react';
import { AdminUser, LogEntry, LogEntryFormData, LogActionFlag } from '@/types';
import { createLogEntry, updateLogEntry } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Save, History } from 'lucide-react';

interface LogEntryFormProps {
  existing?: LogEntry | null;
  users: AdminUser[];
  contentTypes: number[];
  onSuccess?: () => void;
}

export default function LogEntryForm({ existing, users, contentTypes, onSuccess }: LogEntryFormProps) {
  const [form, setForm] = useState<LogEntryFormData>(() => ({
    action_flag: existing?.action_flag ?? 1,
    object_id: existing?.object_id ?? '',
    object_repr: existing?.object_repr ?? '',
    change_message: existing?.change_message ?? '',
    user: existing?.user_id ?? users[0]?.id ?? 1,
    content_type: existing?.content_type ?? contentTypes[0] ?? 1,
  }));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast, triggerRefresh } = useAppStore();

  const isEdit = Boolean(existing);

  const updateField = <K extends keyof LogEntryFormData>(key: K, value: LogEntryFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.object_repr.trim()) {
      setError('الوصف القصير للكائن مطلوب');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = existing
        ? await updateLogEntry(existing.id, form)
        : await createLogEntry(form);

      if (result.success && result.data) {
        addToast({ type: 'success', message: isEdit ? 'تم حفظ تعديل السجل' : 'تم إنشاء السجل بنجاح' });
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
    <form onSubmit={submit}>
      <div style={{
        padding: '10px 14px',
        background: isEdit ? 'rgba(59,130,246,0.06)' : 'rgba(212,168,83,0.06)',
        borderRadius: 'var(--radius-md)',
        border: isEdit ? '1px solid rgba(59,130,246,0.2)' : '1px solid var(--border-gold)',
        marginBottom: 20,
        fontSize: 13,
        color: isEdit ? 'var(--blue-400)' : 'var(--gold-400)',
      }}>
        <History size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
        {isEdit ? `تعديل سجل الحركة #${existing?.id}` : 'إنشاء سجل حركة جديد'}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">نوع الإجراء</label>
          <select
            className="form-select"
            value={form.action_flag}
            onChange={(e) => updateField('action_flag', Number(e.target.value) as LogActionFlag)}
          >
            <option value={1}>إضافة</option>
            <option value={2}>تعديل</option>
            <option value={3}>حذف</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">المستخدم</label>
          <select
            className="form-select"
            value={form.user}
            onChange={(e) => updateField('user', Number(e.target.value))}
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.username || `#${user.id}`}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">رقم الكائن (object id)</label>
          <input
            className="form-input"
            type="text"
            value={form.object_id}
            onChange={(e) => updateField('object_id', e.target.value)}
            placeholder="معرف العنصر"
          />
        </div>
        <div className="form-group">
          <label className="form-label">نوع المحتوى</label>
          <select
            className="form-select"
            value={form.content_type}
            onChange={(e) => updateField('content_type', Number(e.target.value))}
          >
            {contentTypes.map(ct => (
              <option key={ct} value={ct}>نوع المحتوى #{ct}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="required">*</span>
          وصف الكائن (object repr)
        </label>
        <input
          className={`form-input ${error ? 'error' : ''}`}
          type="text"
          value={form.object_repr}
          onChange={(e) => { updateField('object_repr', e.target.value); setError(null); }}
          placeholder="مثال: شخص: فلان الفلاني"
        />
        {error && <div className="form-error">{error}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">تفاصيل التغيير</label>
        <textarea
          className="form-textarea"
          rows={3}
          value={form.change_message}
          onChange={(e) => updateField('change_message', e.target.value)}
          placeholder="وصف التغيير الذي حدث..."
        />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start', paddingTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading-spinner" /> : <Save size={16} />}
          {isEdit ? 'حفظ التعديل' : 'إنشاء السجل'}
        </button>
      </div>
    </form>
  );
}