'use client';

import { useState } from 'react';
import { Wife, WifeFormData } from '@/types';
import { createWife, updateWife } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import CitySelector from './CitySelector';
import ParentSelector from './ParentSelector';
import { Save, Heart } from 'lucide-react';

interface WifeFormProps {
  personId: number;
  personName: string;
  existing?: Wife | null;
  onSuccess?: () => void;
}

export default function WifeForm({ personId, personName, existing, onSuccess }: WifeFormProps) {
  const [form, setForm] = useState<WifeFormData>(() => ({
    person: existing?.person_id ?? personId,
    the_wife: existing?.the_wife_id ?? null,
    number: existing?.number ?? null,
    name: existing?.name ?? '',
    birth_year: existing?.birth_year ?? null,
    death_year: existing?.death_year ?? null,
    birth_place: existing?.birth_place_id ?? null,
    death_place: existing?.death_place_id ?? null,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast, triggerRefresh } = useAppStore();

  const isEdit = Boolean(existing);

  const updateField = <K extends keyof WifeFormData>(key: K, value: WifeFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    const result = existing
      ? await updateWife(existing.id, form)
      : await createWife(form);

    if (result.success) {
      addToast({ type: 'success', message: isEdit ? 'تم تحديث بيانات الزوجة بنجاح' : 'تم إضافة الزوجة بنجاح' });
      triggerRefresh();
      onSuccess?.();
    } else {
      addToast({ type: 'error', message: result.error || 'حدث خطأ' });
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
        <Heart size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
        {isEdit ? `تعديل زوجة لـ: ${personName}` : `إضافة زوجة لـ: ${personName}`}
      </div>

      <ParentSelector
        label="الزوجة (من الشجرة)"
        value={form.the_wife}
        onChange={(id, person) => {
          updateField('the_wife', id);
          if (id && person && !form.name && person.gender === 'F') {
            updateField('name', person.name);
          }
        }}
        genderFilter="F"
        excludeId={personId}
        placeholder="ابحث عن الزوجة في الشجرة..."
        hint="اختر الزوجة إن كانت موجودة في الشجرة، وسيُملأ اسمها تلقائياً"
      />

      <div className="form-group">
        <label className="form-label">اسم الزوجة</label>
        <input
          className={`form-input ${errors.name ? 'error' : ''}`}
          type="text"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="أدخل اسم الزوجة"
        />
        {errors.name && <div className="form-error">{errors.name}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">الرقم</label>
        <input
          className="form-input"
          type="number"
          value={form.number ?? ''}
          onChange={(e) => updateField('number', e.target.value ? Number(e.target.value) : null)}
          placeholder="رقم الزوجة"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">سنة الميلاد</label>
          <input
            className="form-input"
            type="number"
            value={form.birth_year ?? ''}
            onChange={(e) => updateField('birth_year', e.target.value ? Number(e.target.value) : null)}
            placeholder="سنة الميلاد"
          />
        </div>
        <div className="form-group">
          <label className="form-label">سنة الوفاة</label>
          <input
            className="form-input"
            type="number"
            value={form.death_year ?? ''}
            onChange={(e) => updateField('death_year', e.target.value ? Number(e.target.value) : null)}
            placeholder="سنة الوفاة"
          />
        </div>
      </div>

      <div className="form-row">
        <CitySelector
          label="مكان الميلاد"
          value={form.birth_place}
          onChange={(id) => updateField('birth_place', id)}
        />
        <CitySelector
          label="مكان الوفاة"
          value={form.death_place}
          onChange={(id) => updateField('death_place', id)}
        />
      </div>

      <div style={{ paddingTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading-spinner" /> : <Save size={16} />}
          {isEdit ? 'حفظ التعديل' : 'إضافة الزوجة'}
        </button>
      </div>
    </form>
  );
}