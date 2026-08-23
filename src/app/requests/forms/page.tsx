'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  TypeFormLabels,
  GenderLabels,
  TypeMotherLabels,
} from '@/types';
import { getAllFormRequsersPage } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  Calendar,
  MapPin,
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

interface FormWithRequserName {
  id: number;
  name: string;
  requser_id: number;
  gender: string;
  type_form: number;
  parent_id: number | null;
  birth_year: number | null;
  death_year: number | null;
  birth_place_id: number | null;
  death_place_id: number | null;
  name_birth_place: string | null;
  name_place_place: string | null;
  name_death_place: string | null;
  type_mother: number;
  name_mother: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  requser_name?: string;
}

export default function FormsPage() {
  const [forms, setForms] = useState<FormWithRequserName[]>([]);
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const { refreshKey } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const fetchForms = async () => {
      setIsLoading(true);
      const res = await getAllFormRequsersPage(page, pageSize, {
        search: query,
        type_form: filterType,
      });
      if (res.success && res.data) {
        setForms(res.data.results);
        setTotalCount(res.data.count);
      }
      setIsLoading(false);
    };

    const delaySearch = setTimeout(fetchForms, query.trim() ? 300 : 0);
    return () => clearTimeout(delaySearch);
  }, [refreshKey, page, pageSize, query, filterType]);

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
          <h1 className="page-title">استمارات الطلبات</h1>
          <div className="page-subtitle">جميع الأشخاص المدخلين في الطلبات</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper" style={{ width: '100%', maxWidth: 400 }}>
            <Search className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="ابحث بالاسم..."
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
              value={filterType}
              onChange={(e) => changeFilter(setFilterType, e.target.value)}
            >
              <option value="">كل الأنواع</option>
              {Object.entries(TypeFormLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الطلب</th>
                <th>الجنس</th>
                <th>نوع البيانات</th>
                <th>الميلاد</th>
                <th>الوفاة</th>
                <th>الأم</th>
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
              ) : forms.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    لا توجد استمارات مطابقة للبحث أو الفلتر
                  </td>
                </tr>
              ) : (
                forms.map((form) => (
                  <tr
                    key={form.id}
                    onClick={() => router.push(`/requests/${form.requser_id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: form.gender === 'M' ? 'rgba(59,130,246,0.1)' : 'rgba(236,72,153,0.1)',
                            color: form.gender === 'M' ? 'var(--blue-400)' : 'var(--pink-400)'
                          }}
                        >
                          <User size={16} />
                        </div>
                        <span>{form.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge muted">
                        <Users size={10} />
                        {form.requser_name || `طلب #${form.requser_id}`}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${form.gender === 'M' ? 'blue' : 'pink'}`}>
                        {GenderLabels[form.gender as 'M' | 'F'] || form.gender}
                      </span>
                    </td>
                    <td>
                      <span className="badge muted">
                        {TypeFormLabels[form.type_form as keyof typeof TypeFormLabels] || form.type_form}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Calendar size={12} />
                        {form.birth_year || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                        <Calendar size={12} />
                        {form.death_year || '-'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                        <MapPin size={12} />
                        {form.name_mother || TypeMotherLabels[form.type_mother as keyof typeof TypeMotherLabels] || '-'}
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
            عرض {forms.length} من أصل {totalCount} نتيجة
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
