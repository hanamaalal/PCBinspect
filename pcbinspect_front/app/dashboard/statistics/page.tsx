
"use client";

import { useEffect, useMemo, useState } from "react";

import Header from "@/components/layout/Header";

import {
  Filter,
  RotateCcw,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ClipboardList,
} from "lucide-react";

import {
  getCurrentUser,
  getStatistiques,
} from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ParetoItem {
  nom: string;
  count: number;
}

interface StatistiquesResponse {
  firstPassYield: number;
  tempsMoyenInspection: number;
  tauxDefauts: number;
  tauxConformite: number;
  nombreTotalInspections: number;
  nombreTotalDefauts: number;
  pareto: ParetoItem[];
}

export default function StatisticsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const [stats, setStats] =
    useState<StatistiquesResponse | null>(null);

  const [champ, setChamp] = useState("");
  const [valeur, setValeur] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    loadUser();
    loadStats();
  }, []);

  async function loadUser() {
    try {
      const data = await getCurrentUser();
      setUser(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function loadStats() {
    console.log("Filtres envoyés :", {
      champ,
      valeur,
      date,
    });

    setLoading(true);

    try {
      const params: any = {};

      if (champ) {
        params.champ = champ;
      }

      if (champ !== "DATE" && valeur) {
        params.valeur = valeur;
      }

      if (champ === "DATE" && date) {
        params.date = date;
      }

      console.log("Filtres envoyés :", params);

      const data = await getStatistiques(params);

      console.log("Résultat statistiques :", data);

      setStats(data);
    } catch (error) {
      console.error("Erreur statistiques", error);
    } finally {
      setLoading(false);
    }
  }

  const paretoSorted = useMemo(() => {
    if (!stats?.pareto) return [];

    return [...stats.pareto]
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [stats]);

  useEffect(() => {
    console.log("champ actuel :", champ);
  }, [champ]);

  function resetFiltres() {
    setChamp("");
    setValeur("");
    setDate("");

    getStatistiques({}).then(setStats);

    setTimeout(() => {
      getStatistiques({}).then(setStats);
    }, 100);
  }

  if (!stats) {
    return (
      <>
        <Header
          user={{
            firstName: user?.firstname ?? "",
            lastName: user?.lastname ?? "",
            role: user?.role ?? "",
          }}
        />

        <main
          className="
            flex
            min-h-[80vh]
            items-center
            justify-center
            bg-gray-50
            transition-colors
            duration-300
            dark:bg-slate-950
          "
        >
          <p className="text-gray-500 dark:text-slate-400">
            Chargement des statistiques...
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      {/* HEADER */}

      <Header
        user={{
          firstName: user?.firstname ?? "",
          lastName: user?.lastname ?? "",
          role: user?.role ?? "",
        }}
      />

      {/* CONTENU */}

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
        {/* TITRE */}

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
            Statistiques
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
              dark:text-slate-400
            "
          >
            Analyse des inspections et des défauts
          </p>
        </div>

        {/* FILTRES */}

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
              Filtres
            </h2>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
              lg:grid-cols-4
              lg:items-end
            "
          >
            {/* CHAMP */}

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
                Champ
              </label>

              <Select
                value={champ || undefined}
                onSelectionChange={(value) => {
                  const selected = String(value);

                  console.log(
                    "CHAMP CHOISI :",
                    selected
                  );

                  setChamp(selected);
                  setValeur("");
                  setDate("");
                }}
              >
                <SelectTrigger
                  aria-label="Champ"
                  className="
                    h-10
                    w-80
                    w-sm-full
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
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>

                <SelectContent
                  className="
                    border-gray-200
                    bg-white

                    dark:border-slate-700
                    dark:bg-slate-900
                    dark:text-white
                  "
                >
                  <SelectItem
                    id="DATE"
                    className="
                      data-focused:!bg-teal-500
                      data-focused:!text-white
                      dark:text-slate-200
                    "
                  >
                    DATE
                  </SelectItem>

                  <SelectItem
                    id="OF"
                    className="
                      data-focused:!bg-teal-500
                      data-focused:!text-white
                      dark:text-slate-200
                    "
                  >
                    OF
                  </SelectItem>

                  <SelectItem
                    id="PRF"
                    className="
                      data-focused:!bg-teal-500
                      data-focused:!text-white
                      dark:text-slate-200
                    "
                  >
                    PRF
                  </SelectItem>

                  <SelectItem
                    id="SN"
                    className="
                      data-focused:!bg-teal-500
                      data-focused:!text-white
                      dark:text-slate-200
                    "
                  >
                    SN
                  </SelectItem>

                  <SelectItem
                    id="PROGRAMME"
                    className="
                      data-focused:!bg-teal-500
                      data-focused:!text-white
                      dark:text-slate-200
                    "
                  >
                    Programme
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* VALEUR */}

            {champ === "DATE" ? (
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

                <Input
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                  className="
                    h-10
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    text-sm
                    text-gray-900

                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-white
                    dark:[color-scheme:dark]
                  "
                />
              </div>
            ) : (
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
                  Valeur
                </label>

                <Input
                  value={valeur}
                  onChange={(e) =>
                    setValeur(e.target.value)
                  }
                  placeholder="Valeur"
                  className="
                    h-10
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    text-sm
                    text-gray-900

                    placeholder:text-gray-400

                    dark:border-slate-700
                    dark:bg-slate-800
                    dark:text-white
                    dark:placeholder:text-slate-500
                  "
                />
              </div>
            )}

            {/* FILTRER */}

            <div className="flex flex-col">
              <label
                className="
                  mb-1.5
                  select-none
                  text-xs
                  font-medium
                  text-transparent
                "
              >
                Action
              </label>

              <Button
                onClick={loadStats}
                disabled={loading}
                className="
                  h-10
                  w-full
                  rounded-lg
                  bg-gray-900
                  text-white
                  shadow-sm
                  transition-all
                  duration-200

                  hover:bg-gray-800

                  dark:bg-teal-500
                  dark:text-slate-950
                  dark:hover:bg-teal-400
                "
              >
                <Filter className="mr-2 h-4 w-4" />

                {loading
                  ? "Chargement..."
                  : "Filtrer"}
              </Button>
            </div>

            {/* RESET */}

            <div className="flex flex-col">
              <label
                className="
                  mb-1.5
                  select-none
                  text-xs
                  font-medium
                  text-transparent
                "
              >
                Action
              </label>

              <Button
                onClick={resetFiltres}
                variant="outline"
                className="
                  h-10
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
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
              >
                <RotateCcw className="mr-2 h-4 w-4" />

                Réinitialiser
              </Button>
            </div>
          </div>
        </section>

        {/* KPI */}

        <div
          className="
            mb-8
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            lg:grid-cols-5
          "
        >
          {/* FPY */}

          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-4
              shadow-sm
              transition-colors
              duration-300

              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-200

                  dark:bg-slate-800
                "
              >
                <CheckCircle2
                  className="
                    h-4
                    w-4
                    text-gray-600
                    dark:text-teal-300
                  "
                />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    text-gray-500
                    dark:text-slate-400
                  "
                >
                  FPY
                </p>

                <p
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  {stats.firstPassYield}%
                </p>
              </div>
            </div>
          </div>

          {/* TEMPS MOYEN */}

          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-4
              shadow-sm
              transition-colors
              duration-300

              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-200

                  dark:bg-slate-800
                "
              >
                <Clock3
                  className="
                    h-4
                    w-4
                    text-gray-600
                    dark:text-teal-300
                  "
                />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    text-gray-500
                    dark:text-slate-400
                  "
                >
                  Temps moyen
                </p>

                <p
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  {stats.tempsMoyenInspection}s
                </p>
              </div>
            </div>
          </div>

          {/* DEFAUTS */}

          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-4
              shadow-sm
              transition-colors
              duration-300

              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-200

                  dark:bg-slate-800
                "
              >
                <AlertTriangle
                  className="
                    h-4
                    w-4
                    text-gray-600
                    dark:text-teal-300
                  "
                />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    text-gray-500
                    dark:text-slate-400
                  "
                >
                  Taux défauts
                </p>

                <p
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  {stats.tauxDefauts}%
                </p>
              </div>
            </div>
          </div>

          {/* CONFORMITE */}

          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-4
              shadow-sm
              transition-colors
              duration-300

              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-200

                  dark:bg-slate-800
                "
              >
                <ShieldCheck
                  className="
                    h-4
                    w-4
                    text-gray-600
                    dark:text-teal-300
                  "
                />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    text-gray-500
                    dark:text-slate-400
                  "
                >
                  Conformité
                </p>

                <p
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  {stats.tauxConformite}%
                </p>
              </div>
            </div>
          </div>

          {/* NOMBRE INSPECTIONS */}

          <div
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-4
              shadow-sm
              transition-colors
              duration-300

              dark:border-slate-800
              dark:bg-slate-900
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-gray-200

                  dark:bg-slate-800
                "
              >
                <ClipboardList
                  className="
                    h-4
                    w-4
                    text-gray-600
                    dark:text-teal-300
                  "
                />
              </div>

              <div>
                <p
                  className="
                    text-xs
                    text-gray-500
                    dark:text-slate-400
                  "
                >
                  Nombre inspections
                </p>

                <p
                  className="
                    text-xl
                    font-bold
                    text-gray-900
                    dark:text-white
                  "
                >
                  {stats.nombreTotalInspections}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PARETO + ORDRE APPARITION */}

        <section
          className="
            grid
            grid-cols-1
            gap-8
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-6
            shadow-sm
            transition-colors
            duration-300

            dark:border-slate-800
            dark:bg-slate-900

            lg:grid-cols-4
          "
        >
          {/* GRAPH PARETO */}

          <div className="col-span-3">
            <h2
              className="
                mb-6
                text-2xl
                font-bold
                text-gray-900
                dark:text-white
              "
            >
              Diagramme de Pareto des Défauts
            </h2>

            <div
              className="
                flex
                h-[330px]
                items-end
                gap-6
                overflow-x-auto
                px-5
              "
            >
              {paretoSorted.map((item, index) => {
                const max =
                  paretoSorted[0]?.count || 1;

                const height =
                  (item.count / max) * 250;

                return (
                  <div
                    key={index}
                    className="
                      flex
                      h-full
                      flex-col
                      items-center
                      justify-end
                    "
                  >
                    <div
                      className={`
                        w-[60px]
                        rounded-t-sm
                        ${
                          index === 0
                            ? "bg-teal-500"
                            : "bg-gray-300 dark:bg-slate-700"
                        }
                      `}
                      style={{
                        height: `${height}px`,
                      }}
                    />

                    <span
                      className="
                        mt-3
                        w-[80px]
                        break-words
                        text-center
                        text-sm
                        text-gray-600
                        dark:text-slate-300
                      "
                    >
                      {item.nom}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ORDRE APPARITION */}

          <div
            className="
              border-l
              border-gray-200
              pl-8

              dark:border-slate-700
            "
          >
            <h3
              className="
                mb-6
                text-lg
                font-semibold
                text-gray-600
                dark:text-slate-200
              "
            >
              Ordre d'Apparition
            </h3>

            <div className="relative">
              <div
                className="
                  absolute
                  bottom-0
                  left-5
                  top-0
                  w-px
                  bg-gray-400

                  dark:bg-slate-600
                "
              />

              {paretoSorted.map((item, index) => (
                <div
                  key={index}
                  className="
                    relative
                    mb-5
                    flex
                    items-center
                    gap-5
                  "
                >
                  <div
                    className="
                      z-10
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      bg-gray-200
                      font-bold
                      text-gray-900

                      dark:bg-slate-700
                      dark:text-white
                    "
                  >
                    {item.count}
                  </div>

                  <div
                    className="
                      text-sm
                      text-gray-600
                      dark:text-slate-300
                    "
                  >
                    {item.nom}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
