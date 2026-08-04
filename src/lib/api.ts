import { Person, Wife, Source, City, PersonFormData, WifeFormData, SourceFormData, ApiResponse, SearchResult } from '@/types';
import { mockPersons, mockWives, mockSources, mockCities } from './mock-data';

// ===== Simulated delay =====
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ===== In-memory data store =====
let persons = [...mockPersons];
let wives = [...mockWives];
let sources = [...mockSources];
let nextPersonId = Math.max(...persons.map(p => p.id)) + 1;
let nextWifeId = Math.max(...wives.map(w => w.id)) + 1;
let nextSourceId = Math.max(...sources.map(s => s.id)) + 1;

// ===== Helper: Build lineage string =====
function getLineage(personId: number, depth: number = 4): string {
  const parts: string[] = [];
  let currentId: number | null = personId;
  let count = 0;
  while (currentId && count < depth) {
    const person = persons.find(p => p.id === currentId);
    if (!person) break;
    parts.push(person.name);
    currentId = person.parent_id;
    count++;
  }
  return parts.join(' بن ');
}

// ===== Person API =====

export async function getPersons(): Promise<ApiResponse<Person[]>> {
  await delay(200);
  return { success: true, data: [...persons] };
}

export async function getPerson(id: number): Promise<ApiResponse<Person>> {
  await delay(150);
  const person = persons.find(p => p.id === id);
  if (!person) return { success: false, error: 'الشخص غير موجود' };
  
  // Enrich with relations
  const enriched: Person = {
    ...person,
    parent: person.parent_id ? persons.find(p => p.id === person.parent_id) || null : null,
    mother: person.mother_id ? persons.find(p => p.id === person.mother_id) || null : null,
    birth_place: person.birth_place_id ? mockCities.find(c => c.id === person.birth_place_id) || null : null,
    death_place: person.death_place_id ? mockCities.find(c => c.id === person.death_place_id) || null : null,
    children: persons.filter(p => p.parent_id === id),
  };
  
  return { success: true, data: enriched };
}

export async function createPerson(data: PersonFormData): Promise<ApiResponse<Person>> {
  await delay(300);
  
  if (!data.name.trim()) {
    return { success: false, error: 'الاسم مطلوب' };
  }
  
  const now = new Date().toISOString();
  const newPerson: Person = {
    id: nextPersonId++,
    name: data.name,
    kunya: data.kunya,
    title: data.title,
    gender: data.gender,
    parent_id: data.parent_id,
    type_person: data.type_person,
    birth_year: data.birth_year,
    death_year: data.death_year,
    number: data.number,
    birth_place_id: data.birth_place_id,
    death_place_id: data.death_place_id,
    mother_id: data.mother_id,
    type_mother: data.type_mother,
    number_mother: data.number_mother,
    name_mother: data.name_mother,
    note: data.note,
    file: null,
    created_at: now,
    updated_at: now,
  };
  
  persons.push(newPerson);
  return { success: true, data: newPerson };
}

export async function updatePerson(id: number, data: Partial<PersonFormData>): Promise<ApiResponse<Person>> {
  await delay(300);
  
  const index = persons.findIndex(p => p.id === id);
  if (index === -1) return { success: false, error: 'الشخص غير موجود' };
  
  persons[index] = {
    ...persons[index],
    ...data,
    file: persons[index].file,
    updated_at: new Date().toISOString(),
  };
  
  return { success: true, data: persons[index] };
}

export async function deletePerson(id: number): Promise<ApiResponse<null>> {
  await delay(200);
  
  const hasChildren = persons.some(p => p.parent_id === id);
  if (hasChildren) {
    return { success: false, error: 'لا يمكن حذف شخص لديه أبناء' };
  }
  
  persons = persons.filter(p => p.id !== id);
  wives = wives.filter(w => w.person_id !== id);
  sources = sources.filter(s => s.person_id !== id);
  
  return { success: true, data: null };
}

export async function searchPersons(query: string): Promise<ApiResponse<SearchResult[]>> {
  await delay(100);
  
  const q = query.toLowerCase().trim();
  if (!q) return { success: true, data: [] };
  
  const results = persons
    .filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.kunya.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q)
    )
    .slice(0, 15)
    .map(p => ({
      person: p,
      lineage: getLineage(p.id),
    }));
  
  return { success: true, data: results };
}

export async function getPersonTree(rootId?: number): Promise<ApiResponse<Person[]>> {
  await delay(200);
  
  if (rootId) {
    // Get subtree from root
    const collectDescendants = (parentId: number): Person[] => {
      const children = persons.filter(p => p.parent_id === parentId);
      const result: Person[] = [];
      for (const child of children) {
        result.push(child);
        result.push(...collectDescendants(child.id));
      }
      return result;
    };
    
    const root = persons.find(p => p.id === rootId);
    if (!root) return { success: false, error: 'الجذر غير موجود' };
    
    return { success: true, data: [root, ...collectDescendants(rootId)] };
  }
  
  return { success: true, data: [...persons] };
}

// ===== Wife API =====

export async function getWivesByPerson(personId: number): Promise<ApiResponse<Wife[]>> {
  await delay(150);
  const personWives = wives
    .filter(w => w.person_id === personId)
    .map(w => ({
      ...w,
      birth_place: w.birth_place_id ? mockCities.find(c => c.id === w.birth_place_id) || null : null,
      death_place: w.death_place_id ? mockCities.find(c => c.id === w.death_place_id) || null : null,
    }));
  return { success: true, data: personWives };
}

export async function createWife(data: WifeFormData): Promise<ApiResponse<Wife>> {
  await delay(300);
  
  if (!data.name.trim()) {
    return { success: false, error: 'اسم الزوجة مطلوب' };
  }
  
  const now = new Date().toISOString();
  const newWife: Wife = {
    id: nextWifeId++,
    person_id: data.person_id,
    the_wife_id: data.the_wife_id,
    number: data.number,
    name: data.name,
    birth_year: data.birth_year,
    death_year: data.death_year,
    birth_place_id: data.birth_place_id,
    death_place_id: data.death_place_id,
    created_at: now,
    updated_at: now,
  };
  
  wives.push(newWife);
  return { success: true, data: newWife };
}

export async function updateWife(id: number, data: Partial<WifeFormData>): Promise<ApiResponse<Wife>> {
  await delay(300);
  
  const index = wives.findIndex(w => w.id === id);
  if (index === -1) return { success: false, error: 'الزوجة غير موجودة' };
  
  wives[index] = {
    ...wives[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  
  return { success: true, data: wives[index] };
}

export async function deleteWife(id: number): Promise<ApiResponse<null>> {
  await delay(200);
  wives = wives.filter(w => w.id !== id);
  return { success: true, data: null };
}

// ===== Source API =====

export async function getSourcesByPerson(personId: number): Promise<ApiResponse<Source[]>> {
  await delay(150);
  const personSources = sources.filter(s => s.person_id === personId);
  return { success: true, data: personSources };
}

export async function createSource(data: SourceFormData): Promise<ApiResponse<Source>> {
  await delay(300);
  
  if (!data.name.trim()) {
    return { success: false, error: 'اسم المصدر مطلوب' };
  }
  
  const now = new Date().toISOString();
  const newSource: Source = {
    id: nextSourceId++,
    person_id: data.person_id,
    name: data.name,
    capt_number: data.capt_number,
    shelf_number: data.shelf_number,
    volume_number: data.volume_number,
    manuscript_number: data.manuscript_number,
    page_number: data.page_number,
    file: null,
    is_primary: data.is_primary,
    description: data.description,
    created_at: now,
    updated_at: now,
  };
  
  sources.push(newSource);
  return { success: true, data: newSource };
}

export async function updateSource(id: number, data: Partial<SourceFormData>): Promise<ApiResponse<Source>> {
  await delay(300);
  
  const index = sources.findIndex(s => s.id === id);
  if (index === -1) return { success: false, error: 'المصدر غير موجود' };
  
  sources[index] = {
    ...sources[index],
    ...data,
    file: sources[index].file,
    updated_at: new Date().toISOString(),
  };
  
  return { success: true, data: sources[index] };
}

export async function deleteSource(id: number): Promise<ApiResponse<null>> {
  await delay(200);
  sources = sources.filter(s => s.id !== id);
  return { success: true, data: null };
}

// ===== City API =====

export async function getCities(): Promise<ApiResponse<City[]>> {
  await delay(100);
  return { success: true, data: [...mockCities] };
}

export async function searchCities(query: string): Promise<ApiResponse<City[]>> {
  await delay(80);
  const q = query.toLowerCase().trim();
  if (!q) return { success: true, data: mockCities.slice(0, 10) };
  
  const results = mockCities.filter(c => 
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
  await delay(100);
  
  // Calculate generations
  let maxDepth = 0;
  const getDepth = (personId: number, depth: number): number => {
    const children = persons.filter(p => p.parent_id === personId);
    if (children.length === 0) return depth;
    return Math.max(...children.map(c => getDepth(c.id, depth + 1)));
  };
  const roots = persons.filter(p => !p.parent_id);
  for (const root of roots) {
    maxDepth = Math.max(maxDepth, getDepth(root.id, 1));
  }
  
  return {
    success: true,
    data: {
      totalPersons: persons.length,
      totalMales: persons.filter(p => p.gender === 'M').length,
      totalFemales: persons.filter(p => p.gender === 'F').length,
      totalWives: wives.length,
      totalSources: sources.length,
      generations: maxDepth,
    },
  };
}
