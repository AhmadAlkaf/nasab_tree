'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchCities } from '@/lib/api';
import { City } from '@/types';
import { MapPin, X, Search } from 'lucide-react';

interface CitySelectorProps {
  label: string;
  value: number | null;
  onChange: (id: number | null) => void;
}

export default function CitySelector({ label, value, onChange }: CitySelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const res = await searchCities(q);
    if (res.success && res.data) {
      setResults(res.data);
    }
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    setIsOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 150);
  };

  const handleSelect = (city: City) => {
    setSelectedCity(city);
    onChange(city.id);
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = () => {
    setSelectedCity(null);
    onChange(null);
  };

  useEffect(() => {
    if (value && !selectedCity) {
      searchCities('').then(res => {
        if (res.success && res.data) {
          const found = res.data.find(c => c.id === value);
          if (found) setSelectedCity(found);
        }
      });
    }
    if (!value) setSelectedCity(null);
  }, [value, selectedCity]);

  return (
    <div className="form-group" ref={wrapperRef}>
      <label className="form-label">{label}</label>
      
      {value && selectedCity ? (
        <div className="search-selected">
          <MapPin size={14} style={{ color: 'var(--emerald-400)' }} />
          <span className="search-selected-name" style={{ color: 'var(--emerald-400)' }}>
            {selectedCity.name}
            {selectedCity.country && ` - ${selectedCity.country}`}
          </span>
          <button type="button" className="search-selected-remove" onClick={handleClear}>
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
            onFocus={() => { setIsOpen(true); doSearch(query); }}
            placeholder="ابحث عن مدينة..."
          />
          
          {isOpen && results.length > 0 && (
            <div className="search-dropdown">
              {results.map((city) => (
                <div
                  key={city.id}
                  className="search-item"
                  onClick={() => handleSelect(city)}
                >
                  <MapPin size={14} style={{ color: 'var(--emerald-400)' }} />
                  <div>
                    <div className="search-item-name">{city.name}</div>
                    {city.country && (
                      <div className="search-item-lineage">{city.country}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
