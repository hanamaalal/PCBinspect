
"use client";

import { useEffect, useState } from "react";

import { ProductionCard } from "./components/ProductionCard";
import { StatCard } from "./components/StatCard";
import { LastInspectedList } from "./components/LastInspectedList";
import { UnitsStatus } from "./components/UnitsStatus";
import { InspectionHistory } from "./components/InspectionHistory";

import { getDashboardData } from "@/lib/api";
import Header from "@/components/layout/Header";

interface DashboardData {
  user?: {
    firstname?: string;
    lastname?: string;
    role?: string;
  };

  totalOF?: number;
  totalPieces?: number;
  totalPRF?: number;

  lastInspections?: any[];
  unitsStatus?: any[];
  shiftHistory?: any[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const result = await getDashboardData();

        console.log("DASHBOARD DATA :", result);

        setData(result);
      } catch (err: any) {
        console.error("Erreur dashboard :", err);

        setError(
          err?.message ?? "Erreur chargement dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        <Header
          user={{
            firstName: data?.user?.firstname ?? "",
            lastName: data?.user?.lastname ?? "",
            role: data?.user?.role ?? "",
          }}
        />

        <main className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="rounded-2xl border border-gray-200 bg-white px-8 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600 dark:border-teal-900 dark:border-t-teal-400" />

              <span className="font-medium text-gray-700 dark:text-slate-300">
                Chargement du dashboard...
              </span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /*
   * =========================================================
   * ERREUR
   * =========================================================
   */

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        <Header
          user={{
            firstName: data?.user?.firstname ?? "",
            lastName: data?.user?.lastname ?? "",
            role: data?.user?.role ?? "",
          }}
        />

        <main className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm dark:border-red-900/60 dark:bg-slate-900">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/60">
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                !
              </span>
            </div>

            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Erreur
            </h1>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        </main>
      </div>
    );
  }

  /*
   * =========================================================
   * DASHBOARD
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header
        user={{
          firstName: data?.user?.firstname ?? "",
          lastName: data?.user?.lastname ?? "",
          role: data?.user?.role ?? "",
        }}
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="min-h-screen space-y-6 bg-gray-50 p-6 transition-colors duration-300 sm:p-8 dark:bg-slate-950">
        {/* ===================================================
            TITLE
        =================================================== */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Vue globale de la production et des inspections
            </p>
          </div>

          {/* INDICATEUR COULEUR PRIMAIRE */}

          <div className="hidden items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 sm:flex dark:border-teal-900/60 dark:bg-teal-950/40">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500 dark:bg-teal-400" />

            <span className="text-xs font-semibold text-teal-700 dark:text-teal-300">
              Système opérationnel
            </span>
          </div>
        </div>

        {/* ===================================================
            DASHBOARD GRID
        =================================================== */}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* =================================================
              COLONNE GAUCHE
          ================================================= */}

          <div className="space-y-6 lg:col-span-2">
            {/* PRODUCTION */}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
              <ProductionCard />
            </div>

            {/* DERNIÈRES INSPECTIONS */}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
              <LastInspectedList
                inspections={data?.lastInspections ?? []}
              />
            </div>
          </div>

          {/* =================================================
              COLONNE DROITE
          ================================================= */}

          <div className="space-y-6">
            {/* =================================================
                STATISTIQUES OF / PIÈCES
            ================================================= */}

            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
                <StatCard
                  icon="of-prf"
                  label="OF"
                  value={data?.totalOF ?? 0}
                />
              </div>

              <div className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
                <StatCard
                  icon="pieces"
                  label="Pièces inspectées"
                  value={data?.totalPieces ?? 0}
                />
              </div>
            </div>

            {/* =================================================
                PRF
            ================================================= */}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
              <StatCard
                icon="prf"
                label="PRF"
                value={data?.totalPRF ?? 0}
              />
            </div>

            {/* =================================================
                ÉTAT DES UNITÉS
            ================================================= */}

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
              <UnitsStatus
                units={data?.unitsStatus ?? []}
              />
            </div>
          </div>
        </div>

        {/* ===================================================
            HISTORIQUE INSPECTION
        =================================================== */}

      <h3
        className="
          mb-4
          text-lg
          font-bold
          text-text-primary
          transition-colors
          duration-300
          dark:text-white
        "
      >
        Historique des inspections récentes
      </h3>
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
       
          <InspectionHistory
            reports={data?.shiftHistory ?? []}
          />
        </div>
      </main>
    </div>
  );
}

