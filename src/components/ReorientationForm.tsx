import React, { useState, useEffect, useMemo } from "react";
import { FormValues, UniversityData } from "../types";
import { WILAYAS, BAC_SERIES, SITUATIONS, REORIENTATION_REASONS } from "../data/universities";
import { Award, User, HelpCircle, CheckCircle, ChevronRight, ChevronLeft, MapPin, Search } from "lucide-react";

interface ReorientationFormProps {
  universities: UniversityData[];
  onSubmit: (values: FormValues) => Promise<void>;
  isSubmitting: boolean;
  onReset: () => void;
  successMessage: string | null;
}

const initialFormValues: FormValues = {
  matriculeBac: "",
  nom: "",
  prenom: "",
  wilayaBac: "",
  regionWilayaBac: "",
  anneeBac: "2026",
  moyenneBac: "",
  serieBac: "",
  situation: "",
  motifReorientation: "",
  choix1_university: "",
  choix1_domain: "",
  choix1_speciality: "",
  choix2_university: "",
  choix2_domain: "",
  choix2_speciality: "",
  choix3_university: "",
  choix3_domain: "",
  choix3_speciality: "",
};

export default function ReorientationForm({
  universities,
  onSubmit,
  isSubmitting,
  onReset,
  successMessage,
}: ReorientationFormProps) {
  const [step, setStep] = useState(1);
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  // Cascading selections search states
  const [searchQuery1, setSearchQuery1] = useState("");
  const [searchQuery2, setSearchQuery2] = useState("");
  const [searchQuery3, setSearchQuery3] = useState("");

  const [showSearchDropdown1, setShowSearchQueryDropdown1] = useState(false);
  const [showSearchDropdown2, setShowSearchQueryDropdown2] = useState(false);
  const [showSearchDropdown3, setShowSearchQueryDropdown3] = useState(false);

  // Auto-deduce region when wilaya changes
  useEffect(() => {
    const selectedWilayaObj = WILAYAS.find((w) => w.name === formValues.wilayaBac);
    if (selectedWilayaObj) {
      setFormValues((prev) => ({
        ...prev,
        regionWilayaBac: selectedWilayaObj.region,
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        regionWilayaBac: "",
      }));
    }
  }, [formValues.wilayaBac]);

  // Extract list of all unique combinations of universities for dropdown filter
  const allCombinations = useMemo(() => {
    return universities.map((u) => ({
      ...u,
      label: `${u.university} — ${u.domain} (${u.speciality})`,
    }));
  }, [universities]);

  // Filter combinations based on search text for choice inputs
  const filteredChoices1 = useMemo(() => {
    if (!searchQuery1.trim()) return allCombinations.slice(0, 100);
    const query = searchQuery1.toLowerCase();
    return allCombinations.filter(
      (c) =>
        c.university.toLowerCase().includes(query) ||
        c.domain.toLowerCase().includes(query) ||
        c.speciality.toLowerCase().includes(query)
    );
  }, [allCombinations, searchQuery1]);

  const filteredChoices2 = useMemo(() => {
    if (!searchQuery2.trim()) return allCombinations.slice(0, 100);
    const query = searchQuery2.toLowerCase();
    return allCombinations.filter(
      (c) =>
        c.university.toLowerCase().includes(query) ||
        c.domain.toLowerCase().includes(query) ||
        c.speciality.toLowerCase().includes(query)
    );
  }, [allCombinations, searchQuery2]);

  const filteredChoices3 = useMemo(() => {
    if (!searchQuery3.trim()) return allCombinations.slice(0, 100);
    const query = searchQuery3.toLowerCase();
    return allCombinations.filter(
      (c) =>
        c.university.toLowerCase().includes(query) ||
        c.domain.toLowerCase().includes(query) ||
        c.speciality.toLowerCase().includes(query)
    );
  }, [allCombinations, searchQuery3]);

  // Validation function for current step
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Partial<Record<keyof FormValues, string>> = {};

    if (currentStep === 1) {
      if (!formValues.matriculeBac.trim()) {
        newErrors.matriculeBac = "Le matricule BAC est obligatoire.";
      } else if (!/^\d{6,14}$/.test(formValues.matriculeBac.trim())) {
        newErrors.matriculeBac = "Le matricule doit contenir uniquement entre 6 et 14 chiffres.";
      }
      if (!formValues.nom.trim()) {
        newErrors.nom = "Le nom est obligatoire.";
      }
      if (!formValues.prenom.trim()) {
        newErrors.prenom = "Le prénom est obligatoire.";
      }
      if (!formValues.wilayaBac) {
        newErrors.wilayaBac = "Veuillez sélectionner une Wilaya.";
      }
      if (!formValues.anneeBac) {
        newErrors.anneeBac = "Veuillez choisir l'année.";
      }
      const parsedMoyenne = parseFloat(formValues.moyenneBac);
      if (!formValues.moyenneBac) {
        newErrors.moyenneBac = "La moyenne est obligatoire.";
      } else if (isNaN(parsedMoyenne) || parsedMoyenne < 10 || parsedMoyenne > 20) {
        newErrors.moyenneBac = "La moyenne doit être comprise entre 10.00 et 20.00.";
      }
      if (!formValues.serieBac) {
        newErrors.serieBac = "Veuillez sélectionner votre série du BAC.";
      }
    }

    if (currentStep === 2) {
      if (!formValues.situation) {
        newErrors.situation = "Veuillez spécifier votre situation actuelle.";
      }
      if (!formValues.motifReorientation) {
        newErrors.motifReorientation = "Le motif est requis pour analyser votre demande.";
      }
    }

    if (currentStep === 3) {
      if (!formValues.choix1_university) {
        newErrors.choix1_university = "Le choix 1 est obligatoire.";
      }
      if (!formValues.choix2_university) {
        newErrors.choix2_university = "Le choix 2 est obligatoire.";
      }
      if (!formValues.choix3_university) {
        newErrors.choix3_university = "Le choix 3 est obligatoire.";
      }
      // Check for identical choices
      if (
        formValues.choix1_university &&
        formValues.choix2_university &&
        formValues.choix1_university === formValues.choix2_university &&
        formValues.choix1_speciality === formValues.choix2_speciality
      ) {
        newErrors.choix2_university = "Le Choix 2 doit être différent du Choix 1.";
      }
      if (
        formValues.choix3_university &&
        (formValues.choix3_university === formValues.choix1_university && formValues.choix3_speciality === formValues.choix1_speciality ||
          formValues.choix3_university === formValues.choix2_university && formValues.choix3_speciality === formValues.choix2_speciality)
      ) {
        newErrors.choix3_university = "Le Choix 3 doit être unique par rapport aux autres choix.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => prev - 1);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | React.HTMLAttributes<HTMLInputElement> & any>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error
    if (errors[name as keyof FormValues]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    await onSubmit(formValues);
  };

  const selectChoice = (
    choiceNum: 1 | 2 | 3,
    c: { university: string; domain: string; speciality: string; label: string }
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [`choix${choiceNum}_university`]: c.university,
      [`choix${choiceNum}_domain`]: c.domain,
      [`choix${choiceNum}_speciality`]: c.speciality,
    }));

    if (choiceNum === 1) {
      setSearchQuery1(c.label);
      setShowSearchQueryDropdown1(false);
    } else if (choiceNum === 2) {
      setSearchQuery2(c.label);
      setShowSearchQueryDropdown2(false);
    } else {
      setSearchQuery3(c.label);
      setShowSearchQueryDropdown3(false);
    }

    // Clear error
    const key = `choix${choiceNum}_university` as keyof FormValues;
    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: undefined,
      }));
    }
  };

  const handleFormReset = () => {
    setFormValues(initialFormValues);
    setSearchQuery1("");
    setSearchQuery2("");
    setSearchQuery3("");
    setStep(1);
    onReset();
  };

  if (successMessage) {
    return (
      <div id="success-view" className="bg-white rounded-3xl border border-stone-200/80 p-8 md:p-12 text-center max-w-2xl mx-auto shadow-xl shadow-stone-100">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-serif text-stone-900 font-semibold mb-3">
          Demande Soumise avec Succès !
        </h3>
        <p className="text-stone-600 text-sm leading-relaxed mb-6 font-sans">
          Votre fiche de réorientation a bien été enregistrée dans la base de données centrale.
          Les informations ont été synchronisées directement avec le tableur Google Sheets de l'établissement.
        </p>
        <div className="bg-stone-50 rounded-2xl p-5 mb-8 border border-stone-200/50 text-left font-sans text-xs text-stone-500 space-y-2">
          <div><span className="font-semibold text-stone-700">Candidat :</span> {formValues.prenom} {formValues.nom}</div>
          <div><span className="font-semibold text-stone-700">Matricule BAC :</span> {formValues.matriculeBac}</div>
          <div><span className="font-semibold text-stone-700">Moyenne BAC :</span> {formValues.moyenneBac} / 20</div>
          <div><span className="font-semibold text-stone-700">Choix Principal :</span> {formValues.choix1_university} - {formValues.choix1_speciality}</div>
        </div>
        <button
          id="btn-new-submission"
          onClick={handleFormReset}
          className="px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-medium hover:bg-stone-800 transition duration-150 shadow-md font-sans hover:shadow-lg"
        >
          Soumettre un autre formulaire
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-2xl shadow-stone-100 overflow-hidden font-sans">
      {/* Header step progress */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-850 p-6 md:p-8 text-white relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono uppercase tracking-widest text-stone-300">
            Fiche de Réorientation Universitaire 2026
          </span>
          <span className="text-xs font-mono bg-stone-800 px-3 py-1 rounded-full text-stone-300">
            Étape {step} sur 4
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif tracking-tight text-white mb-2 font-medium">
          {step === 1 && "Informations Académiques"}
          {step === 2 && "Situation Actuelle"}
          {step === 3 && "Vœux d'Orientation"}
          {step === 4 && "Vérification finale"}
        </h2>
        <p className="text-stone-300 text-xs font-sans">
          {step === 1 && "Saisissez les détails de votre diplôme de Baccalauréat."}
          {step === 2 && "Détaillez votre parcours universitaire durant l'année écoulée."}
          {step === 3 && "Exprimez vos trois vœux d'orientation par ordre de priorité."}
          {step === 4 && "Confirmez les détails de votre demande avant soumission."}
        </p>

        {/* Step dots */}
        <div className="flex gap-2 mt-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step >= i ? "w-12 bg-amber-400" : "w-4 bg-stone-700"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6 md:p-10">
        <form onSubmit={handleFormSubmit} id="reorientation-form" className="space-y-6">
          
          {/* STEP 1: PERSONAL & BAC INFO */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-stone-100 pb-4 mb-4">
                <h3 className="text-sm font-mono text-stone-500 uppercase flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-500" /> État Civil & Candidat
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nom" className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">
                    Nom de famille *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formValues.nom}
                    onChange={handleInputChange}
                    placeholder="Saisissez votre nom"
                    className={`w-full px-4 py-3 bg-stone-50/50 border ${
                      errors.nom ? "border-red-400 focus:ring-red-200" : "border-stone-200 focus:ring-stone-200"
                    } rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-4 transition duration-150`}
                  />
                  {errors.nom && <p id="err-nom" className="text-xs text-red-500 mt-1">{errors.nom}</p>}
                </div>
                <div>
                  <label htmlFor="prenom" className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formValues.prenom}
                    onChange={handleInputChange}
                    placeholder="Saisissez votre prénom"
                    className={`w-full px-4 py-3 bg-stone-50/50 border ${
                      errors.prenom ? "border-red-400 focus:ring-red-200" : "border-stone-200 focus:ring-stone-200"
                    } rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-4 transition duration-150`}
                  />
                  {errors.prenom && <p id="err-prenom" className="text-xs text-red-500 mt-1">{errors.prenom}</p>}
                </div>
              </div>

              <div className="border-b border-stone-100 pb-4 mt-8 mb-4">
                <h3 className="text-sm font-mono text-stone-500 uppercase flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" /> Diplôme du Baccalauréat
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="matriculeBac" className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">
                    Matricule du BAC *
                  </label>
                  <input
                    type="text"
                    id="matriculeBac"
                    name="matriculeBac"
                    value={formValues.matriculeBac}
                    onChange={handleInputChange}
                    placeholder="Ex: 31054321"
                    maxLength={14}
                    className={`w-full px-4 py-3 bg-stone-50/50 border ${
                      errors.matriculeBac ? "border-red-400 focus:ring-red-200" : "border-stone-200 focus:ring-stone-200"
                    } rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-4 transition duration-150`}
                  />
                  {errors.matriculeBac && <p id="err-matricule" className="text-xs text-red-500 mt-1">{errors.matriculeBac}</p>}
                </div>

                <div>
                  <label htmlFor="anneeBac" className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">
                    Année d'Obtention *
                  </label>
                  <select
                    id="anneeBac"
                    name="anneeBac"
                    value={formValues.anneeBac}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 focus:ring-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-4 transition duration-150"
                  >
                    {["2026", "2025", "2024", "2023", "2022", "2021", "2020"].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="moyenneBac" className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">
                    Moyenne du BAC *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="10.00"
                    max="20.00"
                    id="moyenneBac"
                    name="moyenneBac"
                    value={formValues.moyenneBac}
                    onChange={handleInputChange}
                    placeholder="Ex: 14.56"
                    className={`w-full px-4 py-3 bg-stone-50/50 border ${
                      errors.moyenneBac ? "border-red-400 focus:ring-red-200" : "border-stone-200 focus:ring-stone-200"
                    } rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-4 transition duration-150`}
                  />
                  {errors.moyenneBac && <p id="err-moyenne" className="text-xs text-red-500 mt-1">{errors.moyenneBac}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="wilayaBac" className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">
                    Wilaya d'obtention *
                  </label>
                  <select
                    id="wilayaBac"
                    name="wilayaBac"
                    value={formValues.wilayaBac}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-stone-50/50 border ${
                      errors.wilayaBac ? "border-red-400 focus:ring-red-200" : "border-stone-200 focus:ring-stone-200"
                    } rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-4 transition duration-150`}
                  >
                    <option value="">Sélectionnez votre Wilaya</option>
                    {WILAYAS.map((w) => (
                      <option key={w.code} value={w.name}>
                        {w.code} - {w.name}
                      </option>
                    ))}
                  </select>
                  {errors.wilayaBac && <p id="err-wilaya" className="text-xs text-red-500 mt-1">{errors.wilayaBac}</p>}
                </div>

                <div>
                  <label htmlFor="regionWilayaBac" className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">
                    Région Géographique (Déduite)
                  </label>
                  <input
                    type="text"
                    id="regionWilayaBac"
                    name="regionWilayaBac"
                    value={formValues.regionWilayaBac}
                    disabled
                    placeholder="Sélectionnez une wilaya pour déduire la région"
                    className="w-full px-4 py-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 text-sm focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="serieBac" className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">
                  Série du Baccalauréat *
                </label>
                <select
                  id="serieBac"
                  name="serieBac"
                  value={formValues.serieBac}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-stone-50/50 border ${
                    errors.serieBac ? "border-red-400 focus:ring-red-200" : "border-stone-200 focus:ring-stone-200"
                  } rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-4 transition duration-150`}
                >
                  <option value="">Choisissez votre série</option>
                  {BAC_SERIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.serieBac && <p id="err-serie" className="text-xs text-red-500 mt-1">{errors.serieBac}</p>}
              </div>
            </div>
          )}

          {/* STEP 2: CURRENT SITUATION */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <label htmlFor="situation" className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">
                  Situation actuelle (année académique en cours) *
                </label>
                <select
                  id="situation"
                  name="situation"
                  value={formValues.situation}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-stone-50/50 border ${
                    errors.situation ? "border-red-400 focus:ring-red-200" : "border-stone-200 focus:ring-stone-200"
                  } rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-4 transition duration-150`}
                >
                  <option value="">Sélectionnez votre situation</option>
                  {SITUATIONS.map((sit) => (
                    <option key={sit} value={sit}>{sit}</option>
                  ))}
                </select>
                {errors.situation && <p id="err-situation" className="text-xs text-red-500 mt-1">{errors.situation}</p>}
              </div>

              <div>
                <label htmlFor="motifReorientation" className="block text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">
                  Motif principal de la réorientation *
                </label>
                <div className="space-y-2 mb-3">
                  {REORIENTATION_REASONS.map((reason) => (
                    <label key={reason} className="flex items-start gap-3 p-3 rounded-xl border border-stone-150 hover:bg-stone-50/50 cursor-pointer text-xs text-stone-700 transition">
                      <input
                        type="radio"
                        name="motifReorientation"
                        value={reason}
                        checked={formValues.motifReorientation === reason}
                        onChange={handleInputChange}
                        className="mt-0.5 text-stone-900 focus:ring-stone-900 border-stone-300"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>
                <textarea
                  id="customMotif"
                  name="motifReorientation"
                  value={
                    REORIENTATION_REASONS.includes(formValues.motifReorientation)
                      ? ""
                      : formValues.motifReorientation
                  }
                  onChange={(e) => {
                    setFormValues((prev) => ({
                      ...prev,
                      motifReorientation: e.target.value,
                    }));
                  }}
                  placeholder="Si autre, ou pour apporter des précisions, rédigez ici..."
                  className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 focus:ring-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-4 transition duration-150 h-24"
                />
                {errors.motifReorientation && (
                  <p id="err-motif" className="text-xs text-red-500 mt-1">{errors.motifReorientation}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: VOEUX / CHOICES */}
          {step === 3 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl flex gap-3 text-amber-800 text-xs font-sans leading-relaxed">
                <HelpCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
                <div>
                  <span className="font-semibold">Aide d'Orientation :</span> Tapez le nom d'une université (ex: USTHB, Alger), d'un domaine (ex: ST, MI, SNV) ou d'une spécialité (ex: Informatique, Médecine) dans les barres de recherche pour trouver et sélectionner instantanément les filières habilitées.
                </div>
              </div>

              {/* CHOICE 1 */}
              <div className="space-y-2 border-l-4 border-stone-900 pl-4 relative">
                <span className="absolute -left-3 top-0 bg-stone-900 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono">1</span>
                <label className="block text-xs font-semibold text-stone-950 uppercase tracking-wider">
                  Vœu N° 1 — Choix Principal *
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Saisissez pour filtrer..."
                      value={searchQuery1}
                      onFocus={() => setShowSearchQueryDropdown1(true)}
                      onChange={(e) => {
                        setSearchQuery1(e.target.value);
                        setShowSearchQueryDropdown1(true);
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-stone-50/50 border ${
                        errors.choix1_university ? "border-red-400 focus:ring-red-200" : "border-stone-200 focus:ring-stone-200"
                      } rounded-xl text-stone-800 text-xs focus:outline-none focus:ring-4 transition duration-150`}
                    />
                  </div>
                  {showSearchDropdown1 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl max-h-56 overflow-y-auto scrollbar-thin">
                      {filteredChoices1.length === 0 ? (
                        <div className="p-3 text-xs text-stone-500">Aucun résultat trouvé</div>
                      ) : (
                        filteredChoices1.map((c, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectChoice(1, c)}
                            className="w-full text-left p-3 text-xs border-b border-stone-50 hover:bg-stone-50 transition font-sans text-stone-700"
                          >
                            <span className="font-semibold text-stone-900">{c.university}</span> — {c.domain} : {c.speciality}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {errors.choix1_university && (
                  <p id="err-choix1" className="text-xs text-red-500 mt-1">{errors.choix1_university}</p>
                )}
              </div>

              {/* CHOICE 2 */}
              <div className="space-y-2 border-l-4 border-stone-400 pl-4 relative">
                <span className="absolute -left-3 top-0 bg-stone-400 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono">2</span>
                <label className="block text-xs font-semibold text-stone-950 uppercase tracking-wider">
                  Vœu N° 2 — Choix Secondaire *
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Saisissez pour filtrer..."
                      value={searchQuery2}
                      onFocus={() => setShowSearchQueryDropdown2(true)}
                      onChange={(e) => {
                        setSearchQuery2(e.target.value);
                        setShowSearchQueryDropdown2(true);
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-stone-50/50 border ${
                        errors.choix2_university ? "border-red-400 focus:ring-red-200" : "border-stone-200 focus:ring-stone-200"
                      } rounded-xl text-stone-800 text-xs focus:outline-none focus:ring-4 transition duration-150`}
                    />
                  </div>
                  {showSearchDropdown2 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl max-h-56 overflow-y-auto scrollbar-thin">
                      {filteredChoices2.length === 0 ? (
                        <div className="p-3 text-xs text-stone-500">Aucun résultat trouvé</div>
                      ) : (
                        filteredChoices2.map((c, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectChoice(2, c)}
                            className="w-full text-left p-3 text-xs border-b border-stone-50 hover:bg-stone-50 transition font-sans text-stone-700"
                          >
                            <span className="font-semibold text-stone-900">{c.university}</span> — {c.domain} : {c.speciality}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {errors.choix2_university && (
                  <p id="err-choix2" className="text-xs text-red-500 mt-1">{errors.choix2_university}</p>
                )}
              </div>

              {/* CHOICE 3 */}
              <div className="space-y-2 border-l-4 border-stone-300 pl-4 relative">
                <span className="absolute -left-3 top-0 bg-stone-300 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono">3</span>
                <label className="block text-xs font-semibold text-stone-950 uppercase tracking-wider">
                  Vœu N° 3 — Choix de Secours *
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Saisissez pour filtrer..."
                      value={searchQuery3}
                      onFocus={() => setShowSearchQueryDropdown3(true)}
                      onChange={(e) => {
                        setSearchQuery3(e.target.value);
                        setShowSearchQueryDropdown3(true);
                      }}
                      className={`w-full pl-10 pr-4 py-3 bg-stone-50/50 border ${
                        errors.choix3_university ? "border-red-400 focus:ring-red-200" : "border-stone-200 focus:ring-stone-200"
                      } rounded-xl text-stone-800 text-xs focus:outline-none focus:ring-4 transition duration-150`}
                    />
                  </div>
                  {showSearchDropdown3 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-xl max-h-56 overflow-y-auto scrollbar-thin">
                      {filteredChoices3.length === 0 ? (
                        <div className="p-3 text-xs text-stone-500">Aucun résultat trouvé</div>
                      ) : (
                        filteredChoices3.map((c, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectChoice(3, c)}
                            className="w-full text-left p-3 text-xs border-b border-stone-50 hover:bg-stone-50 transition font-sans text-stone-700"
                          >
                            <span className="font-semibold text-stone-900">{c.university}</span> — {c.domain} : {c.speciality}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {errors.choix3_university && (
                  <p id="err-choix3" className="text-xs text-red-500 mt-1">{errors.choix3_university}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: RECAP & CONFIRM */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200/60 font-sans space-y-4">
                <h3 className="text-lg font-serif font-semibold text-stone-900 border-b border-stone-200 pb-2">
                  Résumé des Informations
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-stone-500 block mb-0.5">Identité du Candidat :</span>
                    <span className="text-stone-850 font-medium text-sm">{formValues.nom} {formValues.prenom}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-500 block mb-0.5">Matricule BAC :</span>
                    <span className="text-stone-850 font-mono text-sm">{formValues.matriculeBac}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-500 block mb-0.5">Moyenne & Série :</span>
                    <span className="text-stone-850 font-medium text-sm">{formValues.moyenneBac} / 20 ({formValues.serieBac})</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-500 block mb-0.5">Wilaya & Région :</span>
                    <span className="text-stone-850 font-medium text-sm">{formValues.wilayaBac} ({formValues.regionWilayaBac})</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-semibold text-stone-500 block mb-0.5">Situation Actuelle :</span>
                    <span className="text-stone-850 font-medium text-sm">{formValues.situation}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-semibold text-stone-500 block mb-0.5">Motif de Réorientation :</span>
                    <span className="text-stone-850 font-medium text-sm block bg-white p-2.5 rounded-lg border border-stone-200/50">{formValues.motifReorientation}</span>
                  </div>
                </div>

                <h4 className="text-sm font-semibold text-stone-900 border-t border-stone-150 pt-4 mt-4">
                  Vœux Formulés
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-white border border-stone-200/60 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="bg-stone-900 text-white font-mono px-1.5 py-0.5 rounded text-[10px] mr-2">Vœu 1</span>
                      <span className="font-semibold text-stone-900">{formValues.choix1_university}</span> — {formValues.choix1_speciality}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono uppercase">{formValues.choix1_domain}</span>
                  </div>
                  <div className="p-3 bg-white border border-stone-200/60 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="bg-stone-400 text-white font-mono px-1.5 py-0.5 rounded text-[10px] mr-2">Vœu 2</span>
                      <span className="font-semibold text-stone-900">{formValues.choix2_university}</span> — {formValues.choix2_speciality}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono uppercase">{formValues.choix2_domain}</span>
                  </div>
                  <div className="p-3 bg-white border border-stone-200/60 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="bg-stone-300 text-white font-mono px-1.5 py-0.5 rounded text-[10px] mr-2">Vœu 3</span>
                      <span className="font-semibold text-stone-900">{formValues.choix3_university}</span> — {formValues.choix3_speciality}
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono uppercase">{formValues.choix3_domain}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50/50 border border-amber-200/30 rounded-2xl flex gap-3 text-amber-900 text-xs font-sans">
                <input
                  type="checkbox"
                  required
                  id="declaration-certify"
                  className="mt-1 focus:ring-amber-500 h-4 w-4 text-amber-600 border-amber-300 rounded"
                />
                <label htmlFor="declaration-certify" className="cursor-pointer">
                  Je certifie sur l'honneur l'exactitude des informations académiques et administratives saisies ci-dessus. Je comprends que toute fausse déclaration peut entraîner l'annulation immédiate de ma demande de réorientation universitaire.
                </label>
              </div>
            </div>
          )}

          {/* Step buttons */}
          <div className="flex justify-between items-center border-t border-stone-100 pt-6 mt-8">
            {step > 1 ? (
              <button
                type="button"
                id="btn-prev-step"
                onClick={handlePrev}
                className="px-5 py-2.5 border border-stone-200 text-stone-600 rounded-xl text-xs font-semibold hover:bg-stone-50 transition duration-150 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" /> Précédent
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                id="btn-next-step"
                onClick={handleNext}
                className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-semibold hover:bg-stone-850 transition duration-150 flex items-center gap-1.5 shadow-md hover:shadow-lg"
              >
                Suivant <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                id="btn-submit-form"
                disabled={isSubmitting}
                className="px-6 py-3 bg-stone-950 text-white rounded-xl text-xs font-semibold hover:bg-stone-900 disabled:opacity-50 transition duration-150 flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enregistrement en cours...
                  </>
                ) : (
                  <>
                    Soumettre la Demande
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
