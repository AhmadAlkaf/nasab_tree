'use client';

import { useState, useEffect } from 'react';
import {
  FormRequser,
  TypeForm,
  TypeFormLabels,
  Gender,
  TypeMother,
  TypeMotherLabels,
} from '@/types';
import { createFormRequser, getFormRequsersByRequser } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import CitySelector from './CitySelector';
import { Save, User, Users, Heart, MapPin, Calendar, UserPlus } from 'lucide-react';

interface FormRequserFormProps {
  requserId: number;
  onSuccess?: () => void;
}

export default function FormRequserForm({ requserId, onSuccess }: FormRequserFormProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('M');
  const [typeForm, setTypeForm] = useState<TypeForm>(TypeForm.request);
  const [parentId, setParentId] = useState<number | null>(null);
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [deathYear, setDeathYear] = useState<number | null>(null);
  const [birthPlace, setBirthPlace] = useState<number | null>(null);
  const [deathPlace, setDeathPlace] = useState<number | null>(null);
  const [nameBirthPlace, setNameBirthPlace] = useState('');
  const [namePlacePlace, setNamePlacePlace] = useState('');
  const [nameDeathPlace, setNameDeathPlace] = useState('');
  const [typeMother, setTypeMother] = useState<TypeMother>(TypeMother.unknown);
  const [nameMother, setNameMother] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [existingForms, setExistingForms] = useState<FormRequser[]>([]);

  const { addToast, triggerRefresh } = useAppStore();

  useEffect(() => {
    const fetchExistingForms = async () => {
      const res = await getFormRequsersByRequser(requserId);
      if (res.success && res.data) {
        setExistingForms(res.data);
      }
    };
    fetchExistingForms();
  }, [requserId]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, addSibling: boolean = false) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await createFormRequser({
        requser: requserId,
        name: name.trim(),
        gender,
        type_form: typeForm,
        parent: parentId,
        birth_year: birthYear,
        death_year: deathYear,
        birth_place: birthPlace,
        death_place: deathPlace,
        name_birth_place: nameBirthPlace || undefined,
        name_place_place: namePlacePlace || undefined,
        name_death_place: nameDeathPlace || undefined,
        type_mother: typeMother,
        name_mother: nameMother || undefined,
        note: note || undefined,
      });

      if (result.success) {
        addToast({
          type: 'success',
          message: addSibling ? 'تم حفظ الشخص وجاهز لإضافة ابنه' : 'تم إضافة الشخص بنجاح',
        });
        triggerRefresh();

        if (addSibling && result.data) {
          // The saved person becomes the new parent
          const res = await getFormRequsersByRequser(requserId);
          if (res.success && res.data) {
            setExistingForms(res.data);
          }
          setParentId(result.data.id);
          setName('');
          setGender('M');
          setTypeForm(TypeForm.father);
          setBirthYear(null);
          setDeathYear(null);
          setBirthPlace(null);
          setDeathPlace(null);
          setNameBirthPlace('');
          setNamePlacePlace('');
          setNameDeathPlace('');
          setNote('');
        } else {
          setName('');
          setGender('M');
          setTypeForm(TypeForm.request);
          setParentId(null);
          setBirthYear(null);
          setDeathYear(null);
          setNote('');
          onSuccess?.();
        }
      } else {
        addToast({
          type: 'error',
          message: result.error || 'حدث خطأ',
        });
      }
    } catch {
      addToast({ type: 'error', message: 'حدث خطأ غير متوقع' });
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* القسم 1: البيانات الأساسية */}
      <div className="form-section">
        <div className="form-section-title">
          <User size={18} />
          البيانات الأساسية
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="required">*</span>
            الاسم
          </label>
          <input
            className={`form-input ${errors.name ? 'error' : ''}`}
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors(prev => { const next = { ...prev }; delete next.name; return next; });
            }}
            placeholder="أدخل اسم الشخص"
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">الجنس</label>
            <select
              className="form-select"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
            >
              <option value="M">ذكر</option>
              <option value="F">أنثى</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">نوع البيانات</label>
            <select
              className="form-select"
              value={typeForm}
              onChange={(e) => setTypeForm(Number(e.target.value) as TypeForm)}
            >
              {Object.values(TypeForm)
                .filter((v): v is TypeForm => typeof v === 'number')
                .map((type) => (
                  <option key={type} value={type}>
                    {TypeFormLabels[type]}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </div>

      {/* القسم 2: الربط الهرمي */}
      <div className="form-section">
        <div className="form-section-title">
          <Users size={18} />
          الربط الهرمي
        </div>

        <div className="form-group">
          <label className="form-label">الأب (اختياري)</label>
          <select
            className="form-select"
            value={parentId ?? ''}
            onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">بدون أب (جذر)</option>
            {existingForms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.name} ({TypeFormLabels[form.type_form]})
              </option>
            ))}
          </select>
          <div className="form-hint">اختر الأب إن كان موجوداً في النموذج</div>
        </div>
      </div>

      {/* القسم 3: التواريخ */}
      <div className="form-section">
        <div className="form-section-title">
          <Calendar size={18} />
          التواريخ
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">سنة الميلاد</label>
            <input
              className="form-input"
              type="number"
              value={birthYear ?? ''}
              onChange={(e) => setBirthYear(e.target.value ? Number(e.target.value) : null)}
              placeholder="مثال: 1200"
            />
          </div>
          <div className="form-group">
            <label className="form-label">سنة الوفاة</label>
            <input
              className="form-input"
              type="number"
              value={deathYear ?? ''}
              onChange={(e) => setDeathYear(e.target.value ? Number(e.target.value) : null)}
              placeholder="مثال: 1280"
            />
          </div>
        </div>
      </div>

      {/* القسم 4: بيانات الأم */}
      <div className="form-section">
        <div className="form-section-title">
          <Heart size={18} />
          بيانات الأم
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">نوع الأم</label>
            <select
              className="form-select"
              value={typeMother}
              onChange={(e) => setTypeMother(Number(e.target.value) as TypeMother)}
            >
              {Object.values(TypeMother)
                .filter((v): v is TypeMother => typeof v === 'number')
                .map((type) => (
                  <option key={type} value={type}>
                    {TypeMotherLabels[type]}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">اسم الأم</label>
            <input
              className="form-input"
              type="text"
              value={nameMother}
              onChange={(e) => setNameMother(e.target.value)}
              placeholder="اسم الأم"
            />
          </div>
        </div>
      </div>

      {/* القسم 5: الأماكن */}
      <div className="form-section">
        <div className="form-section-title">
          <MapPin size={18} />
          الأماكن
        </div>

        <div className="form-row">
          <CitySelector
            label="مكان الميلاد"
            value={birthPlace}
            onChange={(id) => setBirthPlace(id)}
          />
          <CitySelector
            label="مكان الوفاة"
            value={deathPlace}
            onChange={(id) => setDeathPlace(id)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">مكان الميلاد (نصي)</label>
            <input
              className="form-input"
              type="text"
              value={nameBirthPlace}
              onChange={(e) => setNameBirthPlace(e.target.value)}
              placeholder="اكتب مكان الميلاد"
            />
          </div>
          <div className="form-group">
            <label className="form-label">مكان الإقامة (نصي)</label>
            <input
              className="form-input"
              type="text"
              value={namePlacePlace}
              onChange={(e) => setNamePlacePlace(e.target.value)}
              placeholder="اكتب مكان الإقامة"
            />
          </div>
          <div className="form-group">
            <label className="form-label">مكان الوفاة (نصي)</label>
            <input
              className="form-input"
              type="text"
              value={nameDeathPlace}
              onChange={(e) => setNameDeathPlace(e.target.value)}
              placeholder="اكتب مكان الوفاة"
            />
          </div>
        </div>
      </div>

      {/* القسم 6: ملاحظات */}
      <div className="form-section">
        <div className="form-section-title">
          ملاحظات
        </div>

        <div className="form-group">
          <textarea
            className="form-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="أضف ملاحظات..."
            rows={3}
          />
        </div>
      </div>

      {/* زر الإرسال */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start', paddingTop: 8 }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="loading-spinner" />
          ) : (
            <Save size={16} />
          )}
          إضافة الشخص
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={isSubmitting}
          onClick={(e) => handleSubmit(e, true)}
        >
          {isSubmitting ? (
            <span className="loading-spinner" />
          ) : (
            <UserPlus size={16} />
          )}
          حفظ وإضافة ابن
        </button>
      </div>
    </form>
  );
}
