export interface FormValues {
  matriculeBac: string;
  nom: string;
  prenom: string;
  wilayaBac: string;
  regionWilayaBac: string;
  anneeBac: string;
  moyenneBac: string;
  serieBac: string;
  situation: string;
  motifReorientation: string;
  choix1_university: string;
  choix1_domain: string;
  choix1_speciality: string;
  choix2_university: string;
  choix2_domain: string;
  choix2_speciality: string;
  choix3_university: string;
  choix3_domain: string;
  choix3_speciality: string;
}

export interface UniversityData {
  university: string;
  domain: string;
  speciality: string;
}

export interface Submission {
  id: string;
  timestamp: string;
  matriculeBac: string;
  nom: string;
  prenom: string;
  wilayaBac: string;
  regionWilayaBac: string;
  anneeBac: string;
  moyenneBac: number;
  serieBac: string;
  situation: string;
  motifReorientation: string;
  choix1: string;
  choix2: string;
  choix3: string;
}

export interface SheetConfig {
  responsesId: string | null;
  responsesLink: string | null;
  universitiesId: string | null;
  universitiesLink: string | null;
  loading: boolean;
  error: string | null;
}
