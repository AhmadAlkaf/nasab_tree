'use client';

import { useState } from 'react';
import { Reference, ReferenceFormData } from '@/types';
import { createReference, updateReference } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Save, UserCheck } from 'lucide-react';
import CitySelector from './CitySelector';

interface ReferenceFormProps {
  existing?: Reference | null;
  onSuccess?: () => void;
}

export default function ReferenceForm({ existing, onSuccess }: ReferenceFormProps) {
  const [form, setForm] = useState<ReferenceFormData>(() => ({
    name: existing?.name ?? '',
    city: existing?.city_id ?? null,
    family: existing?.family ?? '',
    name_place: existing?.name_place ?? '',
    information: existing?.information ?? '',
    phone: existing?.phone ?? '',
    phone_whatapp: existing?.phone_whatapp ?? '',
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast, triggerRefresh } = useAppStore();

  const isEdit = Boolean(existing);

  const updateField = <K extends keyof ReferenceFormData>(key: K, value: ReferenceFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'اسم المعرّف مطلوب';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const result = existing
      ? await updateReference(existing.id, form)
      : await createReference(form);

    if (result.success) {
      addToast({ type: 'success', message: isEdit ? 'تم تحديث بيانات المعرّف بنجاح' : 'تم إضافة المعرّف بنجاح' });
      triggerRefresh();
      onSuccess?.();
      if (!isEdit) {
        setForm({ name: '', city: null, family: '', name_place: '', information: '', phone: '', phone_whatapp: '' });
      }
    } else {
      addToast({ type: 'error', message: result.error || 'حدث خطأ' });
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {isEdit && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(59,130,246,0.06)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(59,130,246,0.2)',
          marginBottom: 20,
          fontSize: 13,
          color: 'var(--blue-400)',
        }}>
          <UserCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
          تعديل بيانات المعرّف: <strong>{existing?.name}</strong>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">
          <span className="required">*</span>
          الاسم
        </label>
        <input
          className={`form-input ${errors.name ? 'error' : ''}`}
          type="text"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="اسم المعرّف (من أعلام المنطقة)"
        />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">القبيلة</label>
          <input
            className="form-input"
            type="text"
            value={form.family ?? ''}
            onChange={(e) => updateField('family', e.target.value)}
            placeholder="القبيلة أو العائلة"
          />
        </div>
        <div className="form-group">
          <label className="form-label">اسم المنطقة</label>
          <input
            className="form-input"
            type="text"
            value={form.name_place ?? ''}
            onChange={(e) => updateField('name_place', e.target.value)}
            placeholder="اسم المنطقة التي يعرفها"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">رقم الهاتف</label>
          <input
            className="form-input"
            type="text"
            value={form.phone ?? ''}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="مثال: 0770000000"
          />
        </div>
        <div className="form-group">
          <label className="form-label">رقم الواتساب</label>
          <input
            className="form-input"
            type="text"
            value={form.phone_whatapp ?? ''}
            onChange={(e) => updateField('phone_whatapp', e.target.value)}
            placeholder="مثال: 0770000000"
          />
        </div>
      </div>

      <CitySelector
        label="المدينة"
        value={form.city ?? null}
        onChange={(id) => updateField('city', id)}
      />

      <div className="form-group">
        <label className="form-label">معلومات عن المعرّف</label>
        <textarea
          className="form-textarea"
          value={form.information ?? ''}
          onChange={(e) => updateField('information', e.target.value)}
          placeholder="تفاصيل إضافية عن المعرّف..."
          rows={3}
        />
      </div>

      <div style={{ paddingTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading-spinner" /> : <Save size={16} />}
          {isEdit ? 'حفظ التعديل' : 'إضافة المعرّف'}
        </button>
      </div>
    </form>
  );
}