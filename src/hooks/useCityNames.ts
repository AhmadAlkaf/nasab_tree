'use client';

import { useEffect, useState } from 'react';
import { getCities } from '@/lib/api';

export function useCityNameMap() {
  const [cityNames, setCityNames] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    let mounted = true;
    getCities().then(res => {
      if (mounted && res.success && res.data) {
        const map = new Map<number, string>();
        res.data.forEach(c => map.set(c.id, c.name));
        setCityNames(map);
      }
    });
    return () => { mounted = false; };
  }, []);

  const getCityName = (id: number | null | undefined): string => {
    if (!id) return '-';
    return cityNames.get(id) || '-';
  };

  return { cityNames, getCityName };
}