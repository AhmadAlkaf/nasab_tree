'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReferenceRequser } from '@/types';
import { getReferenceRequsersPage, deleteReferenceRequser } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import {
  Search, ChevronLeft, ChevronRight, MessageSquareReply, Trash2, Clock, FileText
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

type EnrichedReferenceRequser = ReferenceRequser & { reference_name?: string; requser_name?: string; status_label?: string };

export default function ReferenceResponsesPage() {
  const [responses, setResponses] = useState<EnrichedReferenceRequser[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const { refreshKey, addToast } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const fetchResponses = async () => {
      setIsLoading(true);
      const res = await getReferenceRequsersPage(page, pageSize, { search: query });
      if (res.success && res.data) {
        setResponses(res.data.results);
        setTotalCount(res.data.count);
      }
      setIsLoading(false);
    };

    const delaySearch = setTimeout(fetchResponses, query.trim() ? 300 : 0);
    return () => clearTimeout(delaySearch);
  }, [refreshKey, page, pageSize, query]);

  const handleDelete = async (response: EnrichedReferenceRequser) => {
    const confirmed = window.confirm('هل تريد حذف هذا الرد؟');
    if (!confirmed) return;
    const res = await deleteReferenceRequser(response.id);
    if (res.success) {
      addToast({ type: 'success', message: 'تم حذف الرد بنجاح' });
      setResponses(prev => prev.filter(r => r.id !== response.id));
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
          <h1 className="page-title">الردود على الطلبات</h1>
          <div className="page-subtitle">جميع ردود المعرّفين على الطلبات</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper" style={{ width: '100%', maxWidth: 400 }}>
            <Search className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="ابحث في الردود..."
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
                <th>الطلب / الشخص</th>
                <th>الحالة</th>
                <th>الرد</th>
                <th>التاريخ</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="loading-spinner" />
                  </td>
                </tr>
              ) : responses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    لا توجد ردود مطابقة للبحث
                  </td>
                </tr>
              ) : (
                responses.map((response) => (
                  <tr
                    key={response.id}
                    onClick={() => router.push(`/references/${response.reference_id}`)}
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
                          <MessageSquareReply size={15} />
                        </div>
                        <span>{response.reference_name || `معرف #${response.reference_id}`}</span>
                      </div>
                    </td>
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
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                        onClick={(e) => { e.stopPropagation(); handleDelete(response); }}
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

        <div className="pagination">
          <span className="pagination-summary">
            عرض {responses.length} من أصل {totalCount} نتيجة
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