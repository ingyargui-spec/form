export interface UniversityRow {
  university: string;
  domain: string;
  speciality: string;
}

export const UNIVERSITIES = [
  "CU-Aflou",
  "CU-Barika",
  "CU-El Bayadh",
  "CU-Illizi",
  "CU-Maghnia",
  "CU-Mila",
  "CU-Naama",
  "CU-Tindouf",
  "CU-Tipaza",
  "U-Adrar",
  "U-Ain Témouchent",
  "U-Alger 1",
  "U-Alger 2",
  "U-Alger 3",
  "U-Annaba",
  "U-Batna 1",
  "U-Batna 2",
  "U-Bejaia",
  "U-Biskra",
  "U-Blida 1",
  "U-Blida 2",
  "U-Bordj Bou Arreridj",
  "U-Bouira",
  "U-Boumerdès",
  "U-Béchar",
  "U-Chlef",
  "U-Constantine 1",
  "U-Constantine 2",
  "U-Constantine 3",
  "U-Djelfa",
  "U-El Oued",
  "U-El Tarf",
  "U-Ghardaia",
  "U-Guelma",
  "U-Jijel",
  "U-Khemis Miliana",
  "U-Khenchela",
  "U-Laghouat",
  "U-M'Sila",
  "U-Mascara",
  "U-Mostaganem",
  "U-Médéa",
  "U-Oran 1",
  "U-Oran 2",
  "U-Ouargla",
  "U-Oum El Bouaghi",
  "U-Relizane",
  "U-Saida",
  "U-Sc. Islamiques EAK",
  "U-Sidi Bel Abbes",
  "U-Skikda",
  "U-Souk Ahras",
  "U-Sétif 1",
  "U-Sétif 2",
  "U-Tamanghasset",
  "U-Tebessa",
  "U-Tiaret",
  "U-Tissemsilt",
  "U-Tizi Ouzou",
  "U-Tlemcen",
  "USTHB",
  "USTO"
];

export const DOMAINS_SPECIALITIES: Record<string, string[]> = {
  "ARTS": [
    "Arts Visuels",
    "Arts du Spectacle"
  ],
  "AUMV": [
    "Architecture",
    "Gestion des techniques urbaines",
    "Management des projets",
    "Métiers de la ville",
    "Urbanisme"
  ],
  "DSP": [
    "Droit",
    "Sciences Politiques"
  ],
  "ENS": [
    "PEM-Amazighe",
    "PEM-Anglais",
    "PEM-EPS",
    "PEM-Français",
    "PEM-Histoire-Géo.",
    "PEM-Informatique",
    "PEM-LLA",
    "PEM-Maths",
    "PEM-Musique",
    "PEM-Sc. Naturelles",
    "PEM-Sc. Physiques et Techno",
    "PEP-Amazighe",
    "PEP-Anglais",
    "PEP-Arabe",
    "PEP-EPS",
    "PEP-Français",
    "PES-Allemand",
    "PES-Amazighe",
    "PES-Anglais",
    "PES-EPS",
    "PES-Espagnol",
    "PES-Français",
    "PES-G. Civil",
    "PES-G. Electrique",
    "PES-G. Mécanique",
    "PES-G. des Procédés",
    "PES-Histoire Géo",
    "PES-Informatique",
    "PES-Italien",
    "PES-LLA",
    "PES-Maths",
    "PES-Musique",
    "PES-Philosophie",
    "PES-Physique",
    "PES-Sc. Eco.",
    "PES-Sc. Islamiques",
    "PES-Sc. Naturelles"
  ],
  "LCA": [
    "Langue et Civilisation",
    "Langue et Littérature",
    "Linguistique et Didactique"
  ],
  "LLA": [
    "Etudes Critiques",
    "Etudes Linguistiques",
    "Etudes Littéraires"
  ],
  "LLE": [
    "Langue Allemande",
    "Langue Anglaise",
    "Langue Espagnole",
    "Langue Française",
    "Langue Italienne",
    "Langue Russe",
    "Langue Turque",
    "Traduction"
  ],
  "MI": [
    "Informatique",
    "Informatique (ingénieur)",
    "Mathématiques",
    "Mathématiques Appliquées"
  ],
  "SEGC": [
    "Sciences Commerciales",
    "Sciences Economiques",
    "Sciences Financières et Comptabilité",
    "Sciences de Gestion"
  ],
  "SHS": [
    "SH-Archéologie",
    "SH-Bibliothéconomie",
    "SH-Histoire",
    "SH-Sciences de l'Information de la Communication",
    "SI-Charia",
    "SI-Langue Arabe et Civilisation Islamique",
    "SI-Oussoul Eddine",
    "SS-Anthropologie",
    "SS-Orthophonie",
    "SS-Philosophie",
    "SS-Psychologie",
    "SS-Sciences de l'Education",
    "SS-Sciences des Populations",
    "SS-Sociologie"
  ],
  "SM": [
    "Chimie",
    "Physique"
  ],
  "SMV": [
    "Médecine",
    "Médecine Dentaire",
    "Pharmacie",
    "Sc. Vétérinaires"
  ],
  "SNV": [
    "Biotechnologies",
    "Ecologie et Environnement",
    "Hydrobiologie Marine et Continentale",
    "Sciences Agronomiques",
    "Sciences Alimentaires",
    "Sciences Biologiques",
    "Sciences Infirmières",
    "Sciences Vétérinaires"
  ],
  "SS": [
    "Auxiliaires en pharmacie",
    "Industrie des produits pharmaceutiques et de santé"
  ],
  "ST": [
    "Automatique",
    "Aéronautique",
    "Electromécanique",
    "Electronique",
    "Electrotechnique",
    "Energies Renouvelables (*)",
    "Génie biomédical",
    "Génie civil",
    "Génie climatique",
    "Génie des procédés",
    "Génie industriel",
    "Génie maritime",
    "Génie minier",
    "Génie mécanique",
    "Hydraulique",
    "Hydrocarbures",
    "Hygiène et Sécurité Industrielle",
    "Industries Pétrochimiques",
    "Ingénierie des transports",
    "Métallurgie",
    "Optique et mécanique de précision",
    "Sciences et Génie de l'Environnement",
    "Télécommunication"
  ],
  "STAPS": [
    "Activité Physique et Sportive Adaptée",
    "Activité Physique et Sportive Educative",
    "Administration et Gestion du Sport",
    "Entrainement Sportif",
    "Information et Communication Sportive"
  ],
  "STU": [
    "Géographie et Aménagement du territoire",
    "Géologie",
    "Géophysique"
  ]
};

export const WILAYAS = [
  { code: "01", name: "Adrar", region: "Sud" },
  { code: "02", name: "Chlef", region: "Ouest" },
  { code: "03", name: "Laghouat", region: "Sud" },
  { code: "04", name: "Oum El Bouaghi", region: "Est" },
  { code: "05", name: "Batna", region: "Est" },
  { code: "06", name: "Béjaïa", region: "Est" },
  { code: "07", name: "Biskra", region: "Sud" },
  { code: "08", name: "Béchar", region: "Sud" },
  { code: "09", name: "Blida", region: "Centre" },
  { code: "10", name: "Bouira", region: "Centre" },
  { code: "11", name: "Tamanrasset", region: "Sud" },
  { code: "12", name: "Tébessa", region: "Est" },
  { code: "13", name: "Tlemcen", region: "Ouest" },
  { code: "14", name: "Tiaret", region: "Ouest" },
  { code: "15", name: "Tizi Ouzou", region: "Centre" },
  { code: "16", name: "Alger", region: "Centre" },
  { code: "17", name: "Djelfa", region: "Centre" },
  { code: "18", name: "Jijel", region: "Est" },
  { code: "19", name: "Sétif", region: "Est" },
  { code: "20", name: "Saïda", region: "Ouest" },
  { code: "21", name: "Skikda", region: "Est" },
  { code: "22", name: "Sidi Bel Abbès", region: "Ouest" },
  { code: "23", name: "Annaba", region: "Est" },
  { code: "24", name: "Guelma", region: "Est" },
  { code: "25", name: "Constantine", region: "Est" },
  { code: "26", name: "Médéa", region: "Centre" },
  { code: "27", name: "Mostaganem", region: "Ouest" },
  { code: "28", name: "M'Sila", region: "Est" },
  { code: "29", name: "Mascara", region: "Ouest" },
  { code: "30", name: "Ouargla", region: "Sud" },
  { code: "31", name: "Oran", region: "Ouest" },
  { code: "32", name: "El Bayadh", region: "Sud" },
  { code: "33", name: "Illizi", region: "Sud" },
  { code: "34", name: "Bordj Bou Arréridj", region: "Est" },
  { code: "35", name: "Boumerdès", region: "Centre" },
  { code: "36", name: "El Tarf", region: "Est" },
  { code: "37", name: "Tindouf", region: "Sud" },
  { code: "38", name: "Tissemsilt", region: "Ouest" },
  { code: "39", name: "El Oued", region: "Sud" },
  { code: "40", name: "Khenchela", region: "Est" },
  { code: "41", name: "Souk Ahras", region: "Est" },
  { code: "42", name: "Tipaza", region: "Centre" },
  { code: "43", name: "Mila", region: "Est" },
  { code: "44", name: "Aïn Defla", region: "Centre" },
  { code: "45", name: "Naâma", region: "Sud" },
  { code: "46", name: "Aïn Témouchent", region: "Ouest" },
  { code: "47", name: "Ghardaïa", region: "Sud" },
  { code: "48", name: "Relizane", region: "Ouest" },
  { code: "49", name: "El M'Ghair", region: "Sud" },
  { code: "50", name: "El Meniaa", region: "Sud" },
  { code: "51", name: "Ouled Djellal", region: "Sud" },
  { code: "52", name: "Bordj Baji Mokhtar", region: "Sud" },
  { code: "53", name: "Béni Abbès", region: "Sud" },
  { code: "54", name: "Timimoun", region: "Sud" },
  { code: "55", name: "Touggourt", region: "Sud" },
  { code: "56", name: "Djanet", region: "Sud" },
  { code: "57", name: "In Salah", region: "Sud" },
  { code: "58", name: "In Guezzam", region: "Sud" }
];

export const BAC_SERIES = [
  "Sciences Expérimentales",
  "Mathématiques",
  "Technique Mathématique",
  "Gestion et Economie",
  "Lettres et Philosophie",
  "Langues Etrangères"
];

export const SITUATIONS = [
  "Nouveau bachelier (2026)",
  "Inscrit en première année (2025-2026)",
  "En abandon d'études",
  "Exclu",
  "Réorienté en cours d'année",
  "Autre"
];

export const REORIENTATION_REASONS = [
  "Changement d'intérêt académique / professionnel",
  "Rapprochement familial / Proximité géographique",
  "Difficultés d'adaptation ou d'apprentissage",
  "Orientation initiale non voulue (choix imposé)",
  "Opportunités professionnelles futures",
  "Problèmes de santé",
  "Autre"
];

// Generates flat list of thousands of combinations
export function getUniversityCombinations(): UniversityRow[] {
  const result: UniversityRow[] = [];
  for (const domain of Object.keys(DOMAINS_SPECIALITIES)) {
    const specialities = DOMAINS_SPECIALITIES[domain];
    for (const speciality of specialities) {
      for (const university of UNIVERSITIES) {
        result.push({ university, domain, speciality });
      }
    }
  }
  return result;
}
