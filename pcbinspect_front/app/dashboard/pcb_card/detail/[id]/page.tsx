"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Camera,
  AlertTriangle,
  Cpu,
  Hash,
  CalendarDays,
  FileText,
  Loader2,
} from "lucide-react";

import Header from "@/components/layout/Header";
import { useAuth } from "@/app/context/AuthContext";

/* =========================================================
   TYPES
========================================================= */

interface Zone {
  id?: string;
  nom?: string;
  programmeId?: string;
}

type Jugement = "EN_ATTENTE" | "PASS" | "FAIL";

interface Defaut {
  id?: string;
  defautdetecte?: string;
  jugement?: Jugement;
  zone?: string | Zone;
}

interface Reference {
  jugementOperateurBO?: boolean;
  nom?: string;
  reference?: string;
}

interface Card {
  id: string;

  sn?: string;

  PRF?: string;
  prf?: string;

  dateHeure?: string;
  createdAt?: string;
  date?: string;

  imagePathTop?: string;
  imagePathBottom?: string;

  imageTop?: string;
  imageBottom?: string;

  resultat?: string;

  reference?: Reference;

  defauts?: Defaut[];
}

/* =========================================================
   PAGE
========================================================= */

export default function PcbDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { user } = useAuth();

  /* =======================================================
     STATES
  ======================================================= */

  const [card, setCard] = useState<Card | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [currentImage, setCurrentImage] =
    useState<"TOP" | "BOTTOM">("TOP");

  const [selectedDefaut, setSelectedDefaut] =
    useState<number | null>(null);

  /*
   * Jugements locaux.
   *
   * index -> jugement
   *
   * Exemple :
   * {
   *   0: "FAIL",
   *   1: "PASS"
   * }
   */
  const [judgements, setJudgements] =
    useState<Record<number, Jugement>>({});

  /*
   * Permet d'afficher un loader sur le bouton
   * pendant l'enregistrement.
   */
  const [savingDefaut, setSavingDefaut] =
    useState<number | null>(null);

  /* =======================================================
     CHARGER CARTE
  ======================================================= */

  useEffect(() => {
    if (!id) return;

    const chargerCarte = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:3001/pcb-cards/${id}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Erreur HTTP ${response.status}`
          );
        }

        const data: Card = await response.json();

        console.log(
          "================================="
        );

        console.log(
          "CARTE COMPLETE :",
          data
        );

        console.log(
          "IMAGE TOP :",
          data.imagePathTop
        );

        console.log(
          "IMAGE BOTTOM :",
          data.imagePathBottom
        );

        console.log(
          "DEFAUTS :",
          data.defauts
        );

        console.log(
          "================================="
        );

        setCard(data);

        /*
         * IMPORTANT :
         *
         * On récupère les jugements déjà enregistrés
         * dans la base.
         *
         * Donc après un refresh :
         *
         * FAIL -> boutons cachés
         * PASS -> boutons cachés
         * EN_ATTENTE -> boutons affichés
         */
        const savedJudgements: Record<
          number,
          Jugement
        > = {};

        if (Array.isArray(data.defauts)) {
          data.defauts.forEach(
            (defaut, index) => {
              if (defaut.jugement) {
                savedJudgements[index] =
                  defaut.jugement;
              }
            }
          );
        }

        setJudgements(savedJudgements);

      } catch (err) {
        console.error(
          "Erreur chargement carte :",
          err
        );

        setError(
          "Impossible de charger les informations de la carte."
        );
      } finally {
        setLoading(false);
      }
    };

    chargerCarte();
  }, [id]);

  /* =======================================================
     NETTOYAGE URL IMAGE
  ======================================================= */

  const getImageUrl = (image?: string) => {
    if (!image) {
      return "";
    }

    let cleanImage = image.trim();

    /*
     * URL Markdown
     *
     * [http://localhost:3001/image.jpg](http://localhost:3001/image.jpg)
     */

    const markdownMatch =
      cleanImage.match(
        /^\[([^\]]+)\]\(([^)]+)\)$/
      );

    if (markdownMatch) {
      cleanImage = markdownMatch[2];
    }

    /*
     * Supprimer guillemets
     */

    cleanImage =
      cleanImage.replace(
        /^["']|["']$/g,
        ""
      );

    /*
     * URL complète
     */

    if (
      cleanImage.startsWith("http://") ||
      cleanImage.startsWith("https://")
    ) {
      return cleanImage;
    }

    /*
     * Chemin relatif
     */

    return `http://localhost:3001/${cleanImage.replace(
      /^\/+/,
      ""
    )}`;
  };

  /* =======================================================
     IMAGES
  ======================================================= */

  const imageTop = useMemo(() => {
    if (!card) {
      return "";
    }

    return getImageUrl(
      card.imagePathTop ||
        card.imageTop
    );
  }, [card]);

  const imageBottom = useMemo(() => {
    if (!card) {
      return "";
    }

    return getImageUrl(
      card.imagePathBottom ||
        card.imageBottom
    );
  }, [card]);

  /* =======================================================
     IMAGE COURANTE
  ======================================================= */

  const currentImageUrl =
    currentImage === "TOP"
      ? imageTop
      : imageBottom;

  /* =======================================================
     NAVIGATION IMAGE
  ======================================================= */

  const previousImage = () => {
    setCurrentImage((prev) =>
      prev === "TOP"
        ? "BOTTOM"
        : "TOP"
    );
  };

  const nextImage = () => {
    setCurrentImage((prev) =>
      prev === "TOP"
        ? "BOTTOM"
        : "TOP"
    );
  };

  const selectImage = (
    image: "TOP" | "BOTTOM"
  ) => {
    setCurrentImage(image);
  };

  /* =======================================================
     ENREGISTRER JUGEMENT
  ======================================================= */

  const enregistrerJugement = async (
    index: number,
    jugement: "PASS" | "FAIL"
  ) => {
    if (!card) return;

    const defaut = card.defauts?.[index];

    if (!defaut?.id) {
      console.error(
        "ID du défaut introuvable"
      );

      alert(
        "Impossible d'identifier le défaut."
      );

      return;
    }

    try {
      setSavingDefaut(index);

      /*
       * Enregistrement dans le backend.
       *
       * CONFIRMER -> FAIL
       * REJETER   -> PASS
       */

      const response = await fetch(
        `http://localhost:3001/pcb-cards/defauts/${defaut.id}/jugement`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            jugement,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await response.json().catch(
            () => null
          );

        console.error(
          "Erreur backend :",
          errorData
        );

        throw new Error(
          `Erreur HTTP ${response.status}`
        );
      }

      /*
       * Mise à jour locale.
       *
       * Une fois enregistré :
       * PASS ou FAIL
       *
       * Les boutons ne seront plus affichés.
       */

      setJudgements((prev) => ({
        ...prev,
        [index]: jugement,
      }));

      /*
       * Mise à jour également de card.defauts
       * pour garder l'état synchronisé.
       */

      setCard((prev) => {
        if (!prev) return prev;

        const nouveauxDefauts =
          [...(prev.defauts ?? [])];

        if (nouveauxDefauts[index]) {
          nouveauxDefauts[index] = {
            ...nouveauxDefauts[index],
            jugement,
          };
        }

        return {
          ...prev,
          defauts: nouveauxDefauts,
        };
      });

      /*
       * Désélectionner le défaut.
       */

      setSelectedDefaut(null);

    } catch (err) {
      console.error(
        "Erreur enregistrement jugement :",
        err
      );

      alert(
        "Impossible d'enregistrer le jugement."
      );
    } finally {
      setSavingDefaut(null);
    }
  };

  /* =======================================================
     CONFIRMER
     
     CONFIRMER = FAIL
  ======================================================= */

  const confirmerDefaut = (
    index: number
  ) => {
    enregistrerJugement(
      index,
      "FAIL"
    );
  };

  /* =======================================================
     REJETER
     
     REJETER = PASS
  ======================================================= */

  const rejeterDefaut = (
    index: number
  ) => {
    enregistrerJugement(
      index,
      "PASS"
    );
  };

  /* =======================================================
     DATE
  ======================================================= */

  const formatDate = (
    date?: string
  ) => {
    if (!date) {
      return "-";
    }

    const d = new Date(date);

    if (
      Number.isNaN(
        d.getTime()
      )
    ) {
      return "-";
    }

    return d.toLocaleString(
      "fr-FR",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

        <Header
          user={{
            firstName:
              user?.firstname ?? "",

            lastName:
              user?.lastname ?? "",

            role:
              user?.role ?? "",
          }}
        />

        <div className="flex min-h-[70vh] items-center justify-center">

          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-5 shadow-sm">

            <span className="font-medium text-slate-700 dark:text-slate-300">
              Chargement de l'inspection...
            </span>

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     ERREUR
  ======================================================= */

  if (error || !card) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">

        <Header
          user={{
            firstName:
              user?.firstname ?? "",

            lastName:
              user?.lastname ?? "",

            role:
              user?.role ?? "",
          }}
        />

        <div className="flex min-h-[70vh] items-center justify-center px-6">

          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm">

            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Inspection introuvable
            </h1>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              {error ||
                "Aucune donnée disponible pour cette inspection."}
            </p>

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     DONNEES
  ======================================================= */

  const defauts =
    Array.isArray(card.defauts)
      ? card.defauts
      : [];

  const jugementOperateurBO =
    card.reference
      ?.jugementOperateurBO === true;

  const prf =
    card.PRF ||
    card.prf ||
    "-";

  const sn =
    card.sn ||
    "-";

  const date =
    card.dateHeure ||
    card.createdAt ||
    card.date;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 ">

      {/* =================================================
          HEADER
      ================================================= */}

      <Header
        user={{
          firstName:
            user?.firstname ?? "",

          lastName:
            user?.lastname ?? "",

          role:
            user?.role ?? "",
        }}
      />

      <main className="px-6 py-6 lg:px-8 ">

        {/* =================================================
            TITRE
        ================================================= */}

        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950/50">

              <Cpu
                size={25}
                className="text-teal-600 dark:text-teal-400"
              />

            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
                Détail de l'inspection
              </h1>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Analyse et validation de la carte PCB
              </p>

            </div>

          </div>

          {/* INFORMATIONS RAPIDES */}

          <div className="flex flex-wrap gap-3">

            {/* PRF */}

            <div className="min-w-[120px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 shadow-sm">

              <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                PRF
              </p>

              <p className="truncate font-bold text-slate-900 dark:text-slate-100">
                {prf}
              </p>

            </div>

            {/* SN */}

            <div className="min-w-[120px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 shadow-sm">

              <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                SN
              </p>

              <p className="truncate font-bold text-slate-900 dark:text-slate-100">
                {sn}
              </p>

            </div>

            {/* RESULTAT */}

            <div className="min-w-[120px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 shadow-sm">

              <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Résultat
              </p>

              <p
                className={
                  card.resultat === "GOOD"
                    ? "font-bold text-green-600 dark:text-green-400"
                    : "font-bold text-red-600 dark:text-red-400"
                }
              >
                {card.resultat === "GOOD"
                  ? "GOOD"
                  : "NOT GOOD"}
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            CONTENU PRINCIPAL
        ================================================= */}

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

          {/* =================================================
              GAUCHE
          ================================================= */}

          <div className="space-y-6 xl:col-span-8">

            {/* =================================================
                IMAGES
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-teal-100 dark:bg-teal-950/50 p-2">

                    <Camera
                      size={20}
                      className="text-teal-600 dark:text-teal-400"
                    />

                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Captures de l'inspection
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Visualisation des caméras TOP / BOTTOM
                    </p>

                  </div>

                </div>

                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                  CAMÉRA {currentImage}
                </span>

              </div>

              <div className="p-5">

                {/* IMAGE PRINCIPALE */}

                <div className="relative flex h-[480px] items-center justify-center overflow-hidden rounded-2xl bg-slate-950">

                  {currentImageUrl ? (

                    <img
                      src={currentImageUrl}
                      alt={`Capture ${currentImage}`}
                      className="h-full w-full max-h-full max-w-full object-contain"
                      onError={(event) => {

                        console.error(
                          "ERREUR CHARGEMENT IMAGE :",
                          currentImageUrl
                        );

                        event.currentTarget.style.display =
                          "none";
                      }}
                    />

                  ) : (

                    <div className="text-sm text-slate-400 dark:text-slate-500">
                      Aucune capture disponible
                    </div>

                  )}

                  {/* FLECHE GAUCHE */}

                  <button
                    type="button"
                    onClick={previousImage}
                    className="
                      absolute
                      left-4
                      top-1/2
                      flex
                      h-11
                      w-11
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      bg-white dark:bg-slate-900/90
                      text-slate-800 dark:text-slate-200
                      shadow-lg
                      transition
                      hover:bg-teal-50 dark:bg-teal-950/400
                      hover:text-white
                    "
                    aria-label="Image précédente"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  {/* FLECHE DROITE */}

                  <button
                    type="button"
                    onClick={nextImage}
                    className="
                      absolute
                      right-4
                      top-1/2
                      flex
                      h-11
                      w-11
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      bg-white dark:bg-slate-900/90
                      text-slate-800 dark:text-slate-200
                      shadow-lg
                      transition
                      hover:bg-teal-50 dark:bg-teal-950/400
                      hover:text-white
                    "
                    aria-label="Image suivante"
                  >
                    <ChevronRight size={24} />
                  </button>

                  {/* LABEL */}

                  <div className="absolute left-4 top-4">

                    <span className="rounded-lg bg-black/70 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                      CAMÉRA {currentImage}
                    </span>

                  </div>

                </div>

                {/* MINIATURES */}

                <div className="mt-4 grid grid-cols-2 gap-4">

                  {/* TOP */}

                  <button
                    type="button"
                    onClick={() =>
                      selectImage("TOP")
                    }
                    className={`
                      relative
                      overflow-hidden
                      rounded-xl
                      border-2
                      transition
                      ${
                        currentImage === "TOP"
                          ? "border-teal-500 ring-2 ring-teal-100 dark:ring-teal-900/60"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }
                    `}
                  >

                    {imageTop ? (

                      <img
                        src={imageTop}
                        alt="Miniature TOP"
                        className={`
                          h-28
                          w-full
                          object-cover
                          transition
                          ${
                            currentImage === "BOTTOM"
                              ? "blur-[2px] opacity-60"
                              : ""
                          }
                        `}
                      />

                    ) : (

                      <div className="flex h-28 w-full items-center justify-center bg-slate-100 dark:bg-slate-800 text-xs text-slate-400 dark:text-slate-500">
                        Aucune image
                      </div>

                    )}

                    <div className="absolute inset-x-0 bottom-0">

                      <div className="w-full bg-black/60 px-3 py-2 text-left text-xs font-bold text-white">
                        CAMÉRA TOP
                      </div>

                    </div>

                  </button>

                  {/* BOTTOM */}

                  <button
                    type="button"
                    onClick={() =>
                      selectImage("BOTTOM")
                    }
                    className={`
                      relative
                      overflow-hidden
                      rounded-xl
                      border-2
                      transition
                      ${
                        currentImage === "BOTTOM"
                          ? "border-teal-500 ring-2 ring-teal-100 dark:ring-teal-900/60"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }
                    `}
                  >

                    {imageBottom ? (

                      <img
                        src={imageBottom}
                        alt="Miniature BOTTOM"
                        className={`
                          h-28
                          w-full
                          object-cover
                          transition
                          ${
                            currentImage === "TOP"
                              ? "blur-[2px] opacity-60"
                              : ""
                          }
                        `}
                      />

                    ) : (

                      <div className="flex h-28 w-full items-center justify-center bg-slate-100 dark:bg-slate-800 text-xs text-slate-400 dark:text-slate-500">
                        Aucune image
                      </div>

                    )}

                    <div className="absolute inset-x-0 bottom-0">

                      <div className="w-full bg-black/60 px-3 py-2 text-left text-xs font-bold text-white">
                        CAMÉRA BOTTOM
                      </div>

                    </div>

                  </button>

                </div>

              </div>

            </div>

            {/* =================================================
                INFORMATIONS INSPECTION
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">

              <div className="border-b border-slate-100 dark:border-slate-800 px-5 py-4">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-blue-100 dark:bg-blue-950/50 p-2">

                    <FileText
                      size={20}
                      className="text-blue-600 dark:text-blue-400"
                    />

                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Informations de l'inspection
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Données enregistrées
                    </p>

                  </div>

                </div>

              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">

                {/* SN */}

                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4">

                  <div className="mb-2 flex items-center gap-2 text-slate-400 dark:text-slate-500">

                    <Hash size={15} />

                    <span className="text-xs uppercase">
                      Numéro de série
                    </span>

                  </div>

                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {sn}
                  </p>

                </div>

                {/* PRF */}

                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4">

                  <div className="mb-2 flex items-center gap-2 text-slate-400 dark:text-slate-500">

                    <Hash size={15} />

                    <span className="text-xs uppercase">
                      PRF
                    </span>

                  </div>

                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {prf}
                  </p>

                </div>

                {/* DATE */}

                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4">

                  <div className="mb-2 flex items-center gap-2 text-slate-400 dark:text-slate-500">

                    <CalendarDays size={15} />

                    <span className="text-xs uppercase">
                      Date
                    </span>

                  </div>

                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {formatDate(date)}
                  </p>

                </div>

                {/* REFERENCE */}

                {card.reference?.nom && (

                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4">

                    <div className="mb-2 flex items-center gap-2 text-slate-400 dark:text-slate-500">

                      <FileText size={15} />

                      <span className="text-xs uppercase">
                        Référence
                      </span>

                    </div>

                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {card.reference.nom}
                    </p>

                  </div>

                )}

                {/* DEFAUTS */}

                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4">

                  <div className="mb-2 flex items-center gap-2 text-slate-400 dark:text-slate-500">

                    <AlertTriangle size={15} />

                    <span className="text-xs uppercase">
                      Défauts
                    </span>

                  </div>

                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    {defauts.length}
                  </p>

                </div>

                {/* JUGEMENT BO */}

                <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4">

                  <div className="mb-2 flex items-center gap-2 text-slate-400 dark:text-slate-500">

                    <CheckCircle size={15} />

                    <span className="text-xs uppercase">
                      Jugement opérateur
                    </span>

                  </div>

                  <p
                    className={
                      jugementOperateurBO
                        ? "font-bold text-green-600 dark:text-green-400"
                        : "font-bold text-slate-500 dark:text-slate-400"
                    }
                  >
                    {jugementOperateurBO
                      ? "Activé"
                      : "Désactivé"}
                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              DROITE
          ================================================= */}

          <div className="space-y-6 xl:col-span-4">

            {/* =================================================
                DEFAUTS
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">

                <div className="flex items-center gap-3">

                  <div className="rounded-lg bg-orange-100 dark:bg-orange-950/50 p-2">

                    <AlertTriangle
                      size={20}
                      className="text-orange-600 dark:text-orange-400"
                    />

                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Défauts détectés
                    </h2>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Analyse des anomalies
                    </p>

                  </div>

                </div>

                <span className="rounded-full bg-orange-100 dark:bg-orange-950/50 px-3 py-1 text-xs font-bold text-orange-700 dark:text-orange-300">
                  {defauts.length}
                </span>

              </div>

              <div className="p-4">

                {defauts.length === 0 ? (

                  <div className="py-8 text-center">

                    <CheckCircle
                      size={40}
                      className="mx-auto mb-3 text-green-500"
                    />

                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Aucun défaut détecté
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      La carte semble conforme.
                    </p>

                  </div>

                ) : (

                  <div className="max-h-[600px] space-y-3 overflow-y-auto pr-1">

                    {defauts.map(
                      (defaut, index) => {

                       
                        const judgement =
                          judgements[index] ??
                          defaut.jugement ??
                          "EN_ATTENTE";

                        const isSelected =
                          selectedDefaut === index;

                        /*
                         * IMPORTANT :
                         *
                         * Si PASS ou FAIL :
                         * les boutons ne sont plus affichés.
                         */

                        const isAlreadyJudged =
                          judgement === "PASS" ||
                          judgement === "FAIL";

                        const isSaving =
                          savingDefaut === index;

                        return (

                          <div
                            key={
                              defaut.id ??
                              index
                            }
                            onClick={() =>
                              setSelectedDefaut(
                                index
                              )
                            }
                            className={`
                              cursor-pointer
                              rounded-xl
                              border
                              p-4
                              transition
                              ${
                                isSelected
                                  ? "border-teal-400 dark:border-teal-500 bg-teal-50 dark:bg-teal-950/40"
                                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-white dark:hover:bg-slate-800 dark:bg-slate-900"
                              }
                            `}
                          >

                            {/* HEADER DEFAUT */}

                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0">

                                <p className="font-bold text-slate-900 dark:text-slate-100">
                                  Défaut #{index + 1}
                                </p>

                                {defaut.defautdetecte && (

                                  <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                                    {defaut.defautdetecte}
                                  </p>

                                )}

                              </div>

                              {/* STATUT */}

                              {isAlreadyJudged && (

                                <span
                                  className={`
                                    rounded-full
                                    px-2.5
                                    py-1
                                    text-xs
                                    font-bold
                                    ${
                                      judgement ===
                                      "FAIL"
                                        ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300"
                                        : "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300"
                                    }
                                  `}
                                >
                                  {judgement ===
                                  "FAIL"
                                    ? "FAIL"
                                    : "PASS"}
                                </span>

                              )}

                            </div>

                            {/* ZONE */}

                            {defaut.zone && (

                              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">

                                Zone :{" "}

                                <span className="font-semibold text-slate-700 dark:text-slate-300">

                                  {typeof defaut.zone ===
                                  "object"
                                    ? defaut.zone.nom ||
                                      "-"
                                    : defaut.zone}

                                </span>

                              </p>

                            )}

                            {/* =================================================
                                BOUTONS
                                
                                Ils apparaissent uniquement si :
                                
                                - jugement BO activé
                                - jugement EN_ATTENTE
                                - pas en cours de sauvegarde
                            ================================================= */}

                            {jugementOperateurBO &&
                              !isAlreadyJudged && (

                                <div className="mt-4 flex gap-2">

                                  {/* CONFIRMER -> FAIL */}

                                  <button
                                    type="button"
                                    disabled={
                                      isSaving
                                    }
                                    onClick={(e) => {

                                      e.stopPropagation();

                                      confirmerDefaut(
                                        index
                                      );

                                    }}
                                    className="
                                      flex
                                      flex-1
                                      items-center
                                      justify-center
                                      gap-2
                                      rounded-lg
                                      border
                                      border-green-300 dark:border-green-700
                                      bg-green-50 dark:bg-green-950/40
                                      py-2
                                      text-xs
                                      font-semibold
                                      text-green-700 dark:text-green-300
                                      transition
                                      hover:bg-green-100 dark:hover:bg-green-900/40 dark:bg-green-950/50
                                      disabled:cursor-not-allowed
                                      disabled:opacity-50
                                    "
                                  >

                                    {isSaving ? (

                                      <Loader2
                                        size={15}
                                        className="animate-spin"
                                      />

                                    ) : (

                                      <CheckCircle
                                        size={15}
                                      />

                                    )}

                                    Confirmer

                                  </button>

                                  {/* REJETER -> PASS */}

                                  <button
                                    type="button"
                                    disabled={
                                      isSaving
                                    }
                                    onClick={(e) => {

                                      e.stopPropagation();

                                      rejeterDefaut(
                                        index
                                      );

                                    }}
                                    className="
                                      flex
                                      flex-1
                                      items-center
                                      justify-center
                                      gap-2
                                      rounded-lg
                                      border
                                      border-red-300 dark:border-red-700
                                      bg-red-50 dark:bg-red-950/40
                                      py-2
                                      text-xs
                                      font-semibold
                                      text-red-700 dark:text-red-300
                                      transition
                                      hover:bg-red-100 dark:hover:bg-red-900/40 dark:bg-red-950/50
                                      disabled:cursor-not-allowed
                                      disabled:opacity-50
                                    "
                                  >

                                    {isSaving ? (

                                      <Loader2
                                        size={15}
                                        className="animate-spin"
                                      />

                                    ) : (

                                      <XCircle
                                        size={15}
                                      />

                                    )}

                                    Rejeter

                                  </button>

                                </div>

                              )}

                            {/* =================================================
                                MESSAGE APRES JUGEMENT
                            ================================================= */}

                            {isAlreadyJudged && (

                              <div
                                className={`
                                  mt-4
                                  rounded-lg
                                  border
                                  px-3
                                  py-2
                                  text-xs
                                  font-medium
                                  ${
                                    judgement ===
                                    "FAIL"
                                      ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300"
                                      : "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300"
                                  }
                                `}
                              >

                                {judgement ===
                                "FAIL"
                                  ? "Défaut confirmé : FAIL"
                                  : "Défaut rejeté : PASS"}

                              </div>

                            )}

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </div>

            </div>

            {/* =================================================
                MESSAGE SI JUGEMENT DESACTIVE
            ================================================= */}

            {!jugementOperateurBO && (

              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-5">

                <div className="flex items-start gap-3">

                  <div className="rounded-lg bg-slate-200 dark:bg-slate-700 p-2">

                    <FileText
                      size={18}
                      className="text-slate-500 dark:text-slate-400"
                    />

                  </div>

                  <div>

                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Jugement opérateur désactivé
                    </p>

                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Aucun jugement manuel n'est requis
                      pour cette inspection.
                    </p>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}