import React, { useState, useMemo } from "react";
import { Submission } from "../types";
import { RefreshCw, FileSpreadsheet, Search, Check, ChevronRight, BarChart2, Users, MapPin, Grid, Award } from "lucide-react";

interface AdminDashboardProps {
  submissions: Submission[];
  onRefresh: () => Promise<void>;
  isLoading: boolean;
  spreadsheetLink: string | null;
}

export default function AdminDashboard({
  submissions,
  onRefresh,
  isLoading,
  spreadsheetLink,
}: AdminDashboardProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const [activeStatTab, setActiveStatTab] = useState<"general" | "series" | "regions" | "wishes">("general");

  // Filtering submissions
  const filteredSubmissions = useMemo(() => {
    if (!filterQuery.trim()) return submissions;
    const query = filterQuery.toLowerCase();
    return submissions.filter(
      (s) =>
        s.nom.toLowerCase().includes(query) ||
        s.prenom.toLowerCase().includes(query) ||
        s.matriculeBac.includes(query) ||
        s.wilayaBac.toLowerCase().includes(query) ||
        s.choix1.toLowerCase().includes(query)
    );
  }, [submissions, filterQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = submissions.length;
    
    // BAC Series distribution
    const seriesMap: Record<string, number> = {};
    // Region distribution
    const regionMap: Record<string, number> = {};
    // First wishes distribution (top specialties)
    const wishesMap: Record<string, number> = {};
    // Wilaya distribution
    const wilayaMap: Record<string, number> = {};

    let sumMoyenne = 0;

    submissions.forEach((s) => {
      sumMoyenne += s.moyenneBac;
      seriesMap[s.serieBac] = (seriesMap[s.serieBac] || 0) + 1;
      regionMap[s.regionWilayaBac] = (regionMap[s.regionWilayaBac] || 0) + 1;
      
      // Extract specialty or university name
      const cleanWish = s.choix1.split("—")[0].trim() || "Non spécifié";
      wishesMap[cleanWish] = (wishesMap[cleanWish] || 0) + 1;

      wilayaMap[s.wilayaBac] = (wilayaMap[s.wilayaBac] || 0) + 1;
    });

    const avgMoyenne = total > 0 ? (sumMoyenne / total).toFixed(2) : "0.00";

    const convertToSortedArray = (map: Record<string, number>) => {
      return Object.entries(map)
        .map(([name, count]) => ({
          name,
          count,
          percentage: total > 0 ? ((count / total) * 100).toFixed(1) : "0",
        }))
        .sort((a, b) => b.count - a.count);
    };

    return {
      total,
      avgMoyenne,
      series: convertToSortedArray(seriesMap),
      regions: convertToSortedArray(regionMap),
      wishes: convertToSortedArray(wishesMap).slice(0, 5),
      wilayas: convertToSortedArray(wilayaMap).slice(0, 5),
    };
  }, [submissions]);

  return (
    <div className="space-y-8 font-sans">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-md shadow-stone-50 flex items-center gap-4">
          <div className="p-3 bg-stone-100 rounded-xl text-stone-900">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">Total Demandes</span>
            <span id="stat-total" className="text-2xl font-semibold text-stone-900 font-serif">{stats.total}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-md shadow-stone-50 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">Moyenne BAC Moyenne</span>
            <span id="stat-avg" className="text-2xl font-semibold text-stone-900 font-serif">{stats.avgMoyenne}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-md shadow-stone-50 flex items-center gap-4 md:col-span-2">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">Fichier Réponses Actif</span>
            {spreadsheetLink ? (
              <a
                id="link-spreadsheet"
                href={spreadsheetLink}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-stone-900 hover:text-emerald-700 font-medium underline truncate block mt-1"
              >
                Ouvrir dans Google Sheets ↗
              </a>
            ) : (
              <span className="text-xs text-stone-400 block mt-1">Non lié à Google Drive</span>
            )}
          </div>
        </div>
      </div>

      {/* Visual Analytical Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Statistics panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-lg shadow-stone-50/50 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-serif font-semibold text-stone-900 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-amber-500" /> Analyses Statistiques
              </h3>
              <button
                id="btn-refresh-stats"
                onClick={onRefresh}
                disabled={isLoading}
                className="p-1.5 hover:bg-stone-50 text-stone-500 rounded-lg transition"
                title="Actualiser les données"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Stat Tab Selectors */}
            <div className="grid grid-cols-3 gap-1 bg-stone-100 p-1 rounded-xl mb-6 text-xs">
              <button
                onClick={() => setActiveStatTab("general")}
                className={`py-2 px-1 rounded-lg text-center font-medium transition ${
                  activeStatTab === "general" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-850"
                }`}
              >
                Vœux Top
              </button>
              <button
                onClick={() => setActiveStatTab("series")}
                className={`py-2 px-1 rounded-lg text-center font-medium transition ${
                  activeStatTab === "series" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-850"
                }`}
              >
                Séries BAC
              </button>
              <button
                onClick={() => setActiveStatTab("regions")}
                className={`py-2 px-1 rounded-lg text-center font-medium transition ${
                  activeStatTab === "regions" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-850"
                }`}
              >
                Régions
              </button>
            </div>

            {/* Stat bars */}
            <div className="space-y-4">
              {stats.total === 0 ? (
                <div className="text-center py-12 text-xs text-stone-400">Aucune donnée statistique à afficher. Soumettez des réponses d'abord.</div>
              ) : (
                <>
                  {activeStatTab === "general" &&
                    stats.wishes.map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-stone-700 truncate max-w-[70%]">{item.name}</span>
                          <span className="font-semibold text-stone-900">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-stone-900 h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}

                  {activeStatTab === "series" &&
                    stats.series.map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-stone-700 truncate">{item.name}</span>
                          <span className="font-semibold text-stone-900">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-amber-400 h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}

                  {activeStatTab === "regions" &&
                    stats.regions.map((item, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-stone-700 truncate">{item.name}</span>
                          <span className="font-semibold text-stone-900">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>

          {stats.total > 0 && (
            <div className="border-t border-stone-150 pt-4 mt-6 text-[10px] text-stone-400 font-mono flex items-center justify-between">
              <span>Synchronisation Instantanée</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold"><Check className="w-3.5 h-3.5" /> Google Sheets API OK</span>
            </div>
          )}
        </div>

        {/* Submissions List Grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200/80 shadow-lg shadow-stone-50/50 overflow-hidden flex flex-col justify-between">
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h3 className="text-base font-serif font-semibold text-stone-900 flex items-center gap-2">
                <Grid className="w-5 h-5 text-amber-500" /> Liste des Fiches Reçues
              </h3>
              
              {/* Search Bar */}
              <div className="relative md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Chercher par nom, matricule..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:outline-none focus:ring-4 focus:ring-stone-200 transition"
                />
              </div>
            </div>

            {/* List and Cards */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto scrollbar-thin pr-1">
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-20 text-xs text-stone-400 font-sans">
                  {submissions.length === 0
                    ? "Aucune réorientation n'a été soumise pour le moment."
                    : "Aucun résultat ne correspond à votre filtre."}
                </div>
              ) : (
                filteredSubmissions.map((s) => (
                  <div
                    key={s.id}
                    id={`submission-item-${s.id}`}
                    className="p-4 bg-stone-50/30 border border-stone-200/70 rounded-2xl hover:bg-stone-50/80 hover:border-stone-300 transition duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded text-[10px]">
                          {s.matriculeBac}
                        </span>
                        <span className="font-semibold text-stone-900">
                          {s.nom.toUpperCase()} {s.prenom}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">
                        <span className="font-medium text-stone-700">Choix 1 :</span> {s.choix1}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-stone-400 font-mono">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.wilayaBac}</span>
                        <span>Moyenne: {s.moyenneBac.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-center items-end">
                      <span className="text-[9px] font-mono text-stone-400 block mb-1">
                        {s.timestamp.split("T")[0] || s.timestamp}
                      </span>
                      <span className="text-[10px] px-2.5 py-1 bg-white border border-stone-200 rounded-full font-medium text-stone-600 block shadow-sm">
                        {s.serieBac}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-stone-50 border-t border-stone-150 p-4 text-center">
            <span className="text-[10px] text-stone-400 font-mono">
              Fiche de Réorientation — {filteredSubmissions.length} éléments affichés
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
