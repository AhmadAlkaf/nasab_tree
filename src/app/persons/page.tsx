'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Person, GenderLabels, TypePersonLabels } from '@/types';
import { getPersonsPage } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { usePageAccess, useCan, PERM } from '@/lib/auth';
import { Search, UserPlus, ChevronLeft, User, ChevronRight, LoaderCircle } from 'lucide-react';
import { truncateLineageName } from '@/lib/utils';

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

export default function PersonsPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'exact' | 'partial'>('exact');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const { refreshKey } = useAppStore();
  const router = useRouter();
  const allowed = usePageAccess(PERM.person.view);
  const can = useCan();

  useEffect(() => {
    const fetchPersons = async () => {
      setIsLoading(true);
      const res = await getPersonsPage(page, pageSize, {
        search: query,
        search_mode: searchMode,
        gender: filterGender,
        type: filterType,
        level: filterLevel,
      });
      if (res.success && res.data) {
        setPersons(res.data.results);
        setTotalCount(res.data.count);
      }
      setIsLoading(false);
    };

    const delaySearch = setTimeout(fetchPersons, query.trim() ? 300 : 0);
    return () => clearTimeout(delaySearch);
  }, [refreshKey, page, pageSize, query, searchMode, filterGender, filterType, filterLevel]);

  const changeFilter = (setter: (value: string) => void, value: string) => {
    setter(value);
    setPage(1);
  };

  const handleRowClick = (id: number) => {
    router.push(`/persons/${id}`);
  };

  const displayedPersons = persons;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageNumbers = getVisiblePageNumbers(page, totalPages);

  if (!allowed) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">إدارة الإثبات</h1>
          <div className="page-subtitle">إدارة بحث وإثبات النسب</div>
        </div>
        <div className="page-header-right">
          {can(PERM.person.add) && (
            <Link href="/persons/new" className="btn btn-primary">
              <UserPlus size={18} />
              إضافة شخص جديد
            </Link>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-wrapper" style={{ width: '100%', maxWidth: 300 }}>
            <Search className="search-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="ابحث بالاسم أو اللقب..."
              value={query}
              onChange={(e) => changeFilter(setQuery, e.target.value)}
            />
          </div>
          <select
            className="form-select"
            value={searchMode}
            onChange={(e) => { setSearchMode(e.target.value as 'exact' | 'partial'); setPage(1); }}
            style={{ width: 140 }}
          >
            <option value="exact">المطابقة التامة</option>
            <option value="partial">المطابقة الجزئية</option>
          </select>
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
              <option value={25}>25 نتيجة</option>
              <option value={50}>50 نتيجة</option>
              <option value={100}>100 نتيجة</option>
            </select>
            <select
              className="form-select"
              value={filterGender}
              onChange={(e) => changeFilter(setFilterGender, e.target.value)}
            >
              <option value="">كل الأجناس</option>
              <option value="M">ذكر</option>
              <option value="F">أنثى</option>
            </select>
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => changeFilter(setFilterType, e.target.value)}
            >
              <option value="">كل الأنواع</option>
              {Object.entries(TypePersonLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              className="form-input"
              style={{ width: 120 }}
              placeholder="المستوى"
              value={filterLevel}
              onChange={(e) => changeFilter(setFilterLevel, e.target.value)}
            />
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>اللقب/الكنية</th>
                <th>الجنس</th>
                <th>النوع</th>
                <th>المستوى</th>
                <th>سنة الميلاد</th>
                <th>سنة الوفاة</th>
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
              ) : displayedPersons.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                    لا توجد نتائج مطابقة للبحث أو الفلتر
                  </td>
                </tr>
              ) : (
                displayedPersons.map((person) => (
                  <tr 
                    key={person.id} 
                    onClick={() => handleRowClick(person.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div 
                          style={{ 
                            width: 32, height: 32, borderRadius: '50%', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: person.gender === 'M' ? 'rgba(59,130,246,0.1)' : 'rgba(236,72,153,0.1)',
                            color: person.gender === 'M' ? 'var(--blue-400)' : 'var(--pink-400)'
                          }}
                        >
                          <User size={16} />
                        </div>
                        <span className="table-name">
                          {truncateLineageName(person.lineage_name || person.name)}
                        </span>
                      </div>
                    </td>
                    <td>{person.title || person.kunya ? `${person.title} ${person.kunya}` : '-'}</td>
                    <td>
                      <span className={`badge ${person.gender === 'M' ? 'blue' : 'pink'}`}>
                        {GenderLabels[person.gender]}
                      </span>
                    </td>
                    <td>
                      <span className="badge muted">
                        {TypePersonLabels[person.type_person]}
                      </span>
                    </td>
                    <td>
                      <span className="badge gold">
                        الطبقة {person.level}
                      </span>
                    </td>
                    <td>{person.birth_year || '-'}</td>
                    <td>{person.death_year || '-'}</td>
                    <td style={{ textAlign: 'left' }}>
                      <ChevronLeft size={18} style={{ color: 'var(--text-muted)' }} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination" aria-label="التنقل بين صفحات الأشخاص">
          <span className="pagination-summary">
            عرض {displayedPersons.length} من أصل {totalCount} نتيجة
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
