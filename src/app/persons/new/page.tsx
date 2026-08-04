'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PersonForm from '@/components/forms/PersonForm';
import { UserPlus } from 'lucide-react';

function NewPersonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultParentId = searchParams.get('parent_id') 
    ? parseInt(searchParams.get('parent_id') as string, 10) 
    : undefined;

  const handleSuccess = (person: any) => {
    // Navigate to the newly created person's details page
    router.push(`/persons/${person.id}`);
  };

  return (
    <div className="card" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="card-header">
        <div className="card-header-title">
          <UserPlus size={18} style={{ color: 'var(--gold-400)' }} />
          نموذج إضافة شخص جديد
        </div>
      </div>
      <div className="card-body">
        <PersonForm 
          onSuccess={handleSuccess} 
          defaultParentId={defaultParentId}
        />
      </div>
    </div>
  );
}

export default function NewPersonPage() {
  return (
    <div>
      <div className="page-header" style={{ maxWidth: 800, margin: '0 auto 28px' }}>
        <div>
          <h1 className="page-title">إضافة شخص</h1>
          <div className="page-subtitle">أدخل بيانات الفرد الجديد لإضافته إلى الشجرة النسبية</div>
        </div>
      </div>

      <Suspense fallback={
        <div className="loading-overlay">
          <div className="loading-spinner lg" />
        </div>
      }>
        <NewPersonContent />
      </Suspense>
    </div>
  );
}
