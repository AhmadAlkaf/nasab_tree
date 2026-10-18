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
import { getRequser, deleteStatusRequser } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { usePageAccess, useCan, PERM } from '@/lib/auth';
import FormRequserTree from '@/components/tree/FormRequserTree';
import StatusForm from '@/components/forms/StatusForm';
import RequestForm from '@/components/forms/RequestForm';
import FormRequserForm from '@/components/forms/FormRequserForm';
import Modal from '@/components/ui/Modal';
import {
  User, FileText, MapPin, Calendar, Phone, Download, Clock, GitBranch, ChevronLeft, Plus, UserPlus, Pencil, Trash2
} from 'lucide-react';

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const requestId = parseInt(resolvedParams.id, 10);

  const [requser, setRequser] = useState<Requser | null>(null);
  const [statuses, setStatuses] = useState<StatusRequserDcm[]>([]);
  const [formRequsers, setFormRequsers] = useState<FormRequser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);
  const [isEditStatusModalOpen, setIsEditStatusModalOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<StatusRequserDcm | null>(null);
  const [isFormRequserModalOpen, setIsFormRequserModalOpen] = useState(false);
  const [isEditFormModalOpen, setIsEditFormModalOpen] = useState(false);
  const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<FormRequser | null>(null);
  const [childParent, setChildParent] = useState<FormRequser | null>(null);

  const { refreshKey, addToast, triggerRefresh } = useAppStore();
  const router = useRouter();
  const allowed = usePageAccess(PERM.requser.view);
  const can = useCan();

  const handleNodeClick = (form: FormRequser) => {
    setEditingForm(form);
    setIsEditFormModalOpen(true);
  };

  const handleAddChild = (form: FormRequser) => {
    setChildParent(form);
    setIsAddChildModalOpen(true);
  };

  const handleDownload = async (url: string, label: string) => {
    if (!url) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${label}_${Date.now()}.${blob.type.split('/')[1] || 'file'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
      addToast({ type: 'success', message: `تم تحميل ${label}` });
    } catch {
      addToast({ type: 'error', message: `تعذر تحميل ${label} - الملف غير موجود` });
    }
  };

  const handleEditStatus = (status: StatusRequserDcm) => {
    setEditingStatus(status);
    setIsEditStatusModalOpen(true);
  };

  const handleDeleteStatus = async (status: StatusRequserDcm) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الحالة؟')) return;
    const res = await deleteStatusRequser(status.id);
    if (res.success) {
      addToast({ type: 'success', message: 'تم حذف الحالة' });
      triggerRefresh();
    } else {
      addToast({ type: 'error', message: res.error || 'فشل حذف الحالة' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const reqRes = await getRequser(requestId);

      if (reqRes.success && reqRes.data) {
        setRequser(reqRes.data);

        setStatuses(
          (reqRes.data.status_requser_dcm ?? []).sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        );

        setFormRequsers(reqRes.data.form_requser ?? []);
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
          {can(PERM.requser.change) && (
            <button className="btn btn-secondary" onClick={() => setIsEditRequestModalOpen(true)}>
              <Pencil size={16} />
              تعديل الطلب
            </button>
          )}
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
                  <>
                    <button className="btn btn-ghost btn-icon" title="تحميل" onClick={() => handleDownload(requser.image_document, 'الوثيقة')}>
                      <Download size={15} />
                    </button>
                    {can(PERM.requser.change) && (
                      <button className="btn btn-ghost btn-icon" title="تعديل" onClick={() => setIsEditRequestModalOpen(true)}>
                        <Pencil size={15} style={{ color: 'var(--blue-400)' }} />
                      </button>
                    )}
                  </>
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
                  <button className="btn btn-ghost btn-icon" title="تحميل" onClick={() => handleDownload(requser.signature, 'التوقيع')}>
                    <Download size={15} />
                  </button>
                  {can(PERM.requser.change) && (
                    <button className="btn btn-ghost btn-icon" title="تعديل" onClick={() => setIsEditRequestModalOpen(true)}>
                      <Pencil size={15} style={{ color: 'var(--blue-400)' }} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* العمود الجانبي */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* سجل الحالات */}
          <div className="card">
            <div className="card-header">
              <div className="card-header-title">
                <Clock size={18} style={{ color: 'var(--amber-400)' }} />
                سجل الحالات ({statuses.length})
              </div>
              {can(PERM.status.add) && (
                <button className="btn btn-ghost btn-sm" onClick={() => setIsStatusModalOpen(true)}>
                  <Plus size={14} />
                  إضافة حالة
                </button>
              )}
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
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: index === 0 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                              {StatusRequsetLabels[status.status_requset]}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {can(PERM.status.change) && (
                                <button
                                  className="btn btn-ghost btn-icon"
                                  title="تعديل"
                                  onClick={() => handleEditStatus(status)}
                                >
                                  <Pencil size={14} style={{ color: 'var(--blue-400)' }} />
                                </button>
                              )}
                              {can(PERM.status.delete) && (
                                <button
                                  className="btn btn-ghost btn-icon"
                                  title="حذف"
                                  onClick={() => handleDeleteStatus(status)}
                                >
                                  <Trash2 size={14} style={{ color: 'var(--red-400)' }} />
                                </button>
                              )}
                            </div>
                          </div>
                          {status.note && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                              {status.note}
                            </div>
                          )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {new Date(status.created_at).toLocaleDateString('ar-SA')}
                          </div>
                          {status.file && (
                            <button className="btn btn-link btn-sm" onClick={() => handleDownload(status.file!, 'ملف الحالة')}>
                              <Download size={12} />
                              تحميل الملف
                            </button>
                          )}
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

      {/* شجرة النموذج - بعرض كامل */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <div className="card-header-title">
            <GitBranch size={18} style={{ color: 'var(--emerald-400)' }} />
            شجرة النموذج ({formRequsers.length})
          </div>
          {can(PERM.formRequser.add) && (
            <button className="btn btn-ghost btn-sm" onClick={() => setIsFormRequserModalOpen(true)}>
              <Plus size={14} />
              إضافة شخص
            </button>
          )}
        </div>
        <div className="card-body" style={{ background: 'var(--bg-secondary)', padding: 0, minHeight: 300 }}>
          {formRequsers.length === 0 ? (
            <div className="empty-state" style={{ padding: '30px 20px' }}>
              <div className="empty-state-text" style={{ marginBottom: 0 }}>لا توجد نماذج مسجلة</div>
            </div>
          ) : (
            <FormRequserTree formRequsers={formRequsers} onNodeClick={(form) => handleNodeClick(form)} onAddChild={can(PERM.formRequser.add) ? (form) => handleAddChild(form) : undefined} />
          )}
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

      {/* نافذة تعديل حالة */}
      <Modal
        isOpen={isEditStatusModalOpen}
        onClose={() => { setIsEditStatusModalOpen(false); setEditingStatus(null); }}
        title="تعديل حالة"
        icon={<Clock size={20} style={{ color: 'var(--amber-400)' }} />}
      >
        {editingStatus && (
          <StatusForm
            requserId={requestId}
            existing={editingStatus}
            onSuccess={() => { setIsEditStatusModalOpen(false); setEditingStatus(null); }}
          />
        )}
      </Modal>

      {/* نافذة تعديل الطلب */}
      <Modal
        isOpen={isEditRequestModalOpen}
        onClose={() => setIsEditRequestModalOpen(false)}
        title={`تعديل الطلب: ${requser.full_name}`}
        size="lg"
        icon={<Pencil size={20} style={{ color: 'var(--blue-400)' }} />}
      >
        <RequestForm
          existing={requser}
          onSuccess={() => setIsEditRequestModalOpen(false)}
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

      {/* نافذة تعديل شخص */}
      <Modal
        isOpen={isEditFormModalOpen}
        onClose={() => { setIsEditFormModalOpen(false); setEditingForm(null); }}
        title={`تعديل: ${editingForm?.name || ''}`}
        size="lg"
        icon={<User size={20} style={{ color: 'var(--emerald-400)' }} />}
      >
        {editingForm && (
          <FormRequserForm
            requserId={requestId}
            form={editingForm}
            onSuccess={() => { setIsEditFormModalOpen(false); setEditingForm(null); }}
          />
        )}
      </Modal>

      {/* نافذة إضافة ابن */}
      <Modal
        isOpen={isAddChildModalOpen}
        onClose={() => { setIsAddChildModalOpen(false); setChildParent(null); }}
        title={`إضافة ابن لـ: ${childParent?.name || ''}`}
        size="lg"
        icon={<UserPlus size={20} style={{ color: 'var(--gold-400)' }} />}
      >
        <FormRequserForm
          requserId={requestId}
          defaultParentId={childParent?.id}
          onSuccess={() => { setIsAddChildModalOpen(false); setChildParent(null); }}
        />
      </Modal>
    </div>
  );
}
