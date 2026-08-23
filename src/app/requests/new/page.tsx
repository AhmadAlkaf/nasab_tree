'use client';

import { useRouter } from 'next/navigation';
import RequestForm from '@/components/forms/RequestForm';
import { ClipboardList } from 'lucide-react';

export default function NewRequestPage() {
  const router = useRouter();

  const handleSuccess = (requser: { id: number }) => {
    router.push(`/requests/${requser.id}`);
  };

  return (
    <div>
      <div className="page-header" style={{ maxWidth: 800, margin: '0 auto 28px' }}>
        <div>
          <h1 className="page-title">إضافة طلب جديد</h1>
          <div className="page-subtitle">أدخل بيانات الطلب الجديد لتسجيله في النظام</div>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="card-header">
          <div className="card-header-title">
            <ClipboardList size={18} style={{ color: 'var(--gold-400)' }} />
            نموذج إضافة طلب
          </div>
        </div>
        <div className="card-body">
          <RequestForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}
