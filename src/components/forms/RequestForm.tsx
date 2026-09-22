'use client';

import { useState } from 'react';
import {
  RequestFormData,
  Requser,
  TypeRequset,
  TypeRequsetLabels,
  TypeDocument,
  TypeDocumentLabels,
} from '@/types';
import { createRequser, updateRequser } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import CitySelector from './CitySelector';
import {
  User,
  FileText,
  Upload,
  Save,
  Phone,
  MapPin,
  CreditCard,
} from 'lucide-react';

interface RequestFormProps {
  existing?: Requser | null;
  onSuccess?: (requser: { id: number }) => void;
}

const defaultFormData: RequestFormData = {
  type_requser: TypeRequset.request,
  name_place: '',
  place: null,
  full_name: '',
  name_fiamy: '',
  name_thigh: '',
  home: '',
  type_document: TypeDocument.passport,
  signature: null,
  number_document: '',
  image_document: null,
  phone: '',
  phone_whatapp: '',
  language: 'لغة العربية',
};

export default function RequestForm({ existing, onSuccess }: RequestFormProps) {
  const [form, setForm] = useState<RequestFormData>(() => {
    if (existing) {
      return {
        type_requser: existing.type_requser,
        name_place: existing.name_place ?? '',
        place: existing.place_id,
        full_name: existing.full_name,
        name_fiamy: existing.name_fiamy,
        name_thigh: existing.name_thigh,
        home: existing.home,
        type_document: existing.type_document,
        signature: null,
        number_document: existing.number_document,
        image_document: null,
        phone: existing.phone ?? '',
        phone_whatapp: existing.phone_whatapp ?? '',
        language: existing.language,
      };
    }
    return { ...defaultFormData };
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast, triggerRefresh } = useAppStore();

  const updateField = <K extends keyof RequestFormData>(key: K, value: RequestFormData[K]) => {
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

    if (!form.full_name.trim()) {
      newErrors.full_name = 'الاسم الكامل مطلوب';
    }
    if (!form.name_fiamy.trim()) {
      newErrors.name_fiamy = 'اسم القبيلة مطلوب';
    }
    if (!form.name_thigh.trim()) {
      newErrors.name_thigh = 'اسم الفخيدة مطلوب';
    }
    if (!form.home.trim()) {
      newErrors.home = 'اسم البيت مطلوب';
    }
    if (!form.number_document.trim()) {
      newErrors.number_document = 'رقم الوثيقة مطلوب';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = existing
        ? await updateRequser(existing.id, form)
        : await createRequser(form);

      if (result.success && result.data) {
        addToast({
          type: 'success',
          message: existing ? 'تم حفظ تعديل الطلب بنجاح' : 'تم إضافة الطلب بنجاح',
        });
        triggerRefresh();
        onSuccess?.(result.data);
        if (!existing) setForm({ ...defaultFormData });
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
      {/* القسم 1: نوع الطلب */}
      <div className="form-section">
        <div className="form-section-title">
          <FileText size={18} />
          نوع الطلب
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="required">*</span>
            نوع الطلب
          </label>
          <select
            className="form-select"
            value={form.type_requser}
            onChange={(e) => updateField('type_requser', Number(e.target.value) as TypeRequset)}
          >
            {Object.values(TypeRequset)
              .filter((v): v is TypeRequset => typeof v === 'number')
              .map((type) => (
                <option key={type} value={type}>
                  {TypeRequsetLabels[type]}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* القسم 2: البيانات الأساسية */}
      <div className="form-section">
        <div className="form-section-title">
          <User size={18} />
          البيانات الأساسية
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="required">*</span>
            الاسم الكامل (اسم النسب)
          </label>
          <input
            className={`form-input ${errors.full_name ? 'error' : ''}`}
            type="text"
            value={form.full_name}
            onChange={(e) => updateField('full_name', e.target.value)}
            placeholder="أدخل الاسم الكامل如: أحمد بن محمد بن علي"
          />
          {errors.full_name && <div className="form-error">{errors.full_name}</div>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span>
              القبيلة
            </label>
            <input
              className={`form-input ${errors.name_fiamy ? 'error' : ''}`}
              type="text"
              value={form.name_fiamy}
              onChange={(e) => updateField('name_fiamy', e.target.value)}
              placeholder="اسم القبيلة"
            />
            {errors.name_fiamy && <div className="form-error">{errors.name_fiamy}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span>
              الفخيدة
            </label>
            <input
              className={`form-input ${errors.name_thigh ? 'error' : ''}`}
              type="text"
              value={form.name_thigh}
              onChange={(e) => updateField('name_thigh', e.target.value)}
              placeholder="اسم الفخيدة"
            />
            {errors.name_thigh && <div className="form-error">{errors.name_thigh}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span>
              البيت
            </label>
            <input
              className={`form-input ${errors.home ? 'error' : ''}`}
              type="text"
              value={form.home}
              onChange={(e) => updateField('home', e.target.value)}
              placeholder="اسم البيت"
            />
            {errors.home && <div className="form-error">{errors.home}</div>}
          </div>
          <div className="form-group">
            <label className="form-label">اللغة</label>
            <input
              className="form-input"
              type="text"
              value={form.language}
              onChange={(e) => updateField('language', e.target.value)}
              placeholder="لغة المسجل"
            />
          </div>
        </div>
      </div>

      {/* القسم 3: المنطقة */}
      <div className="form-section">
        <div className="form-section-title">
          <MapPin size={18} />
          المنطقة
        </div>

        <div className="form-row">
          <CitySelector
            label="المنطقة"
            value={form.place}
            onChange={(id) => updateField('place', id)}
          />
          <div className="form-group">
            <label className="form-label">اسم المنطقة (نصي)</label>
            <input
              className="form-input"
              type="text"
              value={form.name_place}
              onChange={(e) => updateField('name_place', e.target.value)}
              placeholder="اكتب اسم المنطقة إن لم تكن في القائمة"
            />
          </div>
        </div>
      </div>

      {/* القسم 4: الوثيقة */}
      <div className="form-section">
        <div className="form-section-title">
          <CreditCard size={18} />
          بيانات الوثيقة
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">نوع الوثيقة</label>
            <select
              className="form-select"
              value={form.type_document}
              onChange={(e) => updateField('type_document', Number(e.target.value) as TypeDocument)}
            >
              {Object.values(TypeDocument)
                .filter((v): v is TypeDocument => typeof v === 'number')
                .map((type) => (
                  <option key={type} value={type}>
                    {TypeDocumentLabels[type]}
                  </option>
                ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">
              <span className="required">*</span>
              رقم الوثيقة
            </label>
            <input
              className={`form-input ${errors.number_document ? 'error' : ''}`}
              type="text"
              value={form.number_document}
              onChange={(e) => updateField('number_document', e.target.value)}
              placeholder="رقم الوثيقة"
            />
            {errors.number_document && <div className="form-error">{errors.number_document}</div>}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">صورة الوثيقة</label>
            <label className="file-upload">
              <Upload size={24} />
              <div className="file-upload-text">
                {form.image_document ? form.image_document.name : 'اضغط لاختيار صورة الوثيقة'}
              </div>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => updateField('image_document', e.target.files?.[0] || null)}
              />
            </label>
          </div>
          <div className="form-group">
            <label className="form-label">التوقيع</label>
            <label className="file-upload">
              <Upload size={24} />
              <div className="file-upload-text">
                {form.signature ? form.signature.name : 'اضغط لاختيار صورة التوقيع'}
              </div>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => updateField('signature', e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>
      </div>

      {/* القسم 5: معلومات الاتصال */}
      <div className="form-section">
        <div className="form-section-title">
          <Phone size={18} />
          معلومات الاتصال
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">رقم الهاتف</label>
            <input
              className="form-input"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="رقم الهاتف"
            />
          </div>
          <div className="form-group">
            <label className="form-label">رقم واتساب</label>
            <input
              className="form-input"
              type="tel"
              value={form.phone_whatapp}
              onChange={(e) => updateField('phone_whatapp', e.target.value)}
              placeholder="رقم واتساب"
            />
          </div>
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
          {existing ? 'حفظ التعديل' : 'إضافة الطلب'}
        </button>
      </div>
    </form>
  );
}
