'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Person, SearchResult, GenderLabels, TypePersonLabels } from '@/types';
import { getPersons, searchPersons } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Search, UserPlus, ChevronLeft, User } from 'lucide-react';
import { truncateLineageName } from '@/lib/utils';

export default function PersonsPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { refreshKey } = useAppStore();
  const router = useRouter();

  useEffect(() => {
    const fetchPersons = async () => {
      setIsLoading(true);
      const res = await getPersons();
      if (res.success && res.data) {
        setPersons(res.data);
      }
      setIsLoading(false);
    };
    
    if (!query) {
      fetchPersons();
    }
  }, [refreshKey, query]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    const delaySearch = setTimeout(async () => {
      setIsLoading(true);
      const res = await searchPersons(query);
      if (res.success && res.data) {
        setSearchResults(res.data);
      }
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(delaySearch);
  }, [query]);

  const handleRowClick = (id: number) => {
    router.push(`/persons/${id}`);
  };

  const displayedPersons = (query ? searchResults.map(r => r.person) : persons).filter(person => {
    if (filterGender && person.gender !== filterGender) return false;
    if (filterType && person.type_person.toString() !== filterType) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">الأشخاص</h1>
          <div className="page-subtitle">سجل جميع الأفراد في الشجرة النسبية</div>
        </div>
        <div className="page-header-right">
          <Link href="/persons/new" className="btn btn-primary">
            <UserPlus size={18} />
            إضافة شخص جديد
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
              placeholder="ابحث بالاسم أو اللقب..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              className="form-select"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <option value="">كل الأجناس</option>
              <option value="M">ذكر</option>
              <option value="F">أنثى</option>
            </select>
            <select
              className="form-select"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">كل الأنواع</option>
              {Object.entries(TypePersonLabels).map(([key, label]) => (
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
                <th>اللقب/الكنية</th>
                <th>الجنس</th>
                <th>النوع</th>
                <th>سنة الميلاد</th>
                <th>سنة الوفاة</th>
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
              ) : displayedPersons.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
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
      </div>
    </div>
  );
}
