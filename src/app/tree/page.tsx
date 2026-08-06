'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Person } from '@/types';
import { getPersonTree } from '@/lib/api';
import FamilyTree from '@/components/tree/FamilyTree';
import Modal from '@/components/ui/Modal';
import PersonForm from '@/components/forms/PersonForm';
import { UserPlus } from 'lucide-react';

function TreeContent() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [addChildParentId, setAddChildParentId] = useState<number | undefined>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rootId = searchParams.get('root') ? parseInt(searchParams.get('root')!, 10) : undefined;

  useEffect(() => {
    const fetchTree = async () => {
      setIsLoading(true);
      const res = await getPersonTree(rootId);
      if (res.success && res.data) {
        setPersons(res.data);
      }
      setIsLoading(false);
    };
    
    fetchTree();
  }, [rootId]);

  const handleNodeClick = (personId: number) => {
    router.push(`/persons/${personId}`);
  };

  const handleAddChild = (personId: number) => {
    setAddChildParentId(personId);
    setIsAddChildModalOpen(true);
  };

  const handlePersonAdded = () => {
    setIsAddChildModalOpen(false);
    // Refresh the tree
    const fetchTree = async () => {
      setIsLoading(true);
      const res = await getPersonTree(rootId);
      if (res.success && res.data) {
        setPersons(res.data);
      }
      setIsLoading(false);
    };
    fetchTree();
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
          <FamilyTree persons={persons} onNodeClick={handleNodeClick} onAddChild={handleAddChild} />
        ) : (
          <div className="empty-state" style={{ height: '100%', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
            <div className="empty-state-title">لا توجد بيانات</div>
            <div className="empty-state-text">لم يتم إضافة أي أشخاص للشجرة بعد.</div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddChildModalOpen}
        onClose={() => setIsAddChildModalOpen(false)}
        title="إضافة ابن جديد"
        size="lg"
        icon={<UserPlus size={20} style={{ color: 'var(--blue-400)' }} />}
      >
        <PersonForm 
          defaultParentId={addChildParentId}
          onSuccess={handlePersonAdded} 
        />
      </Modal>
    </div>
  );
}

export default function TreePage() {
  return (
    <Suspense fallback={
      <div className="loading-overlay" style={{ height: 'calc(100vh - 48px)' }}>
        <div className="loading-spinner lg" />
        <span>جاري تحميل الصفحة...</span>
      </div>
    }>
      <TreeContent />
    </Suspense>
  );
}
