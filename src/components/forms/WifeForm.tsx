'use client';

import { useState } from 'react';
import { WifeFormData } from '@/types';
import { createWife } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import CitySelector from './CitySelector';
import { Save, Heart } from 'lucide-react';

interface WifeFormProps {
  personId: number;
  personName: string;
  onSuccess?: () => void;
}

export default function WifeForm({ personId, personName, onSuccess }: WifeFormProps) {
  const [form, setForm] = useState<WifeFormData>({
    person_id: personId,
    the_wife_id: null,
    number: null,
    name: '',
    birth_year: null,
    death_year: null,
    birth_place_id: null,
    death_place_id: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast, triggerRefresh } = useAppStore();

  const updateField = <K extends keyof WifeFormData>(key: K, value: WifeFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => { const next = { ...prev }; delete next[key]; return next; });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'اسم الزوجة مطلوب';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await createWife(form);
    
    if (result.success) {
      addToast({ type: 'success', message: 'تم إضافة الزوجة بنجاح' });
      triggerRefresh();
      onSuccess?.();
      setForm({
        person_id: personId,
        the_wife_id: null,
        number: null,
        name: '',
        birth_year: null,
        death_year: null,
        birth_place_id: null,
        death_place_id: null,
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
        background: 'rgba(212,168,83,0.06)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-gold)',
        marginBottom: 20,
        fontSize: 13,
        color: 'var(--gold-400)',
      }}>
        <Heart size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
        إضافة زوجة لـ: <strong>{personName}</strong>
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="required">*</span>
          اسم الزوجة
        </label>
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
          value={form.birth_place_id}
          onChange={(id) => updateField('birth_place_id', id)}
        />
        <CitySelector
          label="مكان الوفاة"
          value={form.death_place_id}
          onChange={(id) => updateField('death_place_id', id)}
        />
      </div>

      <div style={{ paddingTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading-spinner" /> : <Save size={16} />}
          إضافة الزوجة
        </button>
      </div>
    </form>
  );
}
