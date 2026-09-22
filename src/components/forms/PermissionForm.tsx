'use client';

import { useState } from 'react';
import { Permission } from '@/types';
import { createPermission, updatePermission } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Save, KeySquare } from 'lucide-react';

interface PermissionFormProps {
  existing?: Permission | null;
  contentTypes: number[];
  onSuccess?: () => void;
}

export default function PermissionForm({ existing, contentTypes, onSuccess }: PermissionFormProps) {
  const [name, setName] = useState(existing?.name ?? '');
  const [codename, setCodename] = useState(existing?.codename ?? '');
  const [contentType, setContentType] = useState<number>(
    existing?.content_type ?? contentTypes[0] ?? 1
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast, triggerRefresh } = useAppStore();

  const isEdit = Boolean(existing);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'الاسم المنسوب للصلاحية مطلوب';
    if (!codename.trim()) newErrors.codename = 'رمز الصلاحية (codename) مطلوب';
    if (!contentType) newErrors.contentType = 'نوع المحتوى مطلوب';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = existing
        ? await updatePermission(existing.id, { name: name.trim(), codename: codename.trim(), content_type: contentType })
        : await createPermission({ name: name.trim(), codename: codename.trim(), content_type: contentType });

      if (result.success && result.data) {
        addToast({ type: 'success', message: isEdit ? 'تم حفظ تعديل الصلاحية' : 'تم إنشاء الصلاحية بنجاح' });
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
        <KeySquare size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
        {isEdit ? `تعديل الصلاحية: ${existing?.name}` : 'إنشاء صلاحية جديدة'}
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="required">*</span>
          اسم الصلاحية
        </label>
        <input
          className={`form-input ${errors.name ? 'error' : ''}`}
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
          placeholder="مثال: Can add person"
        />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="required">*</span>
          الرمز (codename)
        </label>
        <input
          className={`form-input ${errors.codename ? 'error' : ''}`}
          type="text"
          value={codename}
          onChange={(e) => { setCodename(e.target.value); setErrors(prev => ({ ...prev, codename: '' })); }}
          placeholder="مثال: add_person"
        />
        {errors.codename && <div className="form-error">{errors.codename}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="required">*</span>
          نوع المحتوى
        </label>
        <select
          className={`form-select ${errors.contentType ? 'error' : ''}`}
          value={contentType}
          onChange={(e) => setContentType(Number(e.target.value))}
        >
          {contentTypes.map(ct => (
            <option key={ct} value={ct}>نوع المحتوى #{ct}</option>
          ))}
        </select>
        {errors.contentType && <div className="form-error">{errors.contentType}</div>}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start', paddingTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading-spinner" /> : <Save size={16} />}
          {isEdit ? 'حفظ التعديل' : 'إنشاء الصلاحية'}
        </button>
      </div>
    </form>
  );
}