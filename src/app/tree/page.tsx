'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Person } from '@/types';
import { getPersonTree } from '@/lib/api';
import FamilyTree from '@/components/tree/FamilyTree';

export default function TreePage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTree = async () => {
      setIsLoading(true);
      const res = await getPersonTree();
      if (res.success && res.data) {
        setPersons(res.data);
      }
      setIsLoading(false);
    };
    
    fetchTree();
  }, []);

  const handleNodeClick = (personId: number) => {
    router.push(`/persons/${personId}`);
  };

  return (
    <div style={{ height: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="page-title">شجرة العائلة</h1>
          <div className="page-subtitle">استعرض العلاقات الهرمية (يمكنك النقر على أي شخص لعرض تفاصيله)</div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        {isLoading ? (
          <div className="loading-overlay" style={{ height: '100%', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <div className="loading-spinner lg" />
            <span>جاري بناء الشجرة...</span>
          </div>
        ) : persons.length > 0 ? (
          <FamilyTree persons={persons} onNodeClick={handleNodeClick} />
        ) : (
          <div className="empty-state" style={{ height: '100%', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <div className="empty-state-title">لا توجد بيانات</div>
            <div className="empty-state-text">لم يتم إضافة أي أشخاص للشجرة بعد.</div>
          </div>
        )}
      </div>
    </div>
  );
}
