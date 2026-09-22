'use client';

import { useState } from 'react';
import { StatusRequset, StatusRequsetLabels, StatusRequserDcm } from '@/types';
import { createStatusRequser, updateStatusRequser } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Save, Upload, Clock } from 'lucide-react';

interface StatusFormProps {
  requserId: number;
  existing?: StatusRequserDcm | null;
  onSuccess?: () => void;
}

export default function StatusForm({ requserId, existing, onSuccess }: StatusFormProps) {
  const [statusRequset, setStatusRequset] = useState<StatusRequset>(
    existing ? existing.status_requset : StatusRequset.Search
  );
  const [note, setNote] = useState(existing?.note ?? '');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast, triggerRefresh } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const result = existing
        ? await updateStatusRequser(existing.id, {
            status_requset: statusRequset,
            note: note || undefined,
            file: file,
          })
        : await createStatusRequser({
            requser: requserId,
            status_requset: statusRequset,
            note: note || undefined,
            file: file,
          });

      if (result.success) {
        addToast({
          type: 'success',
          message: existing ? 'تم حفظ تعديل الحالة بنجاح' : 'تم إضافة الحالة بنجاح',
        });
        triggerRefresh();
        if (!existing) {
          setNote('');
          setFile(null);
          setStatusRequset(StatusRequset.Search);
        }
        onSuccess?.();
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
      <div className="form-section">
        <div className="form-section-title">
          <Clock size={18} />
          {existing ? 'تعديل حالة' : 'إضافة حالة جديدة'}
        </div>

        <div className="form-group">
          <label className="form-label">
            <span className="required">*</span>
            الحالة
          </label>
          <select
            className="form-select"
            value={statusRequset}
            onChange={(e) => setStatusRequset(Number(e.target.value) as StatusRequset)}
          >
            {Object.values(StatusRequset)
              .filter((v): v is StatusRequset => typeof v === 'number')
              .map((status) => (
                <option key={status} value={status}>
                  {StatusRequsetLabels[status]}
                </option>
              ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">ملاحظة</label>
          <textarea
            className="form-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="أضف ملاحظة عن هذه الحالة..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label className="form-label">ملف مرفق</label>
          <label className="file-upload">
            <Upload size={24} />
            <div className="file-upload-text">
              {file ? file.name : 'اضغط لاختيار ملف'}
            </div>
            <input
              type="file"
              style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>
      </div>

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
          {existing ? 'حفظ التعديل' : 'إضافة الحالة'}
        </button>
      </div>
    </form>
  );
}
