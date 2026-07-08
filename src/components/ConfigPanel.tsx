import React, { useState } from "react";
import { SheetConfig, UniversityData } from "../types";
import { User, LogOut, FileSpreadsheet, RefreshCw, Layers, Database, AlertCircle, CheckCircle, Info } from "lucide-react";

interface ConfigPanelProps {
  user: any;
  config: SheetConfig;
  onLogout: () => Promise<void>;
  onInitializeResponsesSheet: () => Promise<void>;
  onInitializeUniversitiesSheet: () => Promise<void>;
  onSyncUniversitiesSheet: () => Promise<void>;
  universitiesCount: number;
  isCustomUniversitiesActive: boolean;
}

export default function ConfigPanel({
  user,
  config,
  onLogout,
  onInitializeResponsesSheet,
  onInitializeUniversitiesSheet,
  onSyncUniversitiesSheet,
  universitiesCount,
  isCustomUniversitiesActive,
}: ConfigPanelProps) {
  const [initResponsesLoading, setInitResponsesLoading] = useState(false);
  const [initUniversitiesLoading, setInitUniversitiesLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const handleCreateResponses = async () => {
    setInitResponsesLoading(true);
    try {
      await onInitializeResponsesSheet();
    } finally {
      setInitResponsesLoading(false);
    }
  };

  const handleCreateUniversities = async () => {
    setInitUniversitiesLoading(true);
    try {
      await onInitializeUniversitiesSheet();
    } finally {
      setInitUniversitiesLoading(false);
    }
  };

  const handleSyncUniversities = async () => {
    setSyncLoading(true);
    try {
      await onSyncUniversitiesSheet();
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* User Connection Profile */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-6 md:p-8 shadow-md shadow-stone-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "Admin User"}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full border border-stone-200 shadow-inner"
            />
          ) : (
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center border border-stone-200 text-stone-500">
              <User className="w-8 h-8" />
            </div>
          )}
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-stone-400">Compte Google Connecté</div>
            <h3 className="text-lg font-serif font-semibold text-stone-900 mt-0.5">
              {user.displayName || "Administrateur Académique"}
            </h3>
            <p className="text-stone-500 text-xs mt-0.5">{user.email}</p>
          </div>
        </div>

        <button
          id="btn-logout"
          onClick={onLogout}
          className="px-5 py-2.5 border border-red-200/60 hover:border-red-300 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50/50 transition duration-150 flex items-center gap-2 self-start md:self-center"
        >
          <LogOut className="w-4 h-4" /> Déconnecter
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* RESPONSES SPREADSHEET CARD */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-lg shadow-stone-50/50 p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h3 className="text-base font-serif font-semibold text-stone-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Stockage des Réponses (Formulaire)
            </h3>
            <span
              className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full uppercase tracking-wider ${
                config.responsesId
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700 animate-pulse"
              }`}
            >
              {config.responsesId ? "Active" : "Auto-Création"}
            </span>
          </div>

          <p className="text-stone-600 text-xs leading-relaxed">
            Par défaut, le système créera automatiquement le fichier Google Sheet nommé <strong>"Réorientation 2026 - Réponses"</strong> dans votre Google Drive lors de la toute première soumission. Vous pouvez également forcer sa création anticipée ci-dessous.
          </p>

          {config.responsesId ? (
            <div className="p-4 bg-emerald-50/30 border border-emerald-200/50 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-semibold">
                <CheckCircle className="w-4 h-4" /> Fichier de Réponses Connecté
              </div>
              <div className="text-[11px] text-stone-500 font-mono break-all">
                <span className="font-semibold text-stone-700">ID :</span> {config.responsesId}
              </div>
              <a
                id="link-responses-sheet"
                href={config.responsesLink || "#"}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline hover:no-underline"
              >
                Ouvrir la feuille Google Sheets ↗
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-stone-50 rounded-2xl flex gap-3 text-stone-500 text-xs leading-relaxed">
                <Info className="w-5 h-5 flex-shrink-0 text-stone-400" />
                <span>Le fichier de stockage n'existe pas encore sur votre Drive. Il sera créé à la première soumission.</span>
              </div>
              <button
                id="btn-create-responses-sheet"
                onClick={handleCreateResponses}
                disabled={initResponsesLoading}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 disabled:opacity-50 transition shadow-md shadow-emerald-50"
              >
                {initResponsesLoading ? "Création du fichier Google Sheet..." : "Créer le fichier maintenant sur mon Drive"}
              </button>
            </div>
          )}
        </div>

        {/* UNIVERSITIES REFERENCE DATA CARD */}
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-lg shadow-stone-50/50 p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h3 className="text-base font-serif font-semibold text-stone-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-500" /> Base de Données Universitaire
            </h3>
            <span
              className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full uppercase tracking-wider ${
                isCustomUniversitiesActive ? "bg-amber-50 text-amber-700" : "bg-stone-100 text-stone-600"
              }`}
            >
              {isCustomUniversitiesActive ? "Customisée (Drive)" : "Locale standard"}
            </span>
          </div>

          <p className="text-stone-600 text-xs leading-relaxed">
            Par défaut, le formulaire utilise la liste pré-chargée (<strong>{universitiesCount} combinaisons</strong>) extraite du document d'orientation. Vous pouvez exporter cette liste vers Google Drive pour pouvoir l'éditer en temps réel et la charger dynamiquement !
          </p>

          <div className="p-4 bg-stone-50/50 rounded-2xl text-xs space-y-2 text-stone-600">
            <div>
              <span className="font-semibold text-stone-850">Source active :</span>{" "}
              {isCustomUniversitiesActive ? "Fichier Google Sheets de votre Drive" : "Code local statique"}
            </div>
            <div>
              <span className="font-semibold text-stone-850">Lignes chargées :</span> {universitiesCount} filières
            </div>
          </div>

          {config.universitiesId ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/30 border border-amber-200/50 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4" /> Base de Données liée sur le Drive
                </div>
                <div className="text-[11px] text-stone-500 font-mono break-all">
                  <span className="font-semibold text-stone-700">ID :</span> {config.universitiesId}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <a
                    id="link-universities-sheet"
                    href={config.universitiesLink || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-xs font-semibold text-amber-700 hover:text-amber-800 underline hover:no-underline"
                  >
                    Éditer les Universités sur Sheets ↗
                  </a>
                </div>
              </div>

              <button
                id="btn-sync-universities-sheet"
                onClick={handleSyncUniversities}
                disabled={syncLoading}
                className="w-full py-3 bg-amber-500 text-white rounded-xl text-xs font-semibold hover:bg-amber-600 disabled:opacity-50 transition shadow-md shadow-amber-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${syncLoading ? "animate-spin" : ""}`} />
                {syncLoading ? "Synchronisation en cours..." : "Recharger les données depuis Google Sheets"}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                id="btn-create-universities-sheet"
                onClick={handleCreateUniversities}
                disabled={initUniversitiesLoading}
                className="w-full py-3 bg-stone-900 text-white hover:bg-stone-850 rounded-xl text-xs font-semibold disabled:opacity-50 transition shadow-md"
              >
                {initUniversitiesLoading ? "Création & Exportation..." : "Exporter les données vers Google Sheets"}
              </button>
              <p className="text-[10px] text-stone-400 text-center font-sans">
                Cela créera un fichier "Réorientation 2026 - Universités Data" contenant les {universitiesCount} lignes pour vous permettre de modifier la liste officielle des formations.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
