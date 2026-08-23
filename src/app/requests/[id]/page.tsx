'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Requser,
  StatusRequserDcm,
  FormRequser,
  StatusRequsetLabels,
  TypeRequsetLabels,
  TypeDocumentLabels,
} from '@/types';
import { getRequser, getStatusesByRequser, getFormRequsersByRequser } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import FormRequserTree from '@/components/tree/FormRequserTree';
import StatusForm from '@/components/forms/StatusForm';
import FormRequserForm from '@/components/forms/FormRequserForm';
import Modal from '@/components/ui/Modal';
import {
  User, FileText, MapPin, Calendar, Phone, Download, Clock, GitBranch, ChevronLeft, Plus
} from 'lucide-react';

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const requestId = parseInt(resolvedParams.id, 10);

  const [requser, setRequser] = useState<Requser | null>(null);
  const [statuses, setStatuses] = useState<StatusRequserDcm[]>([]);
  const [formRequsers, setFormRequsers] = useState<FormRequser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isFormRequserModalOpen, setIsFormRequserModalOpen] = useState(false);

  const { refreshKey, addToast } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const reqRes = await getRequser(requestId);

      if (reqRes.success && reqRes.data) {
        setRequser(reqRes.data);

        const [statusRes, formRes] = await Promise.all([
          getStatusesByRequser(requestId),
          getFormRequsersByRequser(requestId),
        ]);

        if (statusRes.success && statusRes.data) {
          setStatuses(statusRes.data.sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          ));
        }

        if (formRes.success && formRes.data) {
          setFormRequsers(formRes.data);
        }
      } else {
        addToast({ type: 'error', message: 'لم يتم العثور على الطلب' });
        router.push('/requests');
      }

      setIsLoading(false);
    };

    fetchData();
  }, [requestId, refreshKey, router, addToast]);

  if (isLoading) {
    return (
      <div className="loading-overlay" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="loading-spinner lg" />
        <span>جاري تحميل بيانات الطلب...</span>
      </div>
    );
  }

  if (!requser) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">تفاصيل الطلب</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={() => router.push('/requests')}>
            <ChevronLeft size={16} />
            العودة للقائمة
          </button>
        </div>
      </div>

      {/* بطاقة معلومات الطلب الأساسية */}
      <div className="person-hero">
        <div className="person-avatar male">
          <User size={40} />
        </div>
        <div className="person-info" style={{ flex: 1 }}>
          <h1>{requser.full_name}</h1>
          <div className="person-info-meta">
            <span className="badge blue">
              {TypeRequsetLabels[requser.type_requser]}
            </span>
            <span className="badge muted">
              {TypeDocumentLabels[requser.type_document]}
            </span>
            <span className="badge muted">
              <MapPin size={12} />
              {requser.name_place || requser.home}
            </span>
            <span className="badge muted">
              <Calendar size={12} />
              {new Date(requser.created_at).toLocaleDateString('ar-SA')}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* معلومات القبيلة والبيت */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title">
                <User size={18} style={{ color: 'var(--gold-400)' }} />
                معلومات القبيلة والنسب
              </div>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-item-label">القبيلة</div>
                  <div className="info-item-value">{requser.name_fiamy}</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">الفخيدة</div>
                  <div className="info-item-value">{requser.name_thigh}</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">البيت</div>
                  <div className="info-item-value">{requser.home}</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">المنطقة</div>
                  <div className="info-item-value">{requser.name_place || '-'}</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">اللغة</div>
                  <div className="info-item-value">{requser.language}</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">رقم الوثيقة</div>
                  <div className="info-item-value">{requser.number_document}</div>
                </div>
              </div>
            </div>
          </div>

          {/* معلومات الاتصال */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title">
                <Phone size={18} style={{ color: 'var(--emerald-400)' }} />
                معلومات الاتصال
              </div>
            </div>
            <div className="card-body">
              <div className="info-grid">
                {requser.phone && (
                  <div className="info-item">
                    <div className="info-item-label">رقم الهاتف</div>
                    <div className="info-item-value">{requser.phone}</div>
                  </div>
                )}
                {requser.phone_whatapp && (
                  <div className="info-item">
                    <div className="info-item-label">رقم واتساب</div>
                    <div className="info-item-value">{requser.phone_whatapp}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* الوثائق المرفقة */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title">
                <FileText size={18} style={{ color: 'var(--blue-400)' }} />
                الوثائق المرفقة
              </div>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="list-item">
                <div className="list-item-avatar" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--blue-400)' }}>
                  <FileText size={16} />
                </div>
                <div className="list-item-content">
                  <div className="list-item-title">صورة الوثيقة</div>
                  <div className="list-item-subtitle">{requser.number_document}</div>
                </div>
                {requser.image_document && (
                  <button className="btn btn-ghost btn-sm">
                    <Download size={14} />
                  </button>
                )}
              </div>
              {requser.signature && (
                <div className="list-item">
                  <div className="list-item-avatar" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--emerald-400)' }}>
                    <FileText size={16} />
                  </div>
                  <div className="list-item-content">
                    <div className="list-item-title">التوقيع</div>
                  </div>
                  <button className="btn btn-ghost btn-sm">
                    <Download size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* العمود الجانبي */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* شجرة النموذج */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title">
                <GitBranch size={18} style={{ color: 'var(--emerald-400)' }} />
                شجرة النموذج ({formRequsers.length})
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsFormRequserModalOpen(true)}>
                <Plus size={14} />
                إضافة شخص
              </button>
            </div>
            <div className="card-body" style={{ background: 'var(--bg-secondary)', padding: 0, minHeight: 300 }}>
              {formRequsers.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 20px' }}>
                  <div className="empty-state-text" style={{ marginBottom: 0 }}>لا توجد نماذج مسجلة</div>
                </div>
              ) : (
                <FormRequserTree formRequsers={formRequsers} />
              )}
            </div>
          </div>

          {/* سجل الحالات */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title">
                <Clock size={18} style={{ color: 'var(--amber-400)' }} />
                سجل الحالات ({statuses.length})
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsStatusModalOpen(true)}>
                <Plus size={14} />
                إضافة حالة
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {statuses.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 20px' }}>
                  <div className="empty-state-text" style={{ marginBottom: 0 }}>لا يوجد سجل حالات</div>
                </div>
              ) : (
                <div style={{ padding: '16px' }}>
                  {statuses.map((status, index) => (
                    <div key={status.id} style={{ display: 'flex', gap: 12, marginBottom: index < statuses.length - 1 ? 16 : 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                          style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: index === 0 ? 'var(--emerald-400)' : 'var(--text-muted)',
                          }}
                        />
                        {index < statuses.length - 1 && (
                          <div style={{ width: 1, flex: 1, background: 'var(--border-subtle)', marginTop: 4 }} />
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: index === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {StatusRequsetLabels[status.status_requset]}
                        </div>
                        {status.note && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            {status.note}
                          </div>
                        )}
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          {new Date(status.created_at).toLocaleDateString('ar-SA')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* نافذة إضافة حالة */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title="إضافة حالة جديدة"
        icon={<Clock size={20} style={{ color: 'var(--amber-400)' }} />}
      >
        <StatusForm
          requserId={requestId}
          onSuccess={() => setIsStatusModalOpen(false)}
        />
      </Modal>

      {/* نافذة إضافة شخص للنموذج */}
      <Modal
        isOpen={isFormRequserModalOpen}
        onClose={() => setIsFormRequserModalOpen(false)}
        title="إضافة شخص للطلب"
        size="lg"
        icon={<User size={20} style={{ color: 'var(--blue-400)' }} />}
      >
        <FormRequserForm
          requserId={requestId}
          onSuccess={() => setIsFormRequserModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
