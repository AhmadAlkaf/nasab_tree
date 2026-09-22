'use client';

import { useState } from 'react';
import { Group, Permission } from '@/types';
import { createAdminGroup, updateAdminGroup } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Save, Shield, Search } from 'lucide-react';

interface GroupFormProps {
  existing?: Group | null;
  permissions: Permission[];
  onSuccess?: () => void;
}

export default function GroupForm({ existing, permissions, onSuccess }: GroupFormProps) {
  const [name, setName] = useState(existing?.name ?? '');
  const [selected, setSelected] = useState<number[]>(existing?.permissions ?? []);
  const [permQuery, setPermQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast, triggerRefresh } = useAppStore();

  const isEdit = Boolean(existing);

  const togglePermission = (id: number) => {
    setSelected(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const filtered = permissions.filter(p =>
    p.name.toLowerCase().includes(permQuery.toLowerCase()) ||
    p.codename.toLowerCase().includes(permQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('اسم المجموعة مطلوب');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const result = existing
        ? await updateAdminGroup(existing.id, { name: name.trim(), permissions: selected })
        : await createAdminGroup({ name: name.trim(), permissions: selected });

      if (result.success && result.data) {
        addToast({ type: 'success', message: isEdit ? 'تم حفظ تعديل المجموعة' : 'تم إنشاء المجموعة بنجاح' });
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
        <Shield size={14} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: 6 }} />
        {isEdit ? `تعديل المجموعة: ${existing?.name}` : 'إنشاء مجموعة جديدة'}
      </div>

      <div className="form-group">
        <label className="form-label">
          <span className="required">*</span>
          اسم المجموعة
        </label>
        <input
          className={`form-input ${error ? 'error' : ''}`}
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(null); }}
          placeholder="مثال: مدير النظام"
        />
        {error && <div className="form-error">{error}</div>}
      </div>

      <div className="form-group">
        <label className="form-label">الصلاحيات ({selected.length} مختارة)</label>
        <div className="search-wrapper" style={{ marginBottom: 8 }}>
          <Search className="search-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="ابحث في الصلاحيات..."
            value={permQuery}
            onChange={(e) => setPermQuery(e.target.value)}
          />
        </div>
        {filtered.length === 0 ? (
          <div className="form-hint">لا توجد صلاحيات مطابقة</div>
        ) : (
          <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 8 }}>
            {filtered.map(perm => (
              <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px', cursor: 'pointer', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={selected.includes(perm.id)}
                  onChange={() => togglePermission(perm.id)}
                />
                <span>{perm.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start', paddingTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading-spinner" /> : <Save size={16} />}
          {isEdit ? 'حفظ التعديل' : 'إنشاء المجموعة'}
        </button>
      </div>
    </form>
  );
}