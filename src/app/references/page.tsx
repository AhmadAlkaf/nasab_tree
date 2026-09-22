'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Reference } from '@/types';
import { getReferencesPage, deleteReference } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { useCityNameMap } from '@/hooks/useCityNames';
import {
  Search, Plus, ChevronLeft, ChevronRight, UserCheck, Phone, MapPin, Trash2, MessagesSquare
} from 'lucide-react';

function getVisiblePageNumbers(currentPage: number, totalPages: number): Array<number | null> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  const orderedPages = Array.from(pages)
    .filter(p => p > 0 && p <= totalPages)
    .sort((a, b) => a - b);
  const visiblePages: Array<number | null> = [];
  orderedPages.forEach((p, i) => {
    if (i > 0 && p - orderedPages[i - 1] > 1) visiblePages.push(null);
    visiblePages.push(p);
  });
  return visiblePages;
}

export default function ReferencesPage() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const { refreshKey, addToast } = useAppStore();
  const { getCityName } = useCityNameMap();
  const router = useRouter();

  useEffect(() => {
    const fetchReferences = async () => {
      setIsLoading(true);
      const res = await getReferencesPage(page, pageSize, { search: query });
      if (res.success && res.data) {
        setReferences(res.data.results);
        setTotalCount(res.data.count);
      }
      setIsLoading(false);
    };

    const delaySearch = setTimeout(fetchReferences, query.trim() ? 300 : 0);
    return () => clearTimeout(delaySearch);
  }, [refreshKey, page, pageSize, query]);

  const handleDelete = async (e: React.MouseEvent, reference: Reference) => {
    e.stopPropagation();
    const confirmed = window.confirm(`هل تريد حذف المعرّف "${reference.name}"؟`);
    if (!confirmed) return;
    const res = await deleteReference(reference.id);
    if (res.success) {
      addToast({ type: 'success', message: 'تم حذف المعرّف بنجاح' });
      setReferences(prev => prev.filter(r => r.id !== reference.id));
      setTotalCount(prev => Math.max(0, prev - 1));
    } else {
      addToast({ type: 'error', message: res.error || 'حدث خطأ أثناء الحذف' });
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageNumbers = getVisiblePageNumbers(page, totalPages);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">المعرّفين المناطق</h1>
          <div className="page-subtitle">قائمة المعرّفين المسجلين في النظام</div>
        </div>
        <div className="page-header-right">
          <button className="btn btn-primary" onClick={() => router.push('/references/new')}>
            <Plus size={16} />
            إضافة معرّف
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper" style={{ width: '100%', maxWidth: 400 }}>
            <Search className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="ابحث بالاسم أو القبيلة أو المنطقة..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              className="form-select"
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            >
              <option value={10}>10 نتائج</option>
              <option value={20}>20 نتيجة</option>
              <option value={50}>50 نتيجة</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>المعرّف</th>
                <th>القبيلة</th>
                <th>اسم المنطقة</th>
                <th>المدينة</th>
                <th>الهاتف</th>
                <th>الردود</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="loading-spinner" />
                  </td>
                </tr>
              ) : references.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    لا يوجد معرّفون مطابقون للبحث
                  </td>
                </tr>
              ) : (
                references.map((reference) => (
                  <tr
                    key={reference.id}
                    onClick={() => router.push(`/references/${reference.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(212,168,83,0.12)',
                            color: 'var(--gold-400)'
                          }}
                        >
                          <UserCheck size={16} />
                        </div>
                        <span>{reference.name}</span>
                      </div>
                    </td>
                    <td>{reference.family || '-'}</td>
                    <td>{reference.name_place || '-'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        <MapPin size={12} style={{ color: 'var(--emerald-400)' }} />
                        {getCityName(reference.city_id)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <Phone size={12} />
                        {reference.phone || '-'}
                      </div>
                    </td>
                    <td>
                      <span className="badge muted">
                        <MessagesSquare size={12} />
                        {reference.responses_count}
                      </span>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                          className="btn btn-ghost btn-icon"
                          title="حذف"
                          onClick={(e) => handleDelete(e, reference)}
                        >
                          <Trash2 size={16} style={{ color: 'var(--red-400)' }} />
                        </button>
                        <ChevronLeft size={18} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-summary">
            عرض {references.length} من أصل {totalCount} نتيجة
          </span>
          <div className="pagination-controls">
            <button className="btn btn-secondary btn-sm" disabled={page === 1 || isLoading} onClick={() => setPage(page - 1)}>
              <ChevronRight size={16} /> السابقة
            </button>
            {pageNumbers.map((pageNumber, index) => (
              pageNumber === null ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
              ) : (
                <button
                  key={pageNumber}
                  className={`btn btn-sm ${pageNumber === page ? 'btn-primary' : 'btn-secondary'}`}
                  disabled={isLoading}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              )
            ))}
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages || isLoading} onClick={() => setPage(page + 1)}>
              التالية <ChevronLeft size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}