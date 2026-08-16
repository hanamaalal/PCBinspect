"use client";

import { useEffect, useState } from "react";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  FileDown,
} from "lucide-react";

import {
  exportHistoriqueExcel,
  getHistorique,
  getInspectionDetails,
} from "@/lib/api";

import {
  HistoriqueItem,
  HistoriqueFilters,
  InspectionDetails,
} from "@/lib/types";

import { Badge } from "@/components/ui/Badge";
import DefautModal from "../components/DefaultModal";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Header from "@/components/layout/Header";
import { useAuth } from "@/app/context/AuthContext";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoriqueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  /* =========================================================
     FILTRES APPLIQUÉS
  ========================================================= */

  const [filters, setFilters] = useState<HistoriqueFilters>({
    page: 1,
    limit: 9,
  });

  /* =========================================================
     FILTRES TEMPORAIRES
  ========================================================= */

  const [tempFilters, setTempFilters] =
    useState<HistoriqueFilters>({
      page: 1,
      limit: 9,
    });

  const [selectedDetails, setSelectedDetails] =
    useState<InspectionDetails | null>(null);

  /* =========================================================
     CHARGEMENT HISTORIQUE
  ========================================================= */

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await getHistorique(filters);

      console.log("Historique reçu :", res);

      setItems(res.data ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (error) {
      console.error(
        "Erreur récupération historique :",
        error
      );

      setItems([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [
    filters.page,
    filters.date,
    filters.sn,
    filters.of,
    filters.statut,
  ]);

  /* =========================================================
     AFFICHER DÉTAILS
  ========================================================= */

  const handleShowDetails = async (id: string) => {
    try {
      const data = await getInspectionDetails(id);

      setSelectedDetails(data);
    } catch (error) {
      console.error(
        "Erreur récupération détails :",
        error
      );
    }
  };

  /* =========================================================
     EXPORT EXCEL
  ========================================================= */

  const handleExportExcel = async () => {
    try {
      await exportHistoriqueExcel({
        date: filters.date,
        sn: filters.sn,
        of: filters.of,
        statut: filters.statut,
      });
    } catch (error) {
      console.error(
        "Erreur export Excel :",
        error
      );
    }
  };

  /* =========================================================
     RESET FILTRES
  ========================================================= */

  const handleResetFilters = () => {
    const defaultFilters: HistoriqueFilters = {
      page: 1,
      limit: 9,
    };

    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  /* =========================================================
     APPLIQUER FILTRES
  ========================================================= */

  const handleApplyFilters = () => {
    setFilters({
      ...tempFilters,
      page: 1,
      limit: 9,
    });
  };

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header
        user={{
          firstName: user?.firstname ?? "",
          lastName: user?.lastname ?? "",
          role: user?.role ?? "",
        }}
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main
        className="
          min-h-screen
          bg-gray-50
          px-6
          py-8
          transition-colors
          duration-300
          sm:px-8
          dark:bg-slate-950
        "
      >
        {/* ===================================================
            TITRE
        =================================================== */}

        <div className="mb-8">
          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-gray-900
              transition-colors
              duration-300
              sm:text-3xl
              dark:text-white
            "
          >
            Historique des inspections
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
              dark:text-slate-400
            "
          >
            Consultez et recherchez les inspections réalisées
          </p>
        </div>

        {/* ===================================================
            EXPORT
        =================================================== */}

        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={handleExportExcel}
            className="
              flex
              items-center
              gap-2
              rounded-lg
              border
              border-gray-300
              bg-gray-300
              px-4
              py-2
              text-sm
              font-medium
              text-gray-700
              shadow-sm
              transition-all
              duration-200

              hover:border-teal-400
              hover:bg-teal-50
              hover:text-teal-700

              dark:border-slate-700
              dark:bg-slate-900
              dark:text-slate-200

              dark:hover:border-teal-500
              dark:hover:bg-teal-500
              dark:hover:text-slate-950
            "
          >
            <FileDown size={16} />
            Exporter Excel
          </button>
        </div>

        {/* ===================================================
            FILTRES
        =================================================== */}

        <section
          className="
            mb-6
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-5
            shadow-sm
            transition-colors
            duration-300

            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div
            className="
              mb-5
              flex
              items-center
              gap-2
            "
          >
            <Filter
              size={18}
              className="
                text-gray-700
                dark:text-teal-400
              "
            />

            <h2
              className="
                font-semibold
                text-gray-800
                dark:text-white
              "
            >
              Filtres de recherche
            </h2>
          </div>

          {/* =================================================
              FILTRES SUR UNE MÊME LIGNE
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
              lg:grid-cols-6
              lg:items-end
            "
          >
            {/* =================================================
                SN
            ================================================= */}

            <div className="flex flex-col">
              <label
                className="
                  mb-1.5
                  text-xs
                  font-medium
                  text-gray-600
                  dark:text-slate-300
                "
              >
                Numéro de série
              </label>

              <input
                type="text"
                placeholder="Ex : SN001"
                value={tempFilters.sn ?? ""}
                onChange={(e) =>
                  setTempFilters((f) => ({
                    ...f,
                    sn: e.target.value,
                  }))
                }
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-3
                  text-sm
                  text-gray-900
                  outline-none
                  transition-all
                  duration-200

                  placeholder:text-gray-400

                  focus:border-teal-500
                  focus:ring-2
                  focus:ring-teal-500/20

                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-white
                  dark:placeholder:text-slate-500

                  dark:focus:border-teal-400
                  dark:focus:ring-teal-400/20
                "
              />
            </div>

            {/* =================================================
                OF
            ================================================= */}

            <div className="flex flex-col">
              <label
                className="
                  mb-1.5
                  text-xs
                  font-medium
                  text-gray-600
                  dark:text-slate-300
                "
              >
                Ordre de fabrication
              </label>

              <input
                type="text"
                placeholder="Ex : OF001"
                value={tempFilters.of ?? ""}
                onChange={(e) =>
                  setTempFilters((f) => ({
                    ...f,
                    of: e.target.value,
                  }))
                }
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-3
                  text-sm
                  text-gray-900
                  outline-none
                  transition-all
                  duration-200

                  placeholder:text-gray-400

                  focus:border-teal-500
                  focus:ring-2
                  focus:ring-teal-500/20

                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-white
                  dark:placeholder:text-slate-500

                  dark:focus:border-teal-400
                  dark:focus:ring-teal-400/20
                "
              />
            </div>

            {/* =================================================
                DATE
            ================================================= */}

            <div className="flex flex-col">
              <label
                className="
                  mb-1.5
                  text-xs
                  font-medium
                  text-gray-600
                  dark:text-slate-300
                "
              >
                Date
              </label>

              <input
                type="date"
                value={tempFilters.date ?? ""}
                onChange={(e) =>
                  setTempFilters((f) => ({
                    ...f,
                    date: e.target.value,
                  }))
                }
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-3
                  text-sm
                  text-gray-900
                  outline-none
                  transition-all
                  duration-200

                  focus:border-teal-500
                  focus:ring-2
                  focus:ring-teal-500/20

                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-white

                  dark:[color-scheme:dark]

                  dark:focus:border-teal-400
                  dark:focus:ring-teal-400/20
                "
              />
            </div>

            {/* =================================================
                STATUT
            ================================================= */}

            <div className="flex flex-col">
              <label
                className="
                  mb-1.5
                  text-xs
                  font-medium
                  text-gray-600
                  dark:text-slate-300
                "
              >
                Statut
              </label>

              <Select
                value={tempFilters.statut ?? "all"}
                onSelectionChange={(value) => {
                  setTempFilters((f) => ({
                    ...f,
                    statut:
                      value === "all"
                        ? undefined
                        : (value as
                            | "GOOD"
                            | "NOT_GOOD"),
                  }));
                }}
              >
                <SelectTrigger
                  aria-label="Statut"
                  className="
                    h-10
                    w-50
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-3
                    text-sm
                    text-gray-900

                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-white
                  "
                >
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>

                <SelectContent
                  className="
                    border-gray-200
                    bg-white

                    dark:border-slate-700
                    dark:bg-slate-900
                  "
                >
                  <SelectItem
                    id="all"
                    textValue="Tous"
                    className="
                      data-focused:!bg-teal-500
                      data-focused:!text-white

                      dark:text-slate-200
                    "
                  >
                    Tous
                  </SelectItem>

                  <SelectItem
                    id="GOOD"
                    textValue="GOOD"
                    className="
                      data-focused:!bg-teal-500
                      data-focused:!text-white

                      dark:text-slate-200
                    "
                  >
                    GOOD
                  </SelectItem>

                  <SelectItem
                    id="NOT_GOOD"
                    textValue="NOT_GOOD"
                    className="
                      data-focused:!bg-teal-500
                      data-focused:!text-white

                      dark:text-slate-200
                    "
                  >
                    Not Good
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* =================================================
                BOUTON FILTRER
            ================================================= */}

            <div className="flex flex-col">
              <label
                className="
                  mb-1.5
                  text-xs
                  font-medium
                  text-transparent
                  select-none
                "
              >
                Action
              </label>

              <button
                type="button"
                onClick={handleApplyFilters}
                className="
                  flex
                  h-10
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-gray-900
                  px-4
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition-all
                  duration-200

                  hover:bg-gray-800
                  hover:shadow-md

                  dark:bg-teal-500
                  dark:text-slate-950
                  dark:hover:bg-teal-400
                "
              >
                <Filter size={16} />
                Filtrer
              </button>
            </div>

            {/* =================================================
                RESET
            ================================================= */}

            <div className="flex flex-col">
              <label
                className="
                  mb-1.5
                  text-xs
                  font-medium
                  text-transparent
                  select-none
                "
              >
                Action
              </label>

              <button
                type="button"
                onClick={handleResetFilters}
                className="
                  flex
                  h-10
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
                  text-sm
                  font-medium
                  text-gray-700
                  transition-all
                  duration-200

                  hover:border-teal-400
                  hover:bg-teal-50
                  hover:text-teal-700

                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-slate-200

                  dark:hover:border-teal-500
                  dark:hover:bg-teal-500
                  dark:hover:text-slate-950
                "
                title="Réinitialiser les filtres"
              >
                <RotateCcw size={16} />
                Réinitialiser
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            TABLE
        =================================================== */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-gray-200
            bg-white
            shadow-sm
            transition-colors
            duration-300

            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          {/* =================================================
              HEADER TABLE
          ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-gray-200
              bg-gray-100
              px-5
              py-3

              dark:border-slate-800
              dark:bg-slate-800
            "
          >
            <div
              className="
                text-sm
                font-medium
                text-gray-700
                dark:text-slate-300
              "
            >
              NB inspections trouvées :
              <b
                className="
                  ml-2
                  font-bold
                  text-gray-900
                  dark:text-white
                "
              >
                {total}
              </b>
            </div>
          </div>

          {/* =================================================
              TABLE RESPONSIVE
          ================================================= */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              {/* =================================================
                  THEAD
              ================================================= */}

              <thead>
                <tr
                  className="
                    border-b
                    border-gray-200
                    bg-gray-50
                    text-gray-500

                    dark:border-slate-800
                    dark:bg-slate-800/60
                    dark:text-slate-400
                  "
                >
                  <th className="p-3 text-center font-semibold">
                    Date/heure
                  </th>

                  <th className="p-3 text-center font-semibold">
                    SN
                  </th>

                  <th className="p-3 text-center font-semibold">
                    OF
                  </th>

                  <th className="p-3 text-center font-semibold">
                    Statut
                  </th>

                  <th className="p-3 text-center font-semibold">
                    Défauts
                  </th>
                </tr>
              </thead>

              {/* =================================================
                  TBODY
              ================================================= */}

              <tbody
                className="
                  divide-y
                  divide-gray-200

                  dark:divide-slate-800
                "
              >
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="
                        p-8
                        text-center
                        text-sm
                        text-gray-500

                        dark:text-slate-400
                      "
                    >
                      Chargement...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="
                        p-8
                        text-center
                        text-sm
                        text-gray-500

                        dark:text-slate-400
                      "
                    >
                      Aucune inspection trouvée
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="
                        bg-white
                        transition-colors
                        duration-200
                        hover:bg-gray-50

                        dark:bg-slate-900
                        dark:hover:bg-slate-800/70
                      "
                    >
                      {/* DATE */}

                      <td
                        className="
                          p-3
                          text-center
                          text-gray-700

                          dark:text-slate-300
                        "
                      >
                        {new Date(
                          item.dateHeure
                        ).toLocaleString("fr-FR")}
                      </td>

                      {/* SN */}

                      <td
                        className="
                          p-3
                          text-center
                          font-medium
                          text-gray-900

                          dark:text-white
                        "
                      >
                        {item.sn}
                      </td>

                      {/* OF */}

                      <td
                        className="
                          p-3
                          text-center
                          text-gray-700

                          dark:text-slate-300
                        "
                      >
                        {item.of}
                      </td>

                      {/* STATUT */}

                      <td className="p-3 text-center">
                        <Badge
                          variant={
                            item.resultat === "GOOD"
                              ? "good"
                              : "not-good"
                          }
                        >
                          {item.resultat === "GOOD"
                            ? "GOOD"
                            : "NG"}
                        </Badge>
                      </td>

                      {/* DÉFAUTS */}

                      <td className="p-3 text-center">
                        {item.nombreDefauts > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleShowDetails(item.id)
                            }
                            className="
                              rounded-full
                              bg-gray-900
                              px-3
                              py-1
                              text-xs
                              font-medium
                              text-white
                              transition-all
                              duration-200

                              hover:bg-teal-500

                              dark:bg-slate-700
                              dark:text-white

                              dark:hover:bg-teal-500
                              dark:hover:text-slate-950
                            "
                          >
                            Voir liste
                          </button>
                        ) : (
                          <span
                            className="
                              text-xs
                              text-gray-400
                              dark:text-slate-600
                            "
                          >
                            Aucun
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ===================================================
            PAGINATION
        =================================================== */}

        <div
          className="
            mt-5
            flex
            justify-end
            gap-3
          "
        >
          {/* PREVIOUS */}

          <button
            type="button"
            disabled={filters.page === 1}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                page: (f.page ?? 1) - 1,
              }))
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-gray-300
              bg-white
              text-gray-700
              transition-all
              duration-200

              hover:border-teal-400
              hover:bg-teal-500
              hover:text-white

              disabled:cursor-not-allowed
              disabled:opacity-40

              dark:border-slate-700
              dark:bg-slate-900
              dark:text-slate-300

              dark:hover:border-teal-500
              dark:hover:bg-teal-500
              dark:hover:text-slate-950
            "
          >
            <ChevronLeft size={17} />
          </button>

          {/* PAGE */}

          <div
            className="
              flex
              h-10
              min-w-10
              items-center
              justify-center
              rounded-full
              border
              border-gray-200
              bg-white
              px-3
              text-sm
              font-semibold
              text-gray-700

              dark:border-slate-700
              dark:bg-slate-900
              dark:text-slate-200
            "
          >
            {filters.page} / {totalPages}
          </div>

          {/* NEXT */}

          <button
            type="button"
            disabled={filters.page === totalPages}
            onClick={() =>
              setFilters((f) => ({
                ...f,
                page: (f.page ?? 1) + 1,
              }))
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-teal-500
              bg-teal-500
              text-white
              transition-all
              duration-200

              hover:bg-teal-400

              disabled:cursor-not-allowed
              disabled:opacity-40

              dark:text-slate-950
            "
          >
            <ChevronRight size={17} />
          </button>
        </div>

        {/* ===================================================
            MODAL DÉFAUTS
        =================================================== */}

        {selectedDetails && (
          <DefautModal
            details={selectedDetails}
            onClose={() =>
              setSelectedDetails(null)
            }
          />
        )}
      </main>
    </>
  );
}
