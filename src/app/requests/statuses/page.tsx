'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusRequsetLabels } from '@/types';
import { getAllStatusesPage } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  User,
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

interface StatusWithRequserName {
  id: number;
  requser_id: number;
  status_requset: number;
  note: string | null;
  file: string | null;
  created_at: string;
  updated_at: string;
  requser_name?: string;
}

export default function StatusesPage() {
  const [statuses, setStatuses] = useState<StatusWithRequserName[]>([]);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const { refreshKey } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const fetchStatuses = async () => {
      setIsLoading(true);
      const res = await getAllStatusesPage(page, pageSize, {
        search: query,
        status: filterStatus,
      });
      if (res.success && res.data) {
        setStatuses(res.data.results);
        setTotalCount(res.data.count);
      }
      setIsLoading(false);
    };

    const delaySearch = setTimeout(fetchStatuses, query.trim() ? 300 : 0);
    return () => clearTimeout(delaySearch);
  }, [refreshKey, page, pageSize, query, filterStatus]);

  const changeFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageNumbers = getVisiblePageNumbers(page, totalPages);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">حالات الطلبات</h1>
          <div className="page-subtitle">سجل حالات جميع الطلبات</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper" style={{ width: '100%', maxWidth: 400 }}>
            <Search className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="ابحث في الملاحظات..."
              value={query}
              onChange={(e) => changeFilter(setQuery, e.target.value)}
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
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => changeFilter(setFilterStatus, e.target.value)}
            >
              <option value="">كل الحالات</option>
              {Object.entries(StatusRequsetLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>الطلب</th>
                <th>الحالة</th>
                <th>الملاحظة</th>
                <th>الملف</th>
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
              ) : statuses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    لا توجد حالات مطابقة للبحث أو الفلتر
                  </td>
                </tr>
              ) : (
                statuses.map((status) => (
                  <tr
                    key={status.id}
                    onClick={() => router.push(`/requests/${status.requser_id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(59,130,246,0.1)',
                            color: 'var(--blue-400)'
                          }}
                        >
                          <User size={16} />
                        </div>
                        <span>{status.requser_name || `طلب #${status.requser_id}`}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge blue">
                        {StatusRequsetLabels[status.status_requset as keyof typeof StatusRequsetLabels] || status.status_requset}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {status.note || '-'}
                    </td>
                    <td>
                      {status.file ? (
                        <span className="badge emerald">
                          <FileText size={10} />
                          موجود
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        {new Date(status.created_at).toLocaleDateString('ar-SA')}
                      </div>
                    </td>
                    <td style={{ textAlign: 'left' }}>
                      <ChevronLeft size={18} style={{ color: 'var(--text-muted)' }} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span className="pagination-summary">
            عرض {statuses.length} من أصل {totalCount} نتيجة
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
