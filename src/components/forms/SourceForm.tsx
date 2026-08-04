'use client';

import { useState } from 'react';
import { SourceFormData } from '@/types';
import { createSource } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Save, Book, Upload, Tag } from 'lucide-react';

interface SourceFormProps {
  personId: number;
  personName: string;
  onSuccess?: () => void;
}

export default function SourceForm({ personId, personName, onSuccess }: SourceFormProps) {
  const [form, setForm] = useState<SourceFormData>({
    person_id: personId,
    name: '',
    capt_number: '',
    shelf_number: '',
    volume_number: '',
    manuscript_number: '',
    page_number: '',
    file: null,
    is_primary: false,
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast, triggerRefresh } = useAppStore();

  const updateField = <K extends keyof SourceFormData>(key: K, value: SourceFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'اسم المصدر مطلوب';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await createSource(form);
    
    if (result.success) {
      addToast({ type: 'success', message: 'تم إضافة المصدر بنجاح' });
      triggerRefresh();
      onSuccess?.();
      setForm({
        person_id: personId,
        name: '',
        capt_number: '',
        shelf_number: '',
        volume_number: '',
        manuscript_number: '',
        page_number: '',
        file: null,
        is_primary: false,
        description: '',
      });
    } else {
      addToast({ type: 'error', message: result.error || 'حدث خطأ' });
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ 
        padding: '10px 14px',
        background: 'rgba(59,130,246,0.06)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(59,130,246,0.2)',
        marginBottom: 20,
        fontSize: 13,
        color: 'var(--blue-400)',
      }}>
        <Book size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
        إضافة مصدر لـ: <strong>{personName}</strong>
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="required">*</span>
          اسم المصدر
        </label>
        <input
          className={`form-input ${errors.name ? 'error' : ''}`}
          type="text"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="أدخل اسم المصدر (كتاب، مخطوطة، وثيقة...)"
        />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">رقم الحفظ</label>
          <input
            className="form-input"
            type="text"
            value={form.capt_number}
            onChange={(e) => updateField('capt_number', e.target.value)}
            placeholder="مثال: 102"
          />
        </div>
        <div className="form-group">
          <label className="form-label">رقم الرف</label>
          <input
            className="form-input"
            type="text"
            value={form.shelf_number}
            onChange={(e) => updateField('shelf_number', e.target.value)}
            placeholder="مثال: أ-3"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">رقم المجلد</label>
          <input
            className="form-input"
            type="text"
            value={form.volume_number}
            onChange={(e) => updateField('volume_number', e.target.value)}
            placeholder="مثال: 1"
          />
        </div>
        <div className="form-group">
          <label className="form-label">رقم المخطوطة</label>
          <input
            className="form-input"
            type="text"
            value={form.manuscript_number}
            onChange={(e) => updateField('manuscript_number', e.target.value)}
            placeholder="مثال: 45"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">رقم الصفحة</label>
        <input
          className="form-input"
          type="text"
          value={form.page_number}
          onChange={(e) => updateField('page_number', e.target.value)}
          placeholder="رقم الصفحة في المصدر"
        />
      </div>

      <div className="form-group">
        <div className="toggle-wrapper" onClick={() => updateField('is_primary', !form.is_primary)}>
          <div className={`toggle ${form.is_primary ? 'active' : ''}`} />
          <span className="toggle-label">مصدر أصلي (ليس نقلاً عن مصدر آخر)</span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">وصف المصدر</label>
        <textarea
          className="form-textarea"
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          placeholder="تفاصيل إضافية حول المصدر..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label className="form-label">
          <Tag size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
          ملف المصدر
        </label>
        <label className="file-upload" style={{ padding: '16px' }}>
          <Upload size={24} />
          <div className="file-upload-text" style={{ fontSize: 12 }}>
            {form.file ? form.file.name : 'اختر ملف PDF أو صورة للمصدر'}
          </div>
          <input
            type="file"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              updateField('file', file);
            }}
          />
        </label>
      </div>

      <div style={{ paddingTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading-spinner" /> : <Save size={16} />}
          إضافة المصدر
        </button>
      </div>
    </form>
  );
}
