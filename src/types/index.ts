// ===== Enums matching Django IntegerChoices =====

export enum TypePerson {
  extinct = 1,
  females_only = 2,
  punish_extinct = 3,
  contract = 4,
  included = 5,
  punish_included = 6,
  brotherhood_agreement = 7,
  smaller_larger = 8,
  included_extinct_females_only = 9,
  extinct_females_only = 10,
  unknown = 11,
  not_unknown = 12,
}

export const TypePersonLabels: Record<TypePerson, string> = {
  [TypePerson.extinct]: 'ض',
  [TypePerson.females_only]: 'ب',
  [TypePerson.punish_extinct]: 'ع ض',
  [TypePerson.contract]: 'د ع',
  [TypePerson.included]: 'ج',
  [TypePerson.punish_included]: 'ج ض',
  [TypePerson.brotherhood_agreement]: 'ك',
  [TypePerson.smaller_larger]: 'د',
  [TypePerson.included_extinct_females_only]: 'ج ض ب',
  [TypePerson.extinct_females_only]: 'ض ب',
  [TypePerson.unknown]: 'عادي',
  [TypePerson.not_unknown]: '     ',
};

export const TypePersonDescriptions: Record<TypePerson, string> = {
  [TypePerson.extinct]: 'منقرض',
  [TypePerson.females_only]: 'بنات فقط',
  [TypePerson.punish_extinct]: 'عقب منقرض',
  [TypePerson.contract]: 'دخل عقد',
  [TypePerson.included]: 'جامع',
  [TypePerson.punish_included]: 'جامع منقرض',
  [TypePerson.brotherhood_agreement]: 'كريم',
  [TypePerson.smaller_larger]: 'داخل',
  [TypePerson.included_extinct_females_only]: 'جامع منقرض بنات فقط',
  [TypePerson.extinct_females_only]: 'منقرض بنات فقط',
  [TypePerson.unknown]: 'عادي',
  [TypePerson.not_unknown]: '     ',
};

export enum TypeMother {
  alawi = 1,
  al_Bayt = 2,
  Arab = 3,
  foreign = 4,
  walad = 5,
  unknown = 6,
}

export const TypeMotherLabels: Record<TypeMother, string> = {
  [TypeMother.alawi]: 'ام من آل باعلوي',
  [TypeMother.al_Bayt]: 'ام من آل البيت',
  [TypeMother.Arab]: 'ام عربية',
  [TypeMother.foreign]: 'ام اجنبية',
  [TypeMother.walad]: 'ام ولد',
  [TypeMother.unknown]: 'لم تعرف لدينا',
};

export type Gender = 'M' | 'F';

export const GenderLabels: Record<Gender, string> = {
  M: 'ذكر',
  F: 'أنثى',
};

// ===== Data Models =====

export interface City {
  id: number;
  name: string;
  country?: string;
}

// ===== API Response shape from Django =====

export interface ApiWife {
  id: number;
  number: number | null;
  name: string;
  birth_year: number | null;
  death_year: number | null;
  created_at: string;
  updated_at: string;
  person: number;
  the_wife: number | null;
  birth_place: number | null;
  death_place: number | null;
}

export interface ApiSource {
  id: number;
  name: string;
  capt_number: string;
  shelf_number: string;
  volume_number: string;
  manuscript_number: string;
  page_number: string;
  file: string | null;
  is_primary: boolean;
  description: string;
  created_at: string;
  updated_at: string;
  panson: number;
}

export interface ApiPerson {
  id: number;
  wife: ApiWife[];
  source: ApiSource[];
  name_type_person: string;
  name_type_mother: string;
  name: string;
  kunya: string;
  title: string;
  gender: Gender;
  type_person: TypePerson;
  birth_year: number | null;
  death_year: number | null;
  number: number | null;
  type_mother: TypeMother;
  number_mother: number | null;
  name_mother: string | null;
  name_birth_place: string | null;
  name_place_place: string | null;
  name_death_place: string | null;
  lineage_name: string | null;
  note: string | null;
  file: string | null;
  created_at: string;
  updated_at: string;
  lft: number;
  rght: number;
  tree_id: number;
  level: number;
  parent: number | null;
  birth_place: number | null;
  death_place: number | null;
  mother: number | null;
  children?: ApiPerson[] | boolean;
}

// ===== Internal Person model (enriched) =====

export interface Person {
  id: number;
  name: string;
  kunya: string;
  title: string;
  gender: Gender;
  parent_id: number | null;
  parent?: Person | null;
  type_person: TypePerson;
  name_type_person?: string;
  birth_year: number | null;
  death_year: number | null;
  number: number | null;
  birth_place_id: number | null;
  birth_place?: City | null;
  death_place_id: number | null;
  death_place?: City | null;
  mother_id: number | null;
  mother?: Person | null;
  type_mother: TypeMother;
  name_type_mother?: string;
  number_mother: number | null;
  name_mother: string;
  name_birth_place: string;
  name_place_place: string;
  name_death_place: string;
  lineage_name: string;
  note: string;
  file: string | null;
  created_at: string;
  updated_at: string;
  level: number;
  lft: number;
  rght: number;
  has_children?: boolean;
  children?: Person[];
  wives?: Wife[];
  sources?: Source[];
}

export interface Wife {
  id: number;
  person_id: number;
  person?: Person;
  the_wife_id: number | null;
  number: number | null;
  name: string;
  birth_year: number | null;
  death_year: number | null;
  birth_place_id: number | null;
  birth_place?: City | null;
  death_place_id: number | null;
  death_place?: City | null;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: number;
  person_id: number;
  person?: Person;
  name: string;
  capt_number: string;
  shelf_number: string;
  volume_number: string;
  manuscript_number: string;
  page_number: string;
  file: string | null;
  is_primary: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

// ===== Mapping functions =====

export function mapApiPersonToPerson(api: ApiPerson, allPersons?: ApiPerson[], parentId: number | null = null): Person {
  const parentPerson = allPersons?.find(p => p.id === api.parent);
  const motherPerson = allPersons?.find(p => p.id === api.mother);
  const resolvedParentId = api.parent ?? parentId ?? null;

  return {
    id: api.id,
    name: api.name,
    kunya: api.kunya || '',
    title: api.title || '',
    gender: api.gender,
    parent_id: resolvedParentId,
    parent: parentPerson ? mapApiPersonToPerson(parentPerson, allPersons) : null,
    type_person: api.type_person,
    name_type_person: api.name_type_person,
    birth_year: api.birth_year,
    death_year: api.death_year,
    number: api.number,
    birth_place_id: api.birth_place,
    death_place_id: api.death_place,
    mother_id: api.mother,
    mother: motherPerson ? mapApiPersonToPerson(motherPerson, allPersons) : null,
    type_mother: api.type_mother,
    name_type_mother: api.name_type_mother,
    number_mother: api.number_mother,
    name_mother: api.name_mother || '',
    name_birth_place: api.name_birth_place || '',
    name_place_place: api.name_place_place || '',
    name_death_place: api.name_death_place || '',
    lineage_name: api.lineage_name || '',
    note: api.note || '',
    file: api.file,
    created_at: api.created_at,
    updated_at: api.updated_at,
    level: api.level,
    lft: api.lft,
    rght: api.rght,
    wives: api.wife?.map(w => mapApiWifeToWife(w)),
    sources: api.source?.map(s => mapApiSourceToSource(s)),
    has_children: api.children === true,
    children: allPersons
      ? allPersons.filter(p => p.parent === api.id).map(p => mapApiPersonToPerson(p, allPersons))
      : Array.isArray(api.children)
        ? api.children.map(child => mapApiPersonToPerson(child, undefined, api.id))
        : undefined,
  };
}

export function mapApiWifeToWife(api: ApiWife): Wife {
  return {
    id: api.id,
    person_id: api.person,
    the_wife_id: api.the_wife,
    number: api.number,
    name: api.name,
    birth_year: api.birth_year,
    death_year: api.death_year,
    birth_place_id: api.birth_place,
    death_place_id: api.death_place,
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

export function mapApiSourceToSource(api: ApiSource): Source {
  return {
    id: api.id,
    person_id: api.panson,
    name: api.name,
    capt_number: api.capt_number,
    shelf_number: api.shelf_number,
    volume_number: api.volume_number,
    manuscript_number: api.manuscript_number,
    page_number: api.page_number,
    file: api.file,
    is_primary: api.is_primary,
    description: api.description,
    created_at: api.created_at,
    updated_at: api.updated_at,
  };
}

// ===== Form Types =====

export interface PersonFormData {
  name: string;
  kunya: string;
  title: string;
  gender: Gender;
  parent: number | null;
  type_person: TypePerson;
  birth_year: number | null;
  death_year: number | null;
  number: number | null;
  birth_place: number | null;
  death_place: number | null;
  mother: number | null;
  type_mother: TypeMother;
  number_mother: number | null;
  name_mother: string;
  name_birth_place: string;
  name_place_place: string;
  name_death_place: string;
  note: string;
  file: File | null;
}

export interface WifeFormData {
  person: number;
  the_wife: number | null;
  number: number | null;
  name: string;
  birth_year: number | null;
  death_year: number | null;
  birth_place: number | null;
  death_place: number | null;
}

export interface SourceFormData {
  panson: number;
  name: string;
  capt_number: string;
  shelf_number: string;
  volume_number: string;
  manuscript_number: string;
  page_number: string;
  file: File | null;
  is_primary: boolean;
  description: string;
}

// ===== Utility Types =====

export interface TreeNode {
  id: string;
  data: {
    person: Person;
    isSelected?: boolean;
  };
  position: { x: number; y: number };
  type: string;
}

export interface TreeEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  animated?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | number | null;
  previous: string | number | null;
  results: T[];
}

export interface FullPersonTreeResponse {
  cached: boolean;
  count: number;
  results: ApiPerson[];
}

export interface DashboardData {
  count_person: number;
  count_person_gender_male: number;
  count_person_gender_female: number;
  max_level: number;
  count_wife: number;
  count_source: number;
}

export interface SearchResult {
  person: Person;
  lineage: string;
}
