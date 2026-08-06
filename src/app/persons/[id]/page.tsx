'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Person, Wife, Source, GenderLabels, TypePersonLabels, TypeMotherLabels } from '@/types';
import { getPerson, deletePerson } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import MiniTree from '@/components/tree/MiniTree';
import Modal from '@/components/ui/Modal';
import PersonForm from '@/components/forms/PersonForm';
import WifeForm from '@/components/forms/WifeForm';
import SourceForm from '@/components/forms/SourceForm';
import {
  User, Edit, Trash2, GitBranch, Heart, Book, MapPin, Calendar, FileText, Download
} from 'lucide-react';
import { truncateLineageName } from '@/lib/utils';

export default function PersonDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const personId = parseInt(resolvedParams.id, 10);
  
  const [person, setPerson] = useState<Person | null>(null);
  const [wives, setWives] = useState<Wife[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWifeModalOpen, setIsWifeModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const { refreshKey, addToast } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const personRes = await getPerson(personId);
      
      if (personRes.success && personRes.data) {
        setPerson(personRes.data);
        setWives(personRes.data.wives || []);
        setSources(personRes.data.sources || []);
      } else {
        addToast({ type: 'error', message: 'لم يتم العثور على الشخص' });
        router.push('/persons');
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [personId, refreshKey, router, addToast]);

  const handleDelete = async () => {
    const res = await deletePerson(personId);
    if (res.success) {
      addToast({ type: 'success', message: 'تم حذف الشخص بنجاح' });
      router.push('/persons');
    } else {
      addToast({ type: 'error', message: res.error || 'حدث خطأ أثناء الحذف' });
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="loading-overlay" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="loading-spinner lg" />
        <span>جاري تحميل بيانات الشخص...</span>
      </div>
    );
  }

  if (!person) return null;

  const isMale = person.gender === 'M';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">تفاصيل السجل</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(true)}>
            <Edit size={16} />
            تعديل البيانات
          </button>
          <button className="btn btn-danger" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 size={16} />
            حذف السجل
          </button>
        </div>
      </div>

      <div className="person-hero">
        <div className={`person-avatar ${isMale ? 'male' : 'female'}`}>
          <User size={40} />
        </div>
        <div className="person-info" style={{ flex: 1 }}>
          <h1>
            {truncateLineageName(person.lineage_name || person.name)} {person.title && <span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>({person.title})</span>}
          </h1>
          {person.kunya && <div style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{person.kunya}</div>}
          
          <div className="person-info-meta">
            <span className={`badge ${isMale ? 'blue' : 'pink'}`}>{GenderLabels[person.gender]}</span>
            <span className="badge muted">{TypePersonLabels[person.type_person]}</span>
            {(person.birth_year || person.death_year) && (
              <span className="badge muted">
                <Calendar size={12} />
                {person.birth_year ? person.birth_year : '?'} - {person.death_year ? person.death_year : '?'}
              </span>
            )}
            {person.birth_place && (
              <span className="badge muted">
                <MapPin size={12} />
                مواليد {person.birth_place.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* التفاصيل الأساسية */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title">
                <User size={18} style={{ color: 'var(--gold-400)' }} />
                المعلومات التفصيلية
              </div>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-item-label">الأب</div>
                  <div className="info-item-value">
                    {person.parent ? (
                      <span 
                        style={{ color: 'var(--gold-400)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={() => router.push(`/persons/${person.parent_id}`)}
                      >
                        <User size={14} />
                        {person.parent.name}
                      </span>
                    ) : 'غير محدد'}
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-item-label">الأم</div>
                  <div className="info-item-value">
                    {person.mother ? (
                      <span 
                        style={{ color: 'var(--pink-400)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                        onClick={() => router.push(`/persons/${person.mother_id}`)}
                      >
                        <User size={14} />
                        {person.mother.name}
                      </span>
                    ) : person.name_mother ? (
                      <span>{person.name_mother}</span>
                    ) : 'غير محدد'}
                  </div>
                </div>
                
                <div className="info-item">
                  <div className="info-item-label">نوع الأم</div>
                  <div className="info-item-value">{TypeMotherLabels[person.type_mother]}</div>
                </div>
                
                {person.gender === 'F' && person.number !== null && (
                  <div className="info-item">
                    <div className="info-item-label">عدد البنات</div>
                    <div className="info-item-value">{person.number}</div>
                  </div>
                )}
                
                {person.death_place && (
                  <div className="info-item">
                    <div className="info-item-label">مكان الوفاة</div>
                    <div className="info-item-value">{person.death_place.name}</div>
                  </div>
                )}
              </div>
              
              {person.note && (
                <div style={{ marginTop: 24, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={14} />
                    ملاحظات
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {person.note}
                  </div>
                </div>
              )}
              
              {person.file && (
                <div style={{ marginTop: 16 }}>
                  <button className="btn btn-secondary btn-sm">
                    <Download size={14} />
                    تحميل الملف المرفق
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* الزوجات */}
          {isMale && (
            <div className="card">
              <div className="card-header">
                <div className="card-header-title">
                  <Heart size={18} style={{ color: 'var(--pink-400)' }} />
                  الزوجات
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setIsWifeModalOpen(true)}>
                  + إضافة زوجة
                </button>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {wives.length === 0 ? (
                  <div className="empty-state" style={{ padding: '30px 20px' }}>
                    <div className="empty-state-text" style={{ marginBottom: 0 }}>لا يوجد زوجات مسجلات</div>
                  </div>
                ) : (
                  <div>
                    {wives.map(wife => (
                      <div key={wife.id} className="list-item">
                        <div className="list-item-avatar" style={{ background: 'rgba(236,72,153,0.1)', color: 'var(--pink-400)' }}>
                          <Heart size={16} />
                        </div>
                        <div className="list-item-content">
                          <div className="list-item-title">{wife.name}</div>
                          <div className="list-item-subtitle">
                            {(wife.birth_year || wife.death_year) && `${wife.birth_year || '?'} - ${wife.death_year || '?'}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* المصادر */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title">
                <Book size={18} style={{ color: 'var(--blue-400)' }} />
                المصادر والوثائق
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsSourceModalOpen(true)}>
                + إضافة مصدر
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {sources.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 20px' }}>
                  <div className="empty-state-text" style={{ marginBottom: 0 }}>لا يوجد مصادر مسجلة</div>
                </div>
              ) : (
                <div>
                  {sources.map(source => (
                    <div key={source.id} className="list-item">
                      <div className="list-item-avatar" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--blue-400)' }}>
                        <Book size={16} />
                      </div>
                      <div className="list-item-content">
                        <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          {source.name}
                          {source.is_primary && <span className="badge gold" style={{ fontSize: 9, padding: '1px 6px' }}>أصلي</span>}
                        </div>
                        <div className="list-item-subtitle" style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                          {source.capt_number && <span>حفظ: {source.capt_number}</span>}
                          {source.volume_number && <span>مجلد: {source.volume_number}</span>}
                          {source.page_number && <span>صفحة: {source.page_number}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* العمود الجانبي */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* شجرة مصغرة */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title">
                <GitBranch size={18} style={{ color: 'var(--emerald-400)' }} />
                الموقع في الشجرة
              </div>
            </div>
            <div className="card-body" style={{ background: 'var(--bg-secondary)', padding: 0 }}>
              <MiniTree 
                person={person} 
                parent={person.parent} 
                grandparent={person.parent?.parent} 
              />
            </div>
            <div className="card-footer" style={{ justifyContent: 'center' }}>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => router.push(`/tree?root=${person.id}`)}
              >
                عرض في الشجرة الكاملة
              </button>
            </div>
          </div>
          
          {/* أبناء */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title">
                <User size={18} style={{ color: 'var(--amber-400)' }} />
                الأبناء ({person.children?.length || 0})
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {!person.children || person.children.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 20px' }}>
                  <div className="empty-state-text" style={{ marginBottom: 0 }}>لا يوجد أبناء مسجلين</div>
                </div>
              ) : (
                <div>
                  {person.children.map(child => (
                    <div 
                      key={child.id} 
                      className="list-item"
                      onClick={() => router.push(`/persons/${child.id}`)}
                    >
                      <div className="list-item-content">
                        <div className="list-item-title">{child.name}</div>
                      </div>
                      <span className={`badge ${child.gender === 'M' ? 'blue' : 'pink'}`}>
                        {GenderLabels[child.gender]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card-footer" style={{ justifyContent: 'center' }}>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => router.push(`/persons/new?parent_id=${person.id}`)}
              >
                + إضافة ابن جديد
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* النوافذ المنبثقة */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="تعديل بيانات الشخص"
        size="lg"
        icon={<Edit size={20} style={{ color: 'var(--gold-400)' }} />}
      >
        <PersonForm 
          person={person} 
          onSuccess={() => setIsEditModalOpen(false)} 
        />
      </Modal>

      <Modal
        isOpen={isWifeModalOpen}
        onClose={() => setIsWifeModalOpen(false)}
        title="إضافة زوجة جديدة"
        icon={<Heart size={20} style={{ color: 'var(--pink-400)' }} />}
      >
        <WifeForm 
          personId={person.id} 
          personName={person.name} 
          onSuccess={() => setIsWifeModalOpen(false)} 
        />
      </Modal>

      <Modal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        title="إضافة مصدر/وثيقة"
        icon={<Book size={20} style={{ color: 'var(--blue-400)' }} />}
      >
        <SourceForm 
          personId={person.id} 
          personName={person.name} 
          onSuccess={() => setIsSourceModalOpen(false)} 
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="تأكيد الحذف"
      >
        <div className="confirm-dialog">
          <div className="confirm-icon">
            <Trash2 size={28} />
          </div>
          <div className="confirm-title">هل أنت متأكد من حذف هذا السجل؟</div>
          <div className="confirm-text">
            حذف <strong>{person.name}</strong> لا يمكن التراجع عنه.
            {person.children && person.children.length > 0 && (
              <div style={{ color: 'var(--red-400)', marginTop: 8, fontWeight: 600 }}>
                تحذير: لا يمكن حذف شخص لديه أبناء مسجلين.
              </div>
            )}
          </div>
          <div className="confirm-actions">
            <button className="btn btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>
              إلغاء
            </button>
            <button 
              className="btn btn-danger" 
              onClick={handleDelete}
              disabled={person.children && person.children.length > 0}
            >
              نعم، تأكيد الحذف
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
