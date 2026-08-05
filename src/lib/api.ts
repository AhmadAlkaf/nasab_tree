import {
  Person, Wife, Source, City, ApiPerson,
  PersonFormData, WifeFormData, SourceFormData,
  ApiResponse, SearchResult,
  mapApiPersonToPerson, mapApiWifeToWife, mapApiSourceToSource,
} from '@/types';

// ===== Base URL (proxied through Next.js rewrites) =====
const BASE_URL = '/api';

// ===== Helper: API fetch =====
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {};
  
  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  const res = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });
  
  // Handle delete (204 No Content)
  if (res.status === 204) {
    return null as T;
  }
  
  if (!res.ok) {
    let errorMsg = `خطأ في الاتصال: ${res.status}`;
    try {
      const errorData = await res.json();
      if (typeof errorData === 'object') {
        // Django REST Framework returns errors as { field: [messages] }
        const messages = Object.entries(errorData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        if (messages) errorMsg = messages;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(errorMsg);
  }
  
  return res.json();
}

// ===== In-memory cache for all persons (for tree building, search, etc.) =====
let _cachedPersons: ApiPerson[] | null = null;
let _cacheTimestamp = 0;
const CACHE_TTL = 5000; // 5 seconds

async function fetchAllApiPersons(force = false): Promise<ApiPerson[]> {
  const now = Date.now();
  if (!force && _cachedPersons && (now - _cacheTimestamp) < CACHE_TTL) {
    return _cachedPersons;
  }
  _cachedPersons = await apiFetch<ApiPerson[]>('/persons/');
  _cacheTimestamp = now;
  return _cachedPersons;
}

function invalidateCache() {
  _cachedPersons = null;
  _cacheTimestamp = 0;
}

// ===== Helper: Build lineage string =====
function getLineage(personId: number, allPersons: ApiPerson[], depth: number = 4): string {
  const parts: string[] = [];
  let currentId: number | null = personId;
  let count = 0;
  while (currentId && count < depth) {
    const person = allPersons.find(p => p.id === currentId);
    if (!person) break;
    parts.push(person.name);
    currentId = person.parent;
    count++;
  }
  return parts.join(' بن ');
}

// ===== Person API =====

export async function getPersons(): Promise<ApiResponse<Person[]>> {
  try {
    const apiPersons = await fetchAllApiPersons(true);
    const persons = apiPersons.map(p => mapApiPersonToPerson(p, apiPersons));
    return { success: true, data: persons };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function getPerson(id: number): Promise<ApiResponse<Person>> {
  try {
    const apiPerson = await apiFetch<ApiPerson>(`/persons/${id}/`);
    // Also fetch all persons for parent/mother/children enrichment
    const allPersons = await fetchAllApiPersons();
    const person = mapApiPersonToPerson(apiPerson, allPersons);
    return { success: true, data: person };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createPerson(data: PersonFormData): Promise<ApiResponse<Person>> {
  try {
    let body: FormData | string;
    
    if (data.file) {
      // Use FormData for file uploads
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('kunya', data.kunya || '');
      formData.append('title', data.title || '');
      formData.append('gender', data.gender);
      if (data.parent !== null) formData.append('parent', data.parent.toString());
      formData.append('type_person', data.type_person.toString());
      if (data.birth_year !== null) formData.append('birth_year', data.birth_year.toString());
      if (data.death_year !== null) formData.append('death_year', data.death_year.toString());
      if (data.number !== null) formData.append('number', data.number.toString());
      if (data.birth_place !== null) formData.append('birth_place', data.birth_place.toString());
      if (data.death_place !== null) formData.append('death_place', data.death_place.toString());
      if (data.mother !== null) formData.append('mother', data.mother.toString());
      formData.append('type_mother', data.type_mother.toString());
      if (data.number_mother !== null) formData.append('number_mother', data.number_mother.toString());
      formData.append('name_mother', data.name_mother || '');
      formData.append('note', data.note || '');
      formData.append('file', data.file);
      body = formData as unknown as string; // TypeScript workaround
    } else {
      // JSON for non-file requests
      const jsonData: Record<string, unknown> = {
        name: data.name,
        kunya: data.kunya || '',
        title: data.title || '',
        gender: data.gender,
        type_person: data.type_person,
        type_mother: data.type_mother,
        name_mother: data.name_mother || '',
        note: data.note || '',
      };
      if (data.parent !== null) jsonData.parent = data.parent;
      if (data.birth_year !== null) jsonData.birth_year = data.birth_year;
      if (data.death_year !== null) jsonData.death_year = data.death_year;
      if (data.number !== null) jsonData.number = data.number;
      if (data.birth_place !== null) jsonData.birth_place = data.birth_place;
      if (data.death_place !== null) jsonData.death_place = data.death_place;
      if (data.mother !== null) jsonData.mother = data.mother;
      if (data.number_mother !== null) jsonData.number_mother = data.number_mother;
      body = JSON.stringify(jsonData);
    }
    
    const apiPerson = await apiFetch<ApiPerson>('/persons/', {
      method: 'POST',
      body: data.file ? body : body,
    });
    
    invalidateCache();
    const person = mapApiPersonToPerson(apiPerson);
    return { success: true, data: person };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updatePerson(id: number, data: Partial<PersonFormData>): Promise<ApiResponse<Person>> {
  try {
    const file = data.file;
    let body: FormData | string;
    
    if (file) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'file' && value instanceof File) {
          formData.append('file', value);
        } else if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      body = formData as unknown as string;
    } else {
      // Remove file from JSON payload, send only changed fields
      const jsonData: Record<string, unknown> = {};
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'file') return; // skip file field if null
        if (value !== undefined) {
          jsonData[key] = value;
        }
      });
      body = JSON.stringify(jsonData);
    }
    
    const apiPerson = await apiFetch<ApiPerson>(`/persons/${id}/`, {
      method: 'PATCH',
      body,
    });
    
    invalidateCache();
    const person = mapApiPersonToPerson(apiPerson);
    return { success: true, data: person };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deletePerson(id: number): Promise<ApiResponse<null>> {
  try {
    await apiFetch<null>(`/persons/${id}/`, {
      method: 'DELETE',
    });
    invalidateCache();
    return { success: true, data: null };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function searchPersons(query: string): Promise<ApiResponse<SearchResult[]>> {
  try {
    const allPersons = await fetchAllApiPersons();
    const q = query.toLowerCase().trim();
    
    let filtered = allPersons;
    if (q) {
      filtered = allPersons.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.kunya && p.kunya.toLowerCase().includes(q)) ||
        (p.title && p.title.toLowerCase().includes(q))
      );
    }
    
    const results = filtered.slice(0, 15).map(p => ({
      person: mapApiPersonToPerson(p, allPersons),
      lineage: getLineage(p.id, allPersons),
    }));
    
    return { success: true, data: results };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function getPersonTree(rootId?: number): Promise<ApiResponse<Person[]>> {
  try {
    const allApiPersons = await fetchAllApiPersons(true);
    
    let filtered = allApiPersons;
    if (rootId) {
      // Get subtree from root
      const collectDescendants = (parentId: number): ApiPerson[] => {
        const children = allApiPersons.filter(p => p.parent === parentId);
        const result: ApiPerson[] = [];
        for (const child of children) {
          result.push(child);
          result.push(...collectDescendants(child.id));
        }
        return result;
      };
      
      const root = allApiPersons.find(p => p.id === rootId);
      if (!root) return { success: false, error: 'الجذر غير موجود' };
      
      filtered = [root, ...collectDescendants(rootId)];
    }
    
    const persons = filtered.map(p => mapApiPersonToPerson(p, allApiPersons));
    return { success: true, data: persons };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ===== Wife API =====

export async function getWivesByPerson(personId: number): Promise<ApiResponse<Wife[]>> {
  try {
    // Wives are embedded in the person response, but we can also fetch separately
    const apiPerson = await apiFetch<ApiPerson>(`/persons/${personId}/`);
    const wives = (apiPerson.wife || []).map(w => mapApiWifeToWife(w));
    return { success: true, data: wives };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createWife(data: WifeFormData): Promise<ApiResponse<Wife>> {
  try {
    const jsonData: Record<string, unknown> = {
      name: data.name,
      person: data.person,
    };
    if (data.the_wife !== null) jsonData.the_wife = data.the_wife;
    if (data.number !== null) jsonData.number = data.number;
    if (data.birth_year !== null) jsonData.birth_year = data.birth_year;
    if (data.death_year !== null) jsonData.death_year = data.death_year;
    if (data.birth_place !== null) jsonData.birth_place = data.birth_place;
    if (data.death_place !== null) jsonData.death_place = data.death_place;

    const apiWife = await apiFetch<{ id: number; name: string; person: number; the_wife: number | null; number: number | null; birth_year: number | null; death_year: number | null; birth_place: number | null; death_place: number | null; created_at: string; updated_at: string }>('/wives/', {
      method: 'POST',
      body: JSON.stringify(jsonData),
    });
    
    invalidateCache();
    const wife: Wife = {
      id: apiWife.id,
      person_id: apiWife.person,
      the_wife_id: apiWife.the_wife,
      number: apiWife.number,
      name: apiWife.name,
      birth_year: apiWife.birth_year,
      death_year: apiWife.death_year,
      birth_place_id: apiWife.birth_place,
      death_place_id: apiWife.death_place,
      created_at: apiWife.created_at,
      updated_at: apiWife.updated_at,
    };
    return { success: true, data: wife };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updateWife(id: number, data: Partial<WifeFormData>): Promise<ApiResponse<Wife>> {
  try {
    const apiWife = await apiFetch<{ id: number; name: string; person: number; the_wife: number | null; number: number | null; birth_year: number | null; death_year: number | null; birth_place: number | null; death_place: number | null; created_at: string; updated_at: string }>(`/wives/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    invalidateCache();
    const wife: Wife = {
      id: apiWife.id,
      person_id: apiWife.person,
      the_wife_id: apiWife.the_wife,
      number: apiWife.number,
      name: apiWife.name,
      birth_year: apiWife.birth_year,
      death_year: apiWife.death_year,
      birth_place_id: apiWife.birth_place,
      death_place_id: apiWife.death_place,
      created_at: apiWife.created_at,
      updated_at: apiWife.updated_at,
    };
    return { success: true, data: wife };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteWife(id: number): Promise<ApiResponse<null>> {
  try {
    await apiFetch<null>(`/wives/${id}/`, { method: 'DELETE' });
    invalidateCache();
    return { success: true, data: null };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ===== Source API =====

export async function getSourcesByPerson(personId: number): Promise<ApiResponse<Source[]>> {
  try {
    // Sources are embedded in the person response
    const apiPerson = await apiFetch<ApiPerson>(`/persons/${personId}/`);
    const sources = (apiPerson.source || []).map(s => mapApiSourceToSource(s));
    return { success: true, data: sources };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createSource(data: SourceFormData): Promise<ApiResponse<Source>> {
  try {
    let body: FormData | string;
    
    if (data.file) {
      const formData = new FormData();
      formData.append('panson', data.panson.toString());
      formData.append('name', data.name);
      formData.append('capt_number', data.capt_number);
      formData.append('shelf_number', data.shelf_number);
      formData.append('volume_number', data.volume_number);
      formData.append('manuscript_number', data.manuscript_number);
      formData.append('page_number', data.page_number);
      formData.append('is_primary', data.is_primary.toString());
      formData.append('description', data.description);
      formData.append('file', data.file);
      body = formData as unknown as string;
    } else {
      body = JSON.stringify({
        panson: data.panson,
        name: data.name,
        capt_number: data.capt_number,
        shelf_number: data.shelf_number,
        volume_number: data.volume_number,
        manuscript_number: data.manuscript_number,
        page_number: data.page_number,
        is_primary: data.is_primary,
        description: data.description,
      });
    }
    
    const apiSource = await apiFetch<{ id: number; panson: number; name: string; capt_number: string; shelf_number: string; volume_number: string; manuscript_number: string; page_number: string; file: string | null; is_primary: boolean; description: string; created_at: string; updated_at: string }>('/sources/', {
      method: 'POST',
      body,
    });
    
    invalidateCache();
    const source: Source = {
      id: apiSource.id,
      person_id: apiSource.panson,
      name: apiSource.name,
      capt_number: apiSource.capt_number,
      shelf_number: apiSource.shelf_number,
      volume_number: apiSource.volume_number,
      manuscript_number: apiSource.manuscript_number,
      page_number: apiSource.page_number,
      file: apiSource.file,
      is_primary: apiSource.is_primary,
      description: apiSource.description,
      created_at: apiSource.created_at,
      updated_at: apiSource.updated_at,
    };
    return { success: true, data: source };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updateSource(id: number, data: Partial<SourceFormData>): Promise<ApiResponse<Source>> {
  try {
    const apiSource = await apiFetch<{ id: number; panson: number; name: string; capt_number: string; shelf_number: string; volume_number: string; manuscript_number: string; page_number: string; file: string | null; is_primary: boolean; description: string; created_at: string; updated_at: string }>(`/sources/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    
    invalidateCache();
    const source: Source = {
      id: apiSource.id,
      person_id: apiSource.panson,
      name: apiSource.name,
      capt_number: apiSource.capt_number,
      shelf_number: apiSource.shelf_number,
      volume_number: apiSource.volume_number,
      manuscript_number: apiSource.manuscript_number,
      page_number: apiSource.page_number,
      file: apiSource.file,
      is_primary: apiSource.is_primary,
      description: apiSource.description,
      created_at: apiSource.created_at,
      updated_at: apiSource.updated_at,
    };
    return { success: true, data: source };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteSource(id: number): Promise<ApiResponse<null>> {
  try {
    await apiFetch<null>(`/sources/${id}/`, { method: 'DELETE' });
    invalidateCache();
    return { success: true, data: null };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// ===== City API (local data - no backend endpoint) =====

const localCities: City[] = [
  { id: 1, name: 'تريم', country: 'اليمن' },
  { id: 2, name: 'سيئون', country: 'اليمن' },
  { id: 3, name: 'المكلا', country: 'اليمن' },
  { id: 4, name: 'عدن', country: 'اليمن' },
  { id: 5, name: 'صنعاء', country: 'اليمن' },
  { id: 6, name: 'حضرموت', country: 'اليمن' },
  { id: 7, name: 'مكة المكرمة', country: 'السعودية' },
  { id: 8, name: 'المدينة المنورة', country: 'السعودية' },
  { id: 9, name: 'جدة', country: 'السعودية' },
  { id: 10, name: 'جاكرتا', country: 'إندونيسيا' },
  { id: 11, name: 'سنغافورة', country: 'سنغافورة' },
  { id: 12, name: 'القاهرة', country: 'مصر' },
  { id: 13, name: 'دمشق', country: 'سوريا' },
  { id: 14, name: 'بغداد', country: 'العراق' },
  { id: 15, name: 'الشحر', country: 'اليمن' },
];

export async function getCities(): Promise<ApiResponse<City[]>> {
  return { success: true, data: [...localCities] };
}

export async function searchCities(query: string): Promise<ApiResponse<City[]>> {
  const q = query.toLowerCase().trim();
  if (!q) return { success: true, data: localCities.slice(0, 10) };
  
  const results = localCities.filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.country && c.country.toLowerCase().includes(q))
  );
  return { success: true, data: results };
}

// ===== Stats =====

export async function getStats(): Promise<ApiResponse<{
  totalPersons: number;
  totalMales: number;
  totalFemales: number;
  totalWives: number;
  totalSources: number;
  generations: number;
}>> {
  try {
    const apiPersons = await fetchAllApiPersons(true);
    
    // Calculate generations from level field
    const maxLevel = apiPersons.reduce((max, p) => Math.max(max, p.level), 0);
    
    // Count wives and sources from embedded data
    let totalWives = 0;
    let totalSources = 0;
    apiPersons.forEach(p => {
      totalWives += (p.wife || []).length;
      totalSources += (p.source || []).length;
    });
    
    return {
      success: true,
      data: {
        totalPersons: apiPersons.length,
        totalMales: apiPersons.filter(p => p.gender === 'M').length,
        totalFemales: apiPersons.filter(p => p.gender === 'F').length,
        totalWives,
        totalSources,
        generations: maxLevel + 1,
      },
    };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
