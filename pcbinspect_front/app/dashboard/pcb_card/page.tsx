"use client";

import { useEffect, useState } from "react";
import {
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

import { getPcbCards } from "@/lib/api";
import { PcbCardFilters } from "@/lib/types";
import PcbCard from "../components/PcbCard";
import Header from "@/components/layout/Header";
import { useAuth } from "@/app/context/AuthContext";

export default function PcbCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const { user } = useAuth();

  /* =========================================================
     FILTRES APPLIQUÉS
  ========================================================= */

  const [filters, setFilters] = useState<PcbCardFilters>({
    page: 1,
    limit: 6,
  });

  /* =========================================================
     FILTRES TEMPORAIRES
  ========================================================= */

  const [tempFilters, setTempFilters] =
    useState<PcbCardFilters>({
      page: 1,
      limit: 6,
    });

  /* =========================================================
     CHARGEMENT DES CARTES
  ========================================================= */

  useEffect(() => {
    loadCards();
  }, [
    filters.page,
    filters.sn,
    filters.of,
    filters.date,
    filters.statut,
  ]);

  async function loadCards() {
    try {
      const res = await getPcbCards(filters);

      console.log(
        "CARTE COMPLETE :",
        JSON.stringify(res.data?.[0], null, 2)
      );

      setCards(res.data ?? []);
      setTotal(res.total ?? 0);
      setTotalPages(res.totalPages ?? 1);
    } catch (error) {
      console.error(
        "Erreur récupération cartes :",
        error
      );

      setCards([]);
      setTotal(0);
      setTotalPages(1);
    }
  }

  /* =========================================================
     RESET FILTRES
  ========================================================= */

  const handleResetFilters = () => {
    const defaultFilters: PcbCardFilters = {
      page: 1,
      limit: 6,
    };

    setTempFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  return (
    <div
      className="
        min-h-screen
        bg-gray-50
        transition-colors
        duration-300
        dark:bg-slate-950
      "
    >
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
          CONTENU
      ===================================================== */}

      <main
        className="
          px-6
          py-8
          sm:px-8
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
            Consultation et recherche des cartes
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
              dark:text-slate-400
            "
          >
            Rechercher et consulter les cartes inspectées
          </p>
        </div>

        {/* ===================================================
            GRID PRINCIPAL
        =================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-6
            lg:grid-cols-12
            lg:gap-8
          "
        >
          {/* =================================================
              COLONNE GAUCHE — FILTRES
          ================================================= */}

          <div className="lg:col-span-4">
            {/* TITRE FILTRES */}

            <h2
              className="
                mb-5
                flex
                items-center
                gap-2
                font-semibold
                text-gray-700
                transition-colors
                duration-300
                dark:text-slate-200
              "
            >
              <Filter size={18} />
              Filtres de recherche
            </h2>

            {/* =================================================
                CARTE FILTRES
            ================================================= */}

            <div
              className="
                space-y-4
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
              {/* =================================================
                  NUMÉRO DE SÉRIE
              ================================================= */}

              <input
                placeholder="NUMÉRO DE SÉRIE"
                value={tempFilters.sn ?? ""}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    sn: e.target.value,
                  })
                }
                className="
                  h-11
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
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
                  dark:bg-slate-800/70
                  dark:text-white
                  dark:placeholder:text-slate-500
                  dark:focus:border-teal-400
                  dark:focus:ring-teal-400/20
                "
              />

              {/* =================================================
                  OF
              ================================================= */}

              <input
                placeholder="ORDRE DE FABRICATION"
                value={tempFilters.of ?? ""}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    of: e.target.value,
                  })
                }
                className="
                  h-11
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-4
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
                  dark:bg-slate-800/70
                  dark:text-white
                  dark:placeholder:text-slate-500
                  dark:focus:border-teal-400
                  dark:focus:ring-teal-400/20
                "
              />

              {/* =================================================
                  DATE
              ================================================= */}

              <input
  type="date"
  value={tempFilters.date ?? ""}
  onChange={(e) =>
    setTempFilters((prev) => ({
      ...prev,
      date: e.target.value,
    }))
  }
  className="
    h-11
    w-full
    rounded-lg
    border
    border-gray-300
    bg-white
    px-4
    text-sm
    text-gray-900
    outline-none
    transition-all

    focus:border-teal-500
    focus:ring-2
    focus:ring-teal-500/20

    dark:border-slate-700
    dark:bg-slate-800/70
    dark:text-white
    dark:[color-scheme:dark]

    [&::-webkit-calendar-picker-indicator]:cursor-pointer
    dark:[&::-webkit-calendar-picker-indicator]:opacity-80
  "
/>

              {/* =================================================
                  STATUT
              ================================================= */}

              <div className="flex gap-3">
                {/* GOOD */}

                <button
                  type="button"
                  onClick={() =>
                    setTempFilters({
                      ...tempFilters,
                      statut: "GOOD",
                    })
                  }
                  className={`
                    h-11
                    flex-1
                    rounded-lg
                    border
                    text-sm
                    font-medium
                    transition-all
                    duration-200

                    ${
                      tempFilters.statut === "GOOD"
                        ? `
                          border-teal-500
                          bg-teal-500
                          text-white
                          shadow-sm
                        `
                        : `
                         dark:bg-[#1d5555]
                          dark:border-[#1d5555]
                          dark:text-white
                          border-gray-300
                          bg-white
                          text-gray-700
                          hover:border-teal-400
                          hover:bg-teal-50
                        `
                    }

                    dark:${
                      tempFilters.statut === "GOOD"
                        ? "border-teal-400 bg-teal-500 text-slate-950"
                        : ""
                    }
                  `}
                >
                  GOOD
                </button>

                {/* NOT GOOD */}

                <button
                  type="button"
                  onClick={() =>
                    setTempFilters({
                      ...tempFilters,
                      statut: "NOT_GOOD",
                    })
                  }
                  className={`
                    h-11
                    flex-1
                    rounded-lg
                    border
                    text-sm
                    font-medium
                    transition-all
                    duration-200

                    ${
                      tempFilters.statut === "NOT_GOOD"
                        ? `
                          border-teal-500
                          bg-teal-500
                          text-white
                          shadow-sm
                        `
                        : `
                          dark:bg-[#1d5555]
                          dark:border-[#1d5555]
                          dark:text-white
                          border-gray-300
                          bg-white
                          text-gray-700
                          hover:border-teal-400
                          hover:bg-teal-50
                        `
                    }
                  `}
                >
                  NG
                </button>
              </div>

              {/* =================================================
                  APPLIQUER
              ================================================= */}

              <button
                type="button"
                onClick={() =>
                  setFilters({
                    ...tempFilters,
                    page: 1,
                  })
                }
                className="
                  h-12
                  w-full
                  rounded-lg
                  bg-gray-900
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
                Appliquer les filtres
              </button>
            </div>
          </div>

          {/* =================================================
              COLONNE DROITE — CARTES
          ================================================= */}

          <div className="lg:col-span-8">
            {/* =================================================
                COMPTEUR
            ================================================= */}

            <div
              className="
                mb-5
                rounded-xl
                border
                border-gray-200
                bg-gray-100
                px-4
                py-3
                transition-colors
                duration-300

                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <div className="flex items-center">
                <span
                  className="
                    font-semibold
                    text-gray-700
                    dark:text-slate-300
                  "
                >
                  NB cartes trouvées :
                </span>

                <span
                  className="
                    ml-3
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  {total}
                </span>

                {/* RESET */}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="
                    ml-auto
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-teal-500
                    px-3
                    py-2
                    text-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:bg-teal-600
                    hover:shadow-md

                    dark:bg-teal-500
                    dark:text-slate-950
                    dark:hover:bg-teal-400
                  "
                  title="Réinitialiser les filtres"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* =================================================
                LISTE CARTES
            ================================================= */}

            <div
              className="
                grid
                grid-cols-1
                gap-6
                sm:grid-cols-2
                xl:grid-cols-3
              "
            >
              {cards.map((card) => (
                <PcbCard
                  key={card.id}
                  card={card}
                  onDelete={(id) => {
                    setCards((prev) =>
                      prev.filter(
                        (item) => item.id !== id
                      )
                    );

                    setTotal((prev) =>
                      Math.max(0, prev - 1)
                    );
                  }}
                />
              ))}
            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

            <div
              className="
                mt-8
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
                  setFilters({
                    ...filters,
                    page: (filters.page ?? 1) - 1,
                  })
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
                  disabled:hover:border-gray-300
                  disabled:hover:bg-white
                  disabled:hover:text-gray-700

                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-300

                  dark:hover:border-teal-500
                  dark:hover:bg-teal-500
                  dark:hover:text-slate-950

                  dark:disabled:hover:border-slate-700
                  dark:disabled:hover:bg-slate-900
                  dark:disabled:hover:text-slate-300
                "
              >
                <ChevronLeft size={20} />
              </button>

              {/* NEXT */}

              <button
                type="button"
                disabled={filters.page === totalPages}
                onClick={() =>
                  setFilters({
                    ...filters,
                    page: (filters.page ?? 1) + 1,
                  })
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
                  disabled:hover:border-gray-300
                  disabled:hover:bg-white
                  disabled:hover:text-gray-700

                  dark:border-slate-700
                  dark:bg-slate-900
                  dark:text-slate-300

                  dark:hover:border-teal-500
                  dark:hover:bg-teal-500
                  dark:hover:text-slate-950

                  dark:disabled:hover:border-slate-700
                  dark:disabled:hover:bg-slate-900
                  dark:disabled:hover:text-slate-300
                "
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
