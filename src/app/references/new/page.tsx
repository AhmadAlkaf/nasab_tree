'use client';

import { useRouter } from 'next/navigation';
import ReferenceForm from '@/components/forms/ReferenceForm';
import { usePageAccess, PERM } from '@/lib/auth';
import { UserCheck } from 'lucide-react';

export default function NewReferencePage() {
  const router = useRouter();
  const allowed = usePageAccess(PERM.reference.add);

  const handleSuccess = () => {
    router.push('/references');
  };

  if (!allowed) return null;

  return (
    <div>
      <div className="page-header" style={{ maxWidth: 800, margin: '0 auto 28px' }}>
        <div>
          <h1 className="page-title">إضافة معرّف جديد</h1>
          <div className="page-subtitle">أدخل بيانات المعرّف الجديد (من أعلام المناطق) لتسجيله في النظام</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="card-header">
          <div className="card-header-title">
            <UserCheck size={18} style={{ color: 'var(--gold-400)' }} />
            نموذج إضافة معرّف
          </div>
        </div>
        <div className="card-body">
          <ReferenceForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}