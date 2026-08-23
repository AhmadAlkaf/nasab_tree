'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Requser,
  StatusRequsetLabels,
  TypeRequsetLabels,
  TypeDocumentLabels,
} from '@/types';
import { getRequsersPage } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';

function getVisiblePageNumbers(currentPage: number, totalPages: number): Array<number | null> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  const orderedPages = Array.from(pages)
    .filter(pageNumber => pageNumber > 0 && pageNumber <= totalPages)
    .sort((first, second) => first - second);
  const visiblePages: Array<number | null> = [];

  orderedPages.forEach((pageNumber, index) => {
    if (index > 0 && pageNumber - orderedPages[index - 1] > 1) {
      visiblePages.push(null);
    }
    visiblePages.push(pageNumber);
  });

  return visiblePages;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Requser[]>([]);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const { refreshKey } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      const res = await getRequsersPage(page, pageSize, {
        search: query,
        type_requser: filterType,
        status: filterStatus,
      });
      if (res.success && res.data) {
        setRequests(res.data.results);
        setTotalCount(res.data.count);
      }
      setIsLoading(false);
    };

    const delaySearch = setTimeout(fetchRequests, query.trim() ? 300 : 0);
    return () => clearTimeout(delaySearch);
  }, [refreshKey, page, pageSize, query, filterType, filterStatus]);

  const changeFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const handleRowClick = (id: number) => {
    router.push(`/requests/${id}`);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageNumbers = getVisiblePageNumbers(page, totalPages);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">الطلبات</h1>
          <div className="page-subtitle">إدارة طلبات تسجيل الأنساب</div>
        </div>
        <div className="page-header-right">
          <Link href="/requests/new" className="btn btn-primary">
            <Plus size={18} />
            إضافة طلب
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper" style={{ width: '100%', maxWidth: 400 }}>
            <Search className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="ابحث بالاسم الكامل..."
              value={query}
              onChange={(e) => changeFilter(setQuery, e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              className="form-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              aria-label="عدد النتائج في الصفحة"
            >
              <option value={10}>10 نتائج</option>
              <option value={20}>20 نتيجة</option>
              <option value={50}>50 نتيجة</option>
            </select>
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => changeFilter(setFilterType, e.target.value)}
            >
              <option value="">كل الأنواع</option>
              {Object.entries(TypeRequsetLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
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
                <th>الاسم الكامل</th>
                <th>القبيلة</th>
                <th>الفخيدة</th>
                <th>المنطقة</th>
                <th>نوع الطلب</th>
                <th>نوع الوثيقة</th>
                <th>تاريخ الإنشاء</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div className="loading-spinner" />
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    لا توجد طلبات مطابقة للبحث أو الفلتر
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req.id}
                    onClick={() => handleRowClick(req.id)}
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
                        <span>{req.full_name}</span>
                      </div>
                    </td>
                    <td>{req.name_fiamy}</td>
                    <td>{req.name_thigh}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                        {req.name_place || '-'}
                      </div>
                    </td>
                    <td>
                      <span className="badge blue">
                        {TypeRequsetLabels[req.type_requser]}
                      </span>
                    </td>
                    <td>
                      <span className="badge muted">
                        {TypeDocumentLabels[req.type_document]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Calendar size={12} />
                        {new Date(req.created_at).toLocaleDateString('ar-SA')}
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

        <div className="pagination" aria-label="التنقل بين صفحات الطلبات">
          <span className="pagination-summary">
            عرض {requests.length} من أصل {totalCount} نتيجة
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
                  aria-current={pageNumber === page ? 'page' : undefined}
                >
                  {pageNumber}
                </button>
              )
            ))}
            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages || isLoading} onClick={() => setPage(page + 1)}>
              التالية <ChevronLeft size={16} />
            </button>
          </div>
          {page < totalPages && (
            <button className="pagination-next" disabled={isLoading} onClick={() => setPage(page + 1)}>
              {isLoading ? <LoaderCircle className="loading-icon" size={16} /> : <ChevronLeft size={16} />}
              {isLoading ? 'جاري تحميل الصفحة التالية...' : 'فتح الصفحة التالية'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
