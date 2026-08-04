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
  [TypePerson.unknown]: 'مجهول',
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
  [TypePerson.unknown]: 'مجهول',
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

export interface Person {
  id: number;
  name: string;
  kunya: string;
  title: string;
  gender: Gender;
  parent_id: number | null;
  parent?: Person | null;
  type_person: TypePerson;
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
  number_mother: number | null;
  name_mother: string;
  note: string;
  file: string | null;
  created_at: string;
  updated_at: string;
  children?: Person[];
  wives?: Wife[];
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

// ===== Form Types =====

export interface PersonFormData {
  name: string;
  kunya: string;
  title: string;
  gender: Gender;
  parent_id: number | null;
  type_person: TypePerson;
  birth_year: number | null;
  death_year: number | null;
  number: number | null;
  birth_place_id: number | null;
  death_place_id: number | null;
  mother_id: number | null;
  type_mother: TypeMother;
  number_mother: number | null;
  name_mother: string;
  note: string;
  file: File | null;
}

export interface WifeFormData {
  person_id: number;
  the_wife_id: number | null;
  number: number | null;
  name: string;
  birth_year: number | null;
  death_year: number | null;
  birth_place_id: number | null;
  death_place_id: number | null;
}

export interface SourceFormData {
  person_id: number;
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

export interface SearchResult {
  person: Person;
  lineage: string;
}
