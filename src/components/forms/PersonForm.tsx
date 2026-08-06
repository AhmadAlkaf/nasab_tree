'use client';

import { useState, useEffect } from 'react';
import {
  Person,
  PersonFormData,
  TypePerson,
  TypePersonLabels,
  TypePersonDescriptions,
  TypeMother,
  TypeMotherLabels,
  Gender,
} from '@/types';
import { createPerson, updatePerson } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import ParentSelector from './ParentSelector';
import CitySelector from './CitySelector';
import {
  User,
  Calendar,
  MapPin,
  FileText,
  Upload,
  Save,
  Users,
  Heart,
  Tag,
  UserPlus,
} from 'lucide-react';

interface PersonFormProps {
  person?: Person | null;
  onSuccess?: (person: Person) => void;
  defaultParentId?: number;
}

const defaultFormData: PersonFormData = {
  name: '',
  kunya: '',
  title: '',
  gender: 'M',
  parent: null,
  type_person: TypePerson.included_extinct_females_only,
  birth_year: null,
  death_year: null,
  number: null,
  birth_place: null,
  death_place: null,
  mother: null,
  type_mother: TypeMother.alawi,
  number_mother: null,
  name_mother: '',
  name_birth_place: '',
  name_place_place: '',
  name_death_place: '',
  note: '',
  file: null,
};

export default function PersonForm({ person, onSuccess, defaultParentId }: PersonFormProps) {
  const [form, setForm] = useState<PersonFormData>({ ...defaultFormData });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast, triggerRefresh } = useAppStore();
  const isEditing = !!person;

  useEffect(() => {
    if (person) {
      setForm({
        name: person.name,
        kunya: person.kunya,
        title: person.title,
        gender: person.gender,
        parent: person.parent_id,
        type_person: person.type_person,
        birth_year: person.birth_year,
        death_year: person.death_year,
        number: person.number,
        birth_place: person.birth_place_id,
        death_place: person.death_place_id,
        mother: person.mother_id,
        type_mother: person.type_mother,
        number_mother: person.number_mother,
        name_mother: person.name_mother,
        name_birth_place: person.name_birth_place,
        name_place_place: person.name_place_place,
        name_death_place: person.name_death_place,
        note: person.note,
        file: null,
      });
    } else if (defaultParentId) {
      setForm(prev => ({ ...prev, parent: defaultParentId }));
    }
  }, [person, defaultParentId]);

  const updateField = <K extends keyof PersonFormData>(key: K, value: PersonFormData[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!form.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }
    
    if (form.birth_year && form.death_year && form.birth_year > form.death_year) {
      newErrors.death_year = 'سنة الوفاة يجب أن تكون بعد سنة الميلاد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent, addAnother: boolean = false) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      let result;
      if (isEditing && person) {
        result = await updatePerson(person.id, form);
      } else {
        result = await createPerson(form);
      }
      
      if (result.success && result.data) {
        addToast({
          type: 'success',
          message: isEditing ? 'تم تحديث البيانات بنجاح' : 'تم إضافة الشخص بنجاح',
        });
        triggerRefresh();
        
        if (addAnother) {
          setForm({ 
            ...defaultFormData, 
            parent: form.parent,
            mother: form.mother,
            type_person: form.type_person,
            type_mother: form.type_mother 
          });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          onSuccess?.(result.data);
          if (!isEditing) {
            setForm({ ...defaultFormData, parent: defaultParentId || null });
          }
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
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="أدخل اسم الشخص"
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">الكنية</label>
            <input
              className="form-input"
              type="text"
              value={form.kunya}
              onChange={(e) => updateField('kunya', e.target.value)}
              placeholder="مثال: أبو محمد"
            />
          </div>
          <div className="form-group">
            <label className="form-label">اللقب</label>
            <input
              className="form-input"
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="مثال: الشيخ"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">الجنس</label>
            <select
              className="form-select"
              value={form.gender}
              onChange={(e) => updateField('gender', e.target.value as Gender)}
            >
              <option value="M">ذكر</option>
              <option value="F">أنثى</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">نوع الشخص</label>
            <select
              className="form-select"
              value={form.type_person}
              onChange={(e) => updateField('type_person', Number(e.target.value) as TypePerson)}
            >
              {Object.values(TypePerson)
                .filter((v): v is TypePerson => typeof v === 'number')
                .map((type) => (
                  <option key={type} value={type}>
                    {TypePersonLabels[type]} - {TypePersonDescriptions[type]}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {form.gender === 'F' && (
          <div className="form-group">
            <label className="form-label">عدد البنات</label>
            <input
              className="form-input"
              type="number"
              value={form.number ?? ''}
              onChange={(e) => updateField('number', e.target.value ? Number(e.target.value) : null)}
              placeholder="عدد البنات"
            />
          </div>
        )}
      </div>

      {/* القسم 2: التواريخ */}
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
              value={form.birth_year ?? ''}
              onChange={(e) => updateField('birth_year', e.target.value ? Number(e.target.value) : null)}
              placeholder="مثال: 1200"
            />
          </div>
          <div className="form-group">
            <label className="form-label">سنة الوفاة</label>
            <input
              className={`form-input ${errors.death_year ? 'error' : ''}`}
              type="number"
              value={form.death_year ?? ''}
              onChange={(e) => updateField('death_year', e.target.value ? Number(e.target.value) : null)}
              placeholder="مثال: 1280"
            />
            {errors.death_year && <div className="form-error">{errors.death_year}</div>}
          </div>
        </div>
      </div>

      {/* القسم 3: الربط الهرمي */}
      <div className="form-section">
        <div className="form-section-title">
          <Users size={18} />
          الربط الهرمي
        </div>
        
        <ParentSelector
          label="الأب"
          value={form.parent}
          onChange={(id) => updateField('parent', id)}
          genderFilter="M"
          excludeId={person?.id}
          placeholder="ابحث عن الأب..."
          hint="اختر أب الشخص من الشجرة"
        />

        <ParentSelector
          label="الأم"
          value={form.mother}
          onChange={(id) => updateField('mother', id)}
          genderFilter="F"
          excludeId={person?.id}
          placeholder="ابحث عن الأم..."
          hint="اختر الأم إن كانت موجودة في الشجرة"
        />
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
              value={form.type_mother}
              onChange={(e) => updateField('type_mother', Number(e.target.value) as TypeMother)}
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
            <label className="form-label">رقم الأم</label>
            <input
              className="form-input"
              type="number"
              value={form.number_mother ?? ''}
              onChange={(e) => updateField('number_mother', e.target.value ? Number(e.target.value) : null)}
              placeholder="رقم الأم (إن كانت من خارج الشجرة)"
            />
            <div className="form-hint">رقم إذا كانت من خارج الشجرة يُعطى لها رقم ويُكتب لابنها</div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">اسم الأم</label>
          <input
            className="form-input"
            type="text"
            value={form.name_mother}
            onChange={(e) => updateField('name_mother', e.target.value)}
            placeholder="اسم الأم إن كانت غير معروف عمود نسبها"
          />
          <div className="form-hint">يُستخدم إذا كانت غير معروف عمود نسبها وتُعرف بنسبها</div>
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
            value={form.birth_place}
            onChange={(id) => updateField('birth_place', id)}
          />
          <CitySelector
            label="مكان الوفاة"
            value={form.death_place}
            onChange={(id) => updateField('death_place', id)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">مكان الميلاد (نصي)</label>
            <input
              className="form-input"
              type="text"
              value={form.name_birth_place}
              onChange={(e) => updateField('name_birth_place', e.target.value)}
              placeholder="اكتب مكان الميلاد إن لم يكن في القائمة"
            />
          </div>
          <div className="form-group">
            <label className="form-label">مكان الإقامة (نصي)</label>
            <input
              className="form-input"
              type="text"
              value={form.name_place_place}
              onChange={(e) => updateField('name_place_place', e.target.value)}
              placeholder="اكتب مكان الإقامة"
            />
          </div>
          <div className="form-group">
            <label className="form-label">مكان الوفاة (نصي)</label>
            <input
              className="form-input"
              type="text"
              value={form.name_death_place}
              onChange={(e) => updateField('name_death_place', e.target.value)}
              placeholder="اكتب مكان الوفاة إن لم يكن في القائمة"
            />
          </div>
        </div>
      </div>

      {/* القسم 6: ملاحظات وملفات */}
      <div className="form-section">
        <div className="form-section-title">
          <FileText size={18} />
          ملاحظات وملفات
        </div>
        
        <div className="form-group">
          <label className="form-label">ملاحظات</label>
          <textarea
            className="form-textarea"
            value={form.note}
            onChange={(e) => updateField('note', e.target.value)}
            placeholder="أضف ملاحظات عن الشخص..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <Tag size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 4 }} />
            ملفات حكومية
          </label>
          <label className="file-upload">
            <Upload size={28} />
            <div className="file-upload-text">
              {form.file ? form.file.name : 'اضغط لاختيار ملف أو اسحبه هنا'}
            </div>
            <div className="file-upload-hint">PDF, صور، أو مستندات</div>
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
      </div>

      {/* زر الإرسال */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start', paddingTop: 8 }}>
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="loading-spinner" />
          ) : (
            <Save size={18} />
          )}
          {isEditing ? 'تحديث البيانات' : 'إضافة الشخص'}
        </button>
        
        {!isEditing && (
          <button
            type="button"
            className="btn btn-secondary btn-lg"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading-spinner" />
            ) : (
              <UserPlus size={18} />
            )}
            حفظ وإضافة ابن آخر
          </button>
        )}
      </div>
    </form>
  );
}
