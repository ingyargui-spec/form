import React, { useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import { 
  FileSpreadsheet, 
  LayoutDashboard, 
  Settings, 
  Compass, 
  Lock, 
  AlertCircle, 
  Check, 
  CheckCircle,
  HelpCircle,
  Sparkles,
  Info
} from "lucide-react";

import { 
  initAuth, 
  signInWithGoogle, 
  logoutUser, 
  getCachedAccessToken, 
  setCachedAccessToken 
} from "./lib/firebaseAuth";

import {
  searchGoogleDriveFile,
  getSpreadsheetLink,
  createResponsesSpreadsheet,
  appendSubmissionToSpreadsheet,
  fetchAllSubmissions,
  createAndPopulateUniversitySpreadsheet,
  fetchUniversityDataFromSpreadsheet,
  SubmissionData
} from "./lib/googleServices";

import { getUniversityCombinations } from "./data/universities";
import { FormValues, UniversityData, Submission, SheetConfig } from "./types";

import ReorientationForm from "./components/ReorientationForm";
import AdminDashboard from "./components/AdminDashboard";
import ConfigPanel from "./components/ConfigPanel";

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // Tab views: "form" | "dashboard" | "config"
  const [activeTab, setActiveTab] = useState<"form" | "dashboard" | "config">("form");

  // Spreadsheet Configuration & Status
  const [sheetConfig, setSheetConfig] = useState<SheetConfig>({
    responsesId: null,
    responsesLink: null,
    universitiesId: null,
    universitiesLink: null,
    loading: false,
    error: null,
  });

  // Dynamic Universities database
  const [universities, setUniversities] = useState<UniversityData[]>([]);
  const [isCustomUniversitiesActive, setIsCustomUniversitiesActive] = useState(false);

  // Form Submission tracking
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);

  // Load static university database fallback
  useEffect(() => {
    const staticRows = getUniversityCombinations();
    setUniversities(staticRows);
  }, []);

  // Search existing spreadsheets on Google Drive
  const discoverUserSpreadsheets = useCallback(async (token: string) => {
    setSheetConfig((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const respId = await searchGoogleDriveFile(token, "Réorientation 2026 - Réponses");
      const univId = await searchGoogleDriveFile(token, "Réorientation 2026 - Universités Data");

      let respLink: string | null = null;
      let univLink: string | null = null;

      if (respId) {
        respLink = await getSpreadsheetLink(token, respId);
      }
      if (univId) {
        univLink = await getSpreadsheetLink(token, univId);
      }

      setSheetConfig((prev) => ({
        ...prev,
        responsesId: respId,
        responsesLink: respLink,
        universitiesId: univId,
        universitiesLink: univLink,
        loading: false,
      }));

      // If we have responses ID, fetch submissions list
      if (respId || respId === null) {
        if (respId) {
          loadSubmissions(token, respId);
        }
      }

      // If we have custom university ID, load universities list
      if (univId) {
        try {
          const customUnivs = await fetchUniversityDataFromSpreadsheet(token, univId);
          if (customUnivs && customUnivs.length > 0) {
            setUniversities(customUnivs);
            setIsCustomUniversitiesActive(true);
          }
        } catch (e) {
          console.error("Failed to load custom universities, using fallback:", e);
        }
      }

      const respId_val = respId;
      const univId_val = univId;
    } catch (err: any) {
      setSheetConfig((prev) => ({
        ...prev,
        loading: false,
        error: "Erreur lors de l'exploration de Google Drive.",
      }));
    }
  }, []);

  // Helper to load submissions
  const loadSubmissions = async (token: string, spreadsheetId: string) => {
    setSubmissionsLoading(true);
    try {
      const list = await fetchAllSubmissions(token, spreadsheetId);
      setSubmissions(list);
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Re-fetch submissions
  const handleRefreshSubmissions = async () => {
    if (accessToken && sheetConfig.responsesId) {
      await loadSubmissions(accessToken, sheetConfig.responsesId);
    }
  };

  // Firebase auth listener
  useEffect(() => {
    setAuthLoading(true);
    const unsubscribe = initAuth(
      async (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setNeedsAuth(false);
        setAuthLoading(false);
        await discoverUserSpreadsheets(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
        setAuthLoadingFalse();
      }
    );
    return () => unsubscribe();
  }, [discoverUserSpreadsheets]);

  const setAccessToken = (token: string | null) => {
    setCachedAccessToken(token);
    setAccessTokenState(token);
  };

  const setAuthLoadingFalse = () => {
    setAuthLoading(false);
  };

  // Google Login click handler
  const handleLogin = async () => {
    setAuthLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res) {
        setCurrentUser(res.user);
        setAccessToken(res.accessToken);
        setNeedsAuth(false);
        await discoverUserSpreadsheets(res.accessToken);
      }
    } catch (err) {
      console.error("Login component error:", err);
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    setAuthLoading(true);
    try {
      await logoutUser();
      setCurrentUser(null);
      setAccessToken(null);
      setNeedsAuth(true);
      setSheetConfig({
        responsesId: null,
        responsesLink: null,
        universitiesId: null,
        universitiesLink: null,
        loading: false,
        error: null,
      });
      // Restore default fallback universities
      setUniversities(getUniversityCombinations());
      setIsCustomUniversitiesActive(false);
      setSubmissions([]);
    } finally {
      setAuthLoading(false);
    }
  };

  // Force initialize responses sheet on Drive
  const handleInitializeResponsesSheet = async () => {
    if (!accessToken) return;
    try {
      const newId = await createResponsesSpreadsheet(accessToken);
      const link = await getSpreadsheetLink(accessToken, newId);
      setSheetConfig((prev) => ({
        ...prev,
        responsesId: newId,
        responsesLink: link,
      }));
      // Initialize submission load (should be empty except headers)
      await loadSubmissions(accessToken, newId);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  // Force initialize universities sheet on Drive
  const handleInitializeUniversitiesSheet = async () => {
    if (!accessToken) return;
    try {
      const combinations = getUniversityCombinations();
      const newId = await createAndPopulateUniversitySpreadsheet(accessToken, combinations);
      const link = await getSpreadsheetLink(accessToken, newId);
      setSheetConfig((prev) => ({
        ...prev,
        universitiesId: newId,
        universitiesLink: link,
      }));
      setIsCustomUniversitiesActive(true);
    } catch (err: any) {
      alert(`Erreur: ${err.message}`);
    }
  };

  // Force sync / reload universities sheet
  const handleSyncUniversitiesSheet = async () => {
    if (!accessToken || !sheetConfig.universitiesId) return;
    try {
      const list = await fetchUniversityDataFromSpreadsheet(accessToken, sheetConfig.universitiesId);
      if (list && list.length > 0) {
        setUniversities(list);
        setIsCustomUniversitiesActive(true);
      }
    } catch (err: any) {
      alert(`Erreur de synchronisation: ${err.message}`);
    }
  };

  // Form submission handler
  const handleFormSubmit = async (values: FormValues) => {
    if (!accessToken) {
      alert("Une session Google authentifiée est requise pour soumettre le formulaire.");
      return;
    }

    setIsFormSubmitting(true);
    try {
      let activeSpreadsheetId = sheetConfig.responsesId;

      // Rule: "On the first form submission, programmatically create a new Google Sheets file to store responses; for subsequent submissions, append new rows to this existing sheet."
      if (!activeSpreadsheetId) {
        activeSpreadsheetId = await createResponsesSpreadsheet(accessToken);
        const link = await getSpreadsheetLink(accessToken, activeSpreadsheetId);
        setSheetConfig((prev) => ({
          ...prev,
          responsesId: activeSpreadsheetId,
          responsesLink: link,
        }));
      }

      const submissionId = `R-${Date.now()}`;
      const payload: SubmissionData = {
        id: submissionId,
        timestamp: new Date().toISOString(),
        matriculeBac: values.matriculeBac,
        nom: values.nom,
        prenom: values.prenom,
        wilayaBac: values.wilayaBac,
        regionWilayaBac: values.regionWilayaBac,
        anneeBac: values.anneeBac,
        moyenneBac: parseFloat(values.moyenneBac) || 10.0,
        serieBac: values.serieBac,
        situation: values.situation,
        motifReorientation: values.motifReorientation,
        choix1: `${values.choix1_university} — ${values.choix1_domain} (${values.choix1_speciality})`,
        choix2: `${values.choix2_university} — ${values.choix2_domain} (${values.choix2_speciality})`,
        choix3: `${values.choix3_university} — ${values.choix3_domain} (${values.choix3_speciality})`,
      };

      // Append row to Sheets
      await appendSubmissionToSpreadsheet(accessToken, activeSpreadsheetId, payload);
      
      // Update local submissions list
      const newSubmission: Submission = {
        id: payload.id,
        timestamp: payload.timestamp,
        matriculeBac: payload.matriculeBac,
        nom: payload.nom,
        prenom: payload.prenom,
        wilayaBac: payload.wilayaBac,
        regionWilayaBac: payload.regionWilayaBac,
        anneeBac: payload.anneeBac,
        moyenneBac: payload.moyenneBac,
        serieBac: payload.serieBac,
        situation: payload.situation,
        motifReorientation: payload.motifReorientation,
        choix1: payload.choix1,
        choix2: payload.choix2,
        choix3: payload.choix3,
      };

      setSubmissions((prev) => [newSubmission, ...prev]);
      setFormSuccessMessage("Votre fiche a été transmise.");
    } catch (err: any) {
      console.error(err);
      alert(`Erreur d'enregistrement : ${err.message}`);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleResetFormState = () => {
    setFormSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 selection:bg-amber-100 font-sans flex flex-col justify-between">
      
      {/* NAV BAR */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center text-white shadow-md">
                <Compass className="w-5 h-5 text-amber-400 animate-spin-slow" />
              </div>
              <div>
                <span className="font-sans font-bold tracking-tight text-stone-900 block text-sm sm:text-base">
                  Réorientation Académique 2026
                </span>
                <span className="text-[10px] text-stone-400 font-mono block">
                  Algerian Ministry of Higher Education
                </span>
              </div>
            </div>

            {/* TAB CONTROLS */}
            <div className="hidden sm:flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl">
              <button
                id="tab-form"
                onClick={() => setActiveTab("form")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
                  activeTab === "form" 
                    ? "bg-white text-stone-900 shadow-sm" 
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                Formulaire
              </button>
              
              <button
                id="tab-dashboard"
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === "dashboard" 
                    ? "bg-white text-stone-900 shadow-sm" 
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Tableau de Bord
                {needsAuth && <Lock className="w-3 h-3 text-stone-400" />}
              </button>

              <button
                id="tab-config"
                onClick={() => setActiveTab("config")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  activeTab === "config" 
                    ? "bg-white text-stone-900 shadow-sm" 
                    : "text-stone-500 hover:text-stone-900"
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                Configuration
                {needsAuth && <Lock className="w-3 h-3 text-stone-400" />}
              </button>
            </div>

            {/* User status Indicator */}
            <div>
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
              ) : currentUser ? (
                <div className="flex items-center gap-2">
                  <span className="hidden md:inline text-xs text-stone-500 font-medium">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <div 
                    onClick={() => setActiveTab("config")}
                    className="w-8 h-8 rounded-full bg-stone-100 border border-stone-200 overflow-hidden cursor-pointer hover:border-stone-400 transition"
                  >
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="User avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-600 text-xs font-bold font-mono">
                        {currentUser.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button
                  id="btn-login-header"
                  onClick={handleLogin}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-850 text-white text-xs font-semibold rounded-xl shadow-md transition duration-150 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Connecter Drive / Sheets
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Submenu tabs */}
        <div className="sm:hidden grid grid-cols-3 gap-1 bg-stone-50 border-t border-stone-200/50 p-1 text-center">
          <button
            onClick={() => setActiveTab("form")}
            className={`py-2 rounded-lg text-xs font-semibold ${
              activeTab === "form" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
            }`}
          >
            Formulaire
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${
              activeTab === "dashboard" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
            }`}
          >
            Stats {needsAuth && <Lock className="w-2.5 h-2.5" />}
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 ${
              activeTab === "config" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"
            }`}
          >
            Config {needsAuth && <Lock className="w-2.5 h-2.5" />}
          </button>
        </div>
      </nav>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Loading overlay for authorization */}
        {authLoading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="w-10 h-10 border-4 border-stone-900/10 border-t-stone-900 rounded-full animate-spin" />
            <p className="text-stone-500 text-xs font-mono">Authentification auprès des services Google...</p>
          </div>
        ) : (
          <>
            
            {/* If Auth is required and user is attempting restricted views */}
            {needsAuth && activeTab !== "form" ? (
              <div id="auth-gate-view" className="max-w-md mx-auto text-center py-16 px-6 bg-white border border-stone-200/80 rounded-3xl shadow-xl shadow-stone-100">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <HelpCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif text-stone-900 font-semibold mb-2">Connexion Google Requise</h3>
                <p className="text-stone-500 text-xs mb-6 leading-relaxed">
                  Pour accéder au Tableau de Bord, gérer les vœux ou synchroniser les universités, vous devez d'abord vous connecter pour lier l'application à votre espace personnel Google Drive et Google Sheets.
                </p>
                <button
                  id="btn-gate-login"
                  onClick={handleLogin}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-850 text-white rounded-xl text-xs font-semibold shadow-md transition"
                >
                  Se connecter avec Google
                </button>
              </div>
            ) : (
              <>
                {/* 1. FORM VIEW */}
                {activeTab === "form" && (
                  <div className="max-w-3xl mx-auto space-y-6">
                    {/* Welcome onboarding card when not logged in */}
                    {needsAuth && (
                      <div id="onboarding-notice" className="bg-gradient-to-r from-amber-50/60 to-orange-50/40 p-5 md:p-6 border border-amber-200/40 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold font-mono text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5" /> Connexion Recommandée
                          </h4>
                          <p className="text-stone-600 text-xs leading-relaxed max-w-lg">
                            Associez votre compte Google dès maintenant afin que les soumissions du formulaire soient automatiquement enregistrées dans un fichier <strong>Google Sheets</strong> hébergé de manière sécurisée sur votre propre Google Drive.
                          </p>
                        </div>
                        <button
                          id="btn-auth-form-top"
                          type="button"
                          onClick={handleLogin}
                          className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition flex items-center gap-1.5 shadow-sm"
                        >
                          Se connecter
                        </button>
                      </div>
                    )}

                    {!needsAuth && !sheetConfig.responsesId && (
                      <div className="p-4 bg-emerald-50/50 border border-emerald-200/40 text-emerald-800 text-xs rounded-2xl flex items-center justify-between">
                        <span>Le fichier spreadsheet de réponses sera programmatiquement créé sur votre Drive lors de la première soumission.</span>
                        <button 
                          onClick={async () => {
                            try {
                              sheetConfig.loading = true;
                              const id = await createResponsesSpreadsheet(getCachedAccessToken()!);
                              const link = await getSpreadsheetLink(getCachedAccessToken()!, id);
                              setSheetConfig(prev => ({
                                ...prev,
                                responsesId: id,
                                responsesLink: link,
                                loading: false
                              }));
                            } catch (e: any) {
                              alert("Erreur de création: " + e.message);
                            }
                          }}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg"
                        >
                          Créer maintenant
                        </button>
                      </div>
                    )}

                    <ReorientationForm
                      universities={universities}
                      onSubmit={handleFormSubmit}
                      isSubmitting={isFormSubmitting}
                      onReset={handleResetFormState}
                      successMessage={formSuccessMessage}
                    />
                  </div>
                )}

                {/* 2. DASHBOARD VIEW */}
                {activeTab === "dashboard" && (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-5">
                      <div>
                        <h2 className="text-2xl md:text-3xl font-serif text-stone-900 font-medium">Tableau de Bord Administratif</h2>
                        <p className="text-stone-500 text-xs mt-1">Supervisez et analysez les demandes de réorientation enregistrées sur Google Sheets en temps réel.</p>
                      </div>
                    </div>
                    
                    <AdminDashboard
                      submissions={submissions}
                      onRefresh={handleRefreshSubmissions}
                      isLoading={submissionsLoading}
                      spreadsheetLink={sheetConfig.responsesLink}
                    />
                  </div>
                )}

                {/* 3. CONFIGURATION VIEW */}
                {activeTab === "config" && (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="border-b border-stone-200 pb-5">
                      <h2 className="text-2xl md:text-3xl font-serif text-stone-900 font-medium">Paramètres de l'Application</h2>
                      <p className="text-stone-500 text-xs mt-1">Gérez vos jetons d'accès Google Workspace, inspectez l'intégration Sheets et personnalisez la base d'universités.</p>
                    </div>

                    <ConfigPanel
                      user={currentUser}
                      config={sheetConfig}
                      onLogout={handleLogout}
                      onInitializeResponsesSheet={handleInitializeResponsesSheet}
                      onInitializeUniversitiesSheet={handleInitializeUniversitiesSheet}
                      onSyncUniversitiesSheet={handleSyncUniversitiesSheet}
                      universitiesCount={universities.length}
                      isCustomUniversitiesActive={isCustomUniversitiesActive}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-stone-200/60 py-6 mt-16 font-sans text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-stone-400 font-mono">
            &copy; 2026 Portail National de Réorientation Universitaire. Google Sheets API Integration.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-stone-400 font-mono">
            <span>Hébergé sur Vercel / Cloud Run</span>
            <span>&bull;</span>
            <span>Secured via Firebase Auth</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
