'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchPersons, getPerson } from '@/lib/api';
import { Person, Gender, GenderLabels, SearchResult } from '@/types';
import { Search, X, User } from 'lucide-react';

interface ParentSelectorProps {
  label: string;
  value: number | null;
  onChange: (id: number | null, person?: Person) => void;
  genderFilter?: Gender;
  excludeId?: number;
  placeholder?: string;
  hint?: string;
}

export default function ParentSelector({
  label,
  value,
  onChange,
  genderFilter,
  excludeId,
  placeholder = 'ابحث بالاسم...',
  hint,
}: ParentSelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    const res = await searchPersons(q);
    if (res.success && res.data) {
      let filtered = res.data;
      if (genderFilter) {
        filtered = filtered.filter(r => r.person.gender === genderFilter);
      }
      if (excludeId) {
        filtered = filtered.filter(r => r.person.id !== excludeId);
      }
      setResults(filtered);
    }
    setIsLoading(false);
  }, [genderFilter, excludeId]);

  const handleInputChange = (val: string) => {
    setQuery(val);
    setIsOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 200);
  };

  const handleSelect = (result: SearchResult) => {
    setSelectedPerson(result.person);
    onChange(result.person.id, result.person);
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  const handleClear = () => {
    setSelectedPerson(null);
    onChange(null);
    setQuery('');
    setResults([]);
  };

  useEffect(() => {
    if (value && !selectedPerson) {
      getPerson(value).then(res => {
        if (res.success && res.data) {
          setSelectedPerson(res.data);
        }
      });
    }
    if (!value) {
      setSelectedPerson(null);
    }
  }, [value, selectedPerson]);

  return (
    <div className="form-group" ref={wrapperRef}>
      <label className="form-label">{label}</label>
      
      {value && selectedPerson ? (
        <div className="search-selected">
          <div
            className="list-item-avatar"
            style={{
              width: 28,
              height: 28,
              fontSize: 12,
              background: selectedPerson.gender === 'M'
                ? 'rgba(59,130,246,0.12)'
                : 'rgba(236,72,153,0.12)',
              color: selectedPerson.gender === 'M'
                ? 'var(--blue-400)'
                : 'var(--pink-400)',
            }}
          >
            <User size={14} />
          </div>
          <span className="search-selected-name">
            {selectedPerson.name}
            {selectedPerson.kunya && ` (${selectedPerson.kunya})`}
          </span>
          <span className="badge muted" style={{ fontSize: 10 }}>
            {GenderLabels[selectedPerson.gender]}
          </span>
          <button
            type="button"
            className="search-selected-remove"
            onClick={handleClear}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            className="form-input"
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => { if (query) setIsOpen(true); }}
            placeholder={placeholder}
          />
          
          {isOpen && (query.trim() || isLoading) && (
            <div className="search-dropdown">
              {isLoading ? (
                <div style={{ padding: 16, textAlign: 'center' }}>
                  <div className="loading-spinner" />
                </div>
              ) : results.length > 0 ? (
                results.map((result) => (
                  <div
                    key={result.person.id}
                    className="search-item"
                    onClick={() => handleSelect(result)}
                  >
                    <div
                      className="list-item-avatar"
                      style={{
                        width: 32,
                        height: 32,
                        fontSize: 13,
                        background: result.person.gender === 'M'
                          ? 'rgba(59,130,246,0.12)'
                          : 'rgba(236,72,153,0.12)',
                        color: result.person.gender === 'M'
                          ? 'var(--blue-400)'
                          : 'var(--pink-400)',
                      }}
                    >
                      <User size={14} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="search-item-name">{result.person.name}</div>
                      <div className="search-item-lineage">{result.lineage}</div>
                    </div>
                    <div className="search-item-badge">
                      <span className={`badge ${result.person.gender === 'M' ? 'blue' : 'pink'}`}>
                        {GenderLabels[result.person.gender]}
                      </span>
                    </div>
                  </div>
                ))
              ) : query.trim() ? (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  لا توجد نتائج
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
      
      {hint && <div className="form-hint">{hint}</div>}
    </div>
  );
}
