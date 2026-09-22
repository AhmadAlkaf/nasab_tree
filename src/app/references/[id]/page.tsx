'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Reference, ReferenceRequser, Requser, StatusRequserDcm, StatusRequsetLabels } from '@/types';
import {
  getReference, getReferenceRequsersByReference, deleteReference,
  getRequsersPage, getStatusesByRequser, createReferenceRequser, deleteReferenceRequser,
} from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { useCityNameMap } from '@/hooks/useCityNames';
import Modal from '@/components/ui/Modal';
import ReferenceForm from '@/components/forms/ReferenceForm';
import {
  UserCheck, Edit, Trash2, MapPin, Phone, MessageSquareReply, FileText,
  Calendar, Search, ChevronLeft, Clock, Plus, Info
} from 'lucide-react';

export default function ReferenceDetailsPage() {
  const params = useParams<{ id: string }>();
  const referenceId = parseInt(params.id, 10);

  const [reference, setReference] = useState<Reference | null>(null);
  const [responses, setResponses] = useState<ReferenceRequser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddResponseModalOpen, setIsAddResponseModalOpen] = useState(false);

  const { refreshKey, addToast } = useAppStore();
  const { getCityName } = useCityNameMap();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const refRes = await getReference(referenceId);
      if (refRes.success && refRes.data) {
        setReference(refRes.data);
      } else {
        addToast({ type: 'error', message: 'لم يتم العثور على المعرّف' });
        router.push('/references');
        return;
      }
      const respRes = await getReferenceRequsersByReference(referenceId);
      if (respRes.success && respRes.data) {
        setResponses(respRes.data);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [referenceId, refreshKey, router, addToast]);

  const handleDelete = async () => {
    const confirmed = window.confirm(`هل تريد حذف المعرّف "${reference?.name}"؟`);
    if (!confirmed) return;
    const res = await deleteReference(referenceId);
    if (res.success) {
      addToast({ type: 'success', message: 'تم حذف المعرّف بنجاح' });
      router.push('/references');
    } else {
      addToast({ type: 'error', message: res.error || 'حدث خطأ أثناء الحذف' });
    }
  };

  const handleDeleteResponse = async (response: ReferenceRequser) => {
    const confirmed = window.confirm('هل تريد حذف هذا الرد؟');
    if (!confirmed) return;
    const res = await deleteReferenceRequser(response.id);
    if (res.success) {
      addToast({ type: 'success', message: 'تم حذف الرد بنجاح' });
      setResponses(prev => prev.filter(r => r.id !== response.id));
    } else {
      addToast({ type: 'error', message: res.error || 'حدث خطأ أثناء الحذف' });
    }
  };

  if (isLoading) {
    return (
      <div className="loading-overlay" style={{ height: 'calc(100vh - 100px)' }}>
        <div className="loading-spinner lg" />
        <span>جاري تحميل بيانات المعرّف...</span>
      </div>
    );
  }

  if (!reference) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">تفاصيل المعرّف</h1>
        </div>
        <div className="page-header-right">
          <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(true)}>
            <Edit size={16} />
            تعديل البيانات
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            <Trash2 size={16} />
            حذف المعرّف
          </button>
        </div>
      </div>

      <div className="person-hero" style={{ borderColor: 'rgba(212,168,83,0.25)' }}>
        <div
          className="person-avatar"
          style={{ background: 'rgba(212,168,83,0.15)', color: 'var(--gold-400)' }}
        >
          <UserCheck size={40} />
        </div>
        <div className="person-info" style={{ flex: 1 }}>
          <h1>{reference.name}</h1>
          <div className="person-info-meta">
            {reference.family && <span className="badge gold">القبيلة: {reference.family}</span>}
            {reference.name_place && <span className="badge muted"><MapPin size={12} /> {reference.name_place}</span>}
            <span className="badge emerald"><MessageSquareReply size={12} /> {responses.length} رد</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-header-title">
            <Info size={16} style={{ color: 'var(--blue-400)' }} />
            بيانات المعرّف
          </div>
        </div>
        <div className="card-body">
          <div className="info-grid">
            <div className="info-item">
              <div className="info-item-label">رقم الهاتف</div>
              <div className="info-item-value">
                <Phone size={13} /> {reference.phone || '-'}
              </div>
            </div>
            <div className="info-item">
              <div className="info-item-label">رقم الواتساب</div>
              <div className="info-item-value">
                <Phone size={13} /> {reference.phone_whatapp || '-'}
              </div>
            </div>
            <div className="info-item">
              <div className="info-item-label">المدينة</div>
              <div className="info-item-value">
                <MapPin size={13} /> {getCityName(reference.city_id)}
              </div>
            </div>
            <div className="info-item">
              <div className="info-item-label">اسم المنطقة</div>
              <div className="info-item-value">
                <MapPin size={13} /> {reference.name_place || '-'}
              </div>
            </div>
            <div className="info-item">
              <div className="info-item-label">تاريخ الانشاء</div>
              <div className="info-item-value">
                <Calendar size={13} /> {new Date(reference.created_at).toLocaleDateString('ar-SA')}
              </div>
            </div>
          </div>

          {reference.information && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              <div className="info-item-label" style={{ marginBottom: 8 }}>معلومات عن المعرّف</div>
              {reference.information}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-header">
          <div className="card-header-title">
            <MessageSquareReply size={18} style={{ color: 'var(--blue-400)' }} />
            الردود على الطلبات ({responses.length})
          </div>
          <button className="btn btn-primary" onClick={() => setIsAddResponseModalOpen(true)}>
            <Plus size={16} />
            إضافة رد
          </button>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>الطلب / الشخص</th>
                <th>الحالة</th>
                <th>الرد</th>
                <th>التاريخ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {responses.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    لا توجد ردود على الطلبات لهذا المعرّف
                  </td>
                </tr>
              ) : (
                responses.map((response) => (
                  <tr key={response.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        <FileText size={12} style={{ color: 'var(--blue-400)' }} />
                        {response.requser_name || `طلب ${response.status_id}`}
                      </div>
                    </td>
                    <td>
                      <span className="badge blue">
                        {response.status_label || 'غير معروفة'}
                      </span>
                    </td>
                    <td style={{ maxWidth: 260 }}>
                      {response.respones || '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        {new Date(response.created_at).toLocaleDateString('ar-SA')}
                      </div>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <button
                        className="btn btn-ghost btn-icon"
                        title="حذف"
                        onClick={() => handleDeleteResponse(response)}
                      >
                        <Trash2 size={16} style={{ color: 'var(--red-400)' }} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="تعديل بيانات المعرّف"
        icon={<UserCheck size={18} style={{ color: 'var(--gold-400)' }} />}
        size="lg"
      >
        <ReferenceForm existing={reference} onSuccess={() => setIsEditModalOpen(false)} />
      </Modal>

      <Modal
        isOpen={isAddResponseModalOpen}
        onClose={() => setIsAddResponseModalOpen(false)}
        title={`إضافة رد على طلب - ${reference.name}`}
        icon={<MessageSquareReply size={18} style={{ color: 'var(--blue-400)' }} />}
        size="lg"
      >
        <AddResponseForm
          referenceId={reference.id}
          onSuccess={() => setIsAddResponseModalOpen(false)}
        />
      </Modal>
    </div>
  );
}

function AddResponseForm({
  referenceId,
  onSuccess,
}: {
  referenceId: number;
  onSuccess: () => void;
}) {
  const [reqQuery, setReqQuery] = useState('');
  const [reqResults, setReqResults] = useState<Requser[]>([]);
  const [isReqOpen, setIsReqOpen] = useState(false);
  const [selectedRequser, setSelectedRequser] = useState<Requser | null>(null);

  const [statuses, setStatuses] = useState<StatusRequserDcm[]>([]);
  const [isStatusesLoading, setIsStatusesLoading] = useState(false);
  const [selectedStatusId, setSelectedStatusId] = useState<number | null>(null);

  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addToast } = useAppStore();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsReqOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    const res = await getRequsersPage(1, 20, { search: q });
    if (res.success && res.data) {
      setReqResults(res.data.results);
    }
  }, []);

  const handleReqInputChange = (val: string) => {
    setReqQuery(val);
    setIsReqOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 200);
  };

  const handleSelectRequser = async (requser: Requser) => {
    setSelectedRequser(requser);
    setReqQuery('');
    setIsReqOpen(false);
    setSelectedStatusId(null);
    setIsStatusesLoading(true);
    const res = await getStatusesByRequser(requser.id);
    if (res.success && res.data) {
      setStatuses(res.data);
    } else {
      setStatuses([]);
    }
    setIsStatusesLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequser || !selectedStatusId) {
      addToast({ type: 'error', message: 'اختر الطلب والحالة أولاً' });
      return;
    }
    setIsSubmitting(true);
    const res = await createReferenceRequser({
      reference: referenceId,
      status_requser_dcm: selectedStatusId,
      respones: responseText,
    });
    if (res.success) {
      addToast({ type: 'success', message: 'تم إضافة الرد بنجاح' });
      onSuccess();
    } else {
      addToast({ type: 'error', message: res.error || 'حدث خطأ' });
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group" ref={wrapperRef}>
        <label className="form-label">الطلب</label>
        {selectedRequser ? (
          <div className="search-selected">
            <FileText size={14} style={{ color: 'var(--blue-400)' }} />
            <span className="search-selected-name" style={{ color: 'var(--blue-400)' }}>
              {selectedRequser.full_name}
            </span>
            <button
              type="button"
              className="search-selected-remove"
              onClick={() => { setSelectedRequser(null); setStatuses([]); setSelectedStatusId(null); }}
            >
              &times;
            </button>
          </div>
        ) : (
          <div className="search-wrapper">
            <Search className="search-icon" />
            <input
              className="form-input"
              type="text"
              value={reqQuery}
              onChange={(e) => handleReqInputChange(e.target.value)}
              onFocus={() => { setIsReqOpen(true); doSearch(reqQuery); }}
              placeholder="ابحث عن طلب بالاسم..."
            />
            {isReqOpen && reqResults.length > 0 && (
              <div className="search-dropdown">
                {reqResults.map((requser) => (
                  <div
                    key={requser.id}
                    className="search-item"
                    onClick={() => handleSelectRequser(requser)}
                  >
                    <FileText size={14} style={{ color: 'var(--blue-400)' }} />
                    <div>
                      <div className="search-item-name">{requser.full_name}</div>
                      <div className="search-item-lineage">
                        {requser.number_document || 'بدون رقم وثيقة'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">الحالة</label>
        {selectedRequser ? (
          isStatusesLoading ? (
            <div className="loading-spinner" style={{ marginTop: 8 }} />
          ) : statuses.length === 0 ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
              لا توجد حالات لهذا الطلب
            </div>
          ) : (
            <select
              className="form-select"
              value={selectedStatusId ?? ''}
              onChange={(e) => setSelectedStatusId(Number(e.target.value))}
            >
              <option value="">اختر الحالة...</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {StatusRequsetLabels[status.status_requset] || status.status_requset}
                  {status.note ? ` - ${status.note}` : ''}
                </option>
              ))}
            </select>
          )
        ) : (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            اختر الطلب أولاً لعرض حالاته
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">الرد</label>
        <textarea
          className="form-textarea"
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          placeholder="اكتب رد المعرّف على الطلب..."
          rows={3}
        />
      </div>

      <div style={{ paddingTop: 8 }}>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading-spinner" /> : <ChevronLeft size={16} />}
          إضافة الرد
        </button>
      </div>
    </form>
  );
}