"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Upload,
  X,
  ChevronDown,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";

import Header from "@/components/layout/Header";

import {
  getCurrentUser,
  getReferences,
  getProgramme,
  getCarteModeles,
  createCarteModele,
  deleteCarteModele,
} from "@/lib/api";

/* =========================================================
   TYPES
========================================================= */

type User = {
  firstname?: string;
  lastname?: string;
  role?: string;
};

type Reference = {
  id: string;
  PRF: string;
};

type Zone = {
  id: string;
  nom: string;
};

type DefautForm = {
  id: string;
  defautAttendu: string;
  zoneId: string;
  zoneNom: string;
};

type CarteModele = {
  id: string;
  sn: string;
  PRF: string;

  defautAttendu: {
    id: string;
    defautAttendu: string;
    zone: {
      id: string;
      nom: string;
    };
  }[];
};

/* =========================================================
   TYPE NOTIFICATION
========================================================= */

type NotificationType = "error" | "success" | "warning";

type Notification = {
  type: NotificationType;
  message: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function TeachingPage() {
  /* =======================================================
     USER
  ======================================================= */

  const [user, setUser] = useState<User | null>(null);

  /* =======================================================
     DONNEES
  ======================================================= */

  const [references, setReferences] = useState<Reference[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [cartes, setCartes] = useState<CarteModele[]>([]);

  /* =======================================================
     PRF
  ======================================================= */

  const [PRF, setPRF] = useState("");
  const [loadingPRF, setLoadingPRF] = useState(false);

  /* =======================================================
     SN
  ======================================================= */

  const [SN, setSN] = useState("");

  /* =======================================================
     DEFAUTS
  ======================================================= */

  const [zoneId, setZoneId] = useState("");
  const [defaut, setDefaut] = useState("");
  const [defauts, setDefauts] = useState<DefautForm[]>([]);

  /* =======================================================
     IMAGE
  ======================================================= */

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] = useState(false);

  /* =======================================================
     NOTIFICATION
  ======================================================= */

  const [notification, setNotification] =
    useState<Notification | null>(null);

  /* =======================================================
     POPUP SUPPRESSION
  ======================================================= */

  const [carteASupprimer, setCarteASupprimer] =
    useState<CarteModele | null>(null);

  const [suppressionLoading, setSuppressionLoading] =
    useState(false);

  const [suppressionError, setSuppressionError] =
    useState("");

  /* =======================================================
     INITIALISATION
  ======================================================= */

  useEffect(() => {
    chargerDonnees();
  }, []);

  /* =======================================================
     NOTIFICATION
  ======================================================= */

  function afficherNotification(
    type: NotificationType,
    message: string
  ) {
    setNotification({
      type,
      message,
    });

    window.setTimeout(() => {
      setNotification(null);
    }, 5000);
  }

  function fermerNotification() {
    setNotification(null);
  }

  /* =======================================================
     CHARGEMENT DONNEES
  ======================================================= */

  async function chargerDonnees() {
    try {
      const [currentUser, refs, cartesData] =
        await Promise.all([
          getCurrentUser(),
          getReferences(),
          getCarteModeles(),
        ]);

      setUser(currentUser);
      setReferences(refs || []);
      setCartes(cartesData || []);
    } catch (error) {
      console.error(
        "Erreur chargement des données :",
        error
      );

      afficherNotification(
        "error",
        "Impossible de charger les données."
      );
    }
  }

  /* =======================================================
     PRF
  ======================================================= */

  async function handlePRFChange(value: string) {
    setPRF(value);

    setZones([]);
    setZoneId("");
    setDefaut("");
    setDefauts([]);

    if (!value) {
      return;
    }

    try {
      setLoadingPRF(true);

      const programme = await getProgramme(value);

      setZones(programme?.zones || []);
    } catch (error: any) {
      console.error(
        "Erreur chargement programme :",
        error
      );

      const message =
        error?.response?.data?.message;

      if (Array.isArray(message)) {
        afficherNotification(
          "error",
          message.join("\n")
        );
      } else {
        afficherNotification(
          "error",
          message ||
            "Impossible de charger le programme pour ce PRF."
        );
      }

      setZones([]);
    } finally {
      setLoadingPRF(false);
    }
  }

  /* =======================================================
     DEFAUT
  ======================================================= */

  function ajouterDefaut() {
    if (!PRF) {
      afficherNotification(
        "warning",
        "Veuillez sélectionner un PRF."
      );
      return;
    }

    if (!zoneId) {
      afficherNotification(
        "warning",
        "Veuillez sélectionner une zone."
      );
      return;
    }

    if (!defaut.trim()) {
      afficherNotification(
        "warning",
        "Veuillez saisir un défaut."
      );
      return;
    }

    const zone = zones.find(
      (item) => item.id === zoneId
    );

    if (!zone) {
      afficherNotification(
        "error",
        "La zone sélectionnée est introuvable."
      );
      return;
    }

    setDefauts((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        defautAttendu: defaut.trim(),
        zoneId: zone.id,
        zoneNom: zone.nom,
      },
    ]);

    setDefaut("");
    setZoneId("");
  }

  function supprimerDefaut(id: string) {
    setDefauts((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  /* =======================================================
     IMAGE
  ======================================================= */

  function handleImage(file?: File) {
    if (!file) {
      return;
    }

    const formatsAcceptes = [
      "image/png",
      "image/jpeg",
      "image/webp",
    ];

    if (!formatsAcceptes.includes(file.type)) {
      afficherNotification(
        "warning",
        "Format accepté : PNG, JPG ou WEBP."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      afficherNotification(
        "warning",
        "L'image ne doit pas dépasser 5 Mo."
      );
      return;
    }

    setImage(file);

    const preview = URL.createObjectURL(file);

    setImagePreview(preview);
  }

  function supprimerImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImage(null);
    setImagePreview("");
  }

  /* =======================================================
     ENREGISTREMENT
  ======================================================= */

  async function enregistrer() {
    setNotification(null);

    if (!PRF) {
      afficherNotification(
        "warning",
        "Veuillez sélectionner un PRF."
      );
      return;
    }

    if (!SN.trim()) {
      afficherNotification(
        "warning",
        "Veuillez saisir un SN."
      );
      return;
    }

    if (defauts.length === 0) {
      afficherNotification(
        "warning",
        "Veuillez ajouter au moins un défaut."
      );
      return;
    }

    try {
      setLoading(true);

      const defautsDTO = defauts.map((item) => ({
        defautAttendu: item.defautAttendu,
        zoneId: item.zoneId,
      }));

      console.log(
        "DEFAUTS ENVOYES :",
        defautsDTO
      );

      await createCarteModele({
        sn: SN.trim(),
        PRF: PRF,
        defautAttendu: defautsDTO,
        image: image,
      });

      /* ===================================================
         SUCCES
      =================================================== */

      afficherNotification(
        "success",
        "Carte modèle créée avec succès."
      );

      /* ===================================================
         RESET
      =================================================== */

      setSN("");

      setDefauts([]);
      setZoneId("");
      setDefaut("");

      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }

      setImage(null);
      setImagePreview("");

      /* ===================================================
         RECHARGEMENT CARTES
      =================================================== */

      const nouvellesCartes =
        await getCarteModeles();

      setCartes(nouvellesCartes || []);
    } catch (error: any) {
      console.error(
        "Erreur création carte modèle :",
        error
      );

      const message =
        error?.response?.data?.message;

      if (Array.isArray(message)) {
        afficherNotification(
          "error",
          message.join("\n")
        );
      } else {
        afficherNotification(
          "error",
          message ||
            error?.message ||
            "Erreur lors de l'enregistrement de la carte modèle."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  /* =======================================================
     DEMANDER SUPPRESSION
  ======================================================= */

  function demanderSuppression(
    carte: CarteModele
  ) {
    setSuppressionError("");
    setCarteASupprimer(carte);
  }

  /* =======================================================
     CONFIRMER SUPPRESSION
  ======================================================= */

  async function confirmerSuppression() {
    if (!carteASupprimer) {
      return;
    }

    try {
      setSuppressionLoading(true);
      setSuppressionError("");

      await deleteCarteModele(
        carteASupprimer.id
      );

      setCartes((previous) =>
        previous.filter(
          (item) =>
            item.id !== carteASupprimer.id
        )
      );

      setCarteASupprimer(null);

      afficherNotification(
        "success",
        "Carte modèle supprimée avec succès."
      );
    } catch (error: any) {
      console.error(
        "Erreur suppression :",
        error
      );

      const message =
        error?.response?.data?.message;

      if (Array.isArray(message)) {
        setSuppressionError(
          message.join("\n")
        );
      } else {
        setSuppressionError(
          message ||
            error?.message ||
            "Erreur lors de la suppression."
        );
      }
    } finally {
      setSuppressionLoading(false);
    }
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-slate-50
        text-slate-900

        dark:bg-slate-950
        dark:text-white

        transition-colors
        duration-200
      "
    >
      {/* ===================================================
          NOTIFICATION
      =================================================== */}

      {notification && (
        <div
          className="
            fixed
            top-5
            right-5
            z-[100]

            w-[min(420px,calc(100vw-32px))]

            rounded-xl
            border

            shadow-lg

            px-4
            py-3
          "
          style={{
            backgroundColor:
              notification.type === "error"
                ? "rgb(254 242 242)"
                : notification.type === "success"
                ? "rgb(240 253 244)"
                : "rgb(255 251 235)",
            borderColor:
              notification.type === "error"
                ? "rgb(254 202 202)"
                : notification.type === "success"
                ? "rgb(187 247 208)"
                : "rgb(253 230 138)",
          }}
        >
          <div className="flex items-start gap-3">
            {notification.type === "error" && (
              <AlertCircle
                size={20}
                className="
                  shrink-0
                  text-red-500
                  mt-0.5
                "
              />
            )}

            {notification.type === "success" && (
              <CheckCircle2
                size={20}
                className="
                  shrink-0
                  text-green-600
                  mt-0.5
                "
              />
            )}

            {notification.type === "warning" && (
              <Info
                size={20}
                className="
                  shrink-0
                  text-amber-500
                  mt-0.5
                "
              />
            )}

            <div className="min-w-0 flex-1">
              <p
                className={`
                  text-sm
                  font-semibold
                  ${
                    notification.type === "error"
                      ? "text-red-700"
                      : notification.type ===
                        "success"
                      ? "text-green-700"
                      : "text-amber-700"
                  }
                `}
              >
                {notification.type === "error"
                  ? "Erreur"
                  : notification.type === "success"
                  ? "Succès"
                  : "Attention"}
              </p>

              <p
                className={`
                  mt-1
                  text-xs
                  whitespace-pre-line
                  ${
                    notification.type === "error"
                      ? "text-red-600"
                      : notification.type ===
                        "success"
                      ? "text-green-600"
                      : "text-amber-600"
                  }
                `}
              >
                {notification.message}
              </p>
            </div>

            <button
              type="button"
              onClick={fermerNotification}
              className="
                shrink-0
                text-slate-400
                hover:text-teal-500
                transition
              "
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================
          HEADER
      =================================================== */}

      <Header
        user={{
          firstName: user?.firstname ?? "",
          lastName: user?.lastname ?? "",
          role: user?.role ?? "",
        }}
      />

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="px-8 py-7">
        {/* =================================================
            TITLE
        ================================================= */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-start
            md:justify-between
            gap-4
            mb-7
          "
        >
          <div>
            <h1
              className="
                text-3xl
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              Teaching offline
            </h1>

            <p
              className="
                text-sm
                text-slate-500
                dark:text-slate-400
                mt-2
              "
            >
              Configurez les cartes modèles,
              les numéros de série et les défauts
              attendus par zone.
            </p>
          </div>

          <div
            className="
              text-left
              md:text-right

              bg-white
              dark:bg-slate-900

              border
              border-slate-200
              dark:border-slate-800

              rounded-xl
              px-5
              py-3
            "
          >
            <div
              className="
                text-xs
                text-slate-500
                dark:text-slate-500
              "
            >
              Cartes configurées
            </div>

            <div
              className="
                text-2xl
                font-bold
                text-slate-900
                dark:text-white
                mt-1
              "
            >
              {cartes.length}
            </div>
          </div>
        </div>

        {/* =================================================
            FORMULAIRE PRINCIPAL
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            xl:grid-cols-[1fr_1.4fr_1fr]
            gap-5
          "
        >
          {/* ===============================================
              COLONNE 1
          =============================================== */}

          <section
            className="
              bg-white
              dark:bg-slate-900

              border
              border-slate-200
              dark:border-slate-800

              rounded-xl
              p-5

              shadow-sm
              dark:shadow-none
            "
          >
            <h2
              className="
                text-sm
                font-semibold
                text-slate-900
                dark:text-white
                mb-5
              "
            >
              Carte modèle
            </h2>

            {/* PRF */}

            <label
              className="
                text-xs
                font-medium
                text-slate-600
                dark:text-slate-300
              "
            >
              PRF
            </label>

            <div className="relative mt-2">
              <select
                value={PRF}
                onChange={(event) =>
                  handlePRFChange(
                    event.target.value
                  )
                }
                className="
                  w-full
                  appearance-none

                  bg-white
                  dark:bg-slate-950

                  border
                  border-slate-300
                  dark:border-slate-700

                  text-slate-900
                  dark:text-white

                  rounded-lg
                  px-3
                  py-2.5

                  text-sm

                  outline-none

                  focus:border-cyan-500
                "
              >
                <option value="">
                  Sélectionner un PRF
                </option>

                {references.map(
                  (reference) => (
                    <option
                      key={reference.id}
                      value={reference.PRF}
                    >
                      {reference.PRF}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={16}
                className="
                  absolute
                  right-3
                  top-3

                  text-slate-400
                  dark:text-slate-500

                  pointer-events-none
                "
              />
            </div>

            {/* SN */}

            <label
              className="
                block
                text-xs
                font-medium

                text-slate-600
                dark:text-slate-300

                mt-5
              "
            >
              Numéro de série
            </label>

            <input
              value={SN}
              onChange={(event) =>
                setSN(event.target.value)
              }
              placeholder="Entrer le SN"
              className="
                mt-2
                w-full

                bg-white
                dark:bg-slate-950

                border
                border-slate-300
                dark:border-slate-700

                text-slate-900
                dark:text-white

                placeholder:text-slate-400
                dark:placeholder:text-slate-600

                rounded-lg
                px-3
                py-2.5

                text-sm

                outline-none

                focus:border-teal-400
              "
            />

            <p
              className="
                mt-2
                text-[11px]
                text-slate-400
                dark:text-slate-600
              "
            >
              Une carte modèle possède un seul SN.
            </p>

            {/* IMAGE */}

            <label
              className="
                block
                text-xs
                font-medium

                text-slate-600
                dark:text-slate-300

                mt-5
              "
            >
              Image de référence
            </label>

            <label
              className="
                mt-2

                h-24

                border
                border-dashed
                border-slate-300
                dark:border-slate-700

                rounded-lg

                flex
                items-center
                justify-center

                cursor-pointer

                bg-slate-50
                hover:bg-slate-100

                dark:bg-slate-950
                dark:hover:bg-slate-900

                transition
              "
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) =>
                  handleImage(
                    event.target.files?.[0]
                  )
                }
              />

              <div className="text-center">
                <Upload
                  size={19}
                  className="
                    mx-auto
                    mb-1

                    text-slate-400
                    dark:text-slate-500
                  "
                />

                <span
                  className="
                    text-xs
                    text-slate-500
                    dark:text-slate-500
                  "
                >
                  Importer une image
                </span>

                <p
                  className="
                    text-[10px]
                    text-slate-400
                    dark:text-slate-600
                    mt-1
                  "
                >
                  PNG, JPG, WEBP — max 5 Mo
                </p>
              </div>
            </label>

            {/* NOM IMAGE */}

            {image && (
              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-between
                  gap-2

                  bg-slate-50
                  dark:bg-slate-950

                  border
                  border-slate-200
                  dark:border-slate-800

                  rounded-lg
                  px-3
                  py-2
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    min-w-0
                  "
                >
                  <ImageIcon
                    size={14}
                    className="
                      shrink-0
                      text-teal-400
                    "
                  />

                  <span
                    className="
                      text-[11px]

                      text-slate-600
                      dark:text-slate-400

                      truncate
                    "
                  >
                    {image.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={supprimerImage}
                  className="
                    shrink-0

                    text-slate-400
                    hover:text-red-500

                    dark:text-slate-600
                    dark:hover:text-red-400
                  "
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* ENREGISTRER */}

            <button
              type="button"
              onClick={enregistrer}
              disabled={loading}
              className="
                w-full
                mt-5

                bg-teal-400
                hover:bg-teal-300

                disabled:opacity-50
                disabled:cursor-not-allowed

                text-slate-950

                font-semibold
                text-sm

                rounded-lg
                py-3

                transition
              "
            >
              {loading
                ? "Enregistrement..."
                : "Enregistrer"}
            </button>
          </section>

          {/* ===============================================
              IMAGE / PREVIEW
          =============================================== */}

          <section
            className="
              bg-white
              dark:bg-slate-900

              border
              border-slate-200
              dark:border-slate-800

              rounded-xl

              min-h-[500px]

              overflow-hidden

              flex
              items-center
              justify-center

              shadow-sm
              dark:shadow-none
            "
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Carte modèle"
                className="
                  max-w-full
                  max-h-[500px]
                  object-contain
                  p-5
                "
              />
            ) : (
              <div className="text-center px-5">
                <div
                  className="
                    w-16
                    h-16

                    rounded-xl

                    bg-slate-100
                    dark:bg-slate-800

                    flex
                    items-center
                    justify-center

                    mx-auto
                    mb-3
                  "
                >
                  <ImageIcon
                    size={26}
                    className="
                      text-slate-400
                      dark:text-slate-500
                    "
                  />
                </div>

                <p
                  className="
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Aucune image sélectionnée
                </p>

                <p
                  className="
                    text-xs
                    text-slate-400
                    dark:text-slate-600

                    mt-1
                  "
                >
                  Importez l'image de la carte modèle
                </p>
              </div>
            )}
          </section>

          {/* ===============================================
              DEFAUTS / ZONES
          =============================================== */}

          <section
            className="
              bg-white
              dark:bg-slate-900

              border
              border-slate-200
              dark:border-slate-800

              rounded-xl
              p-5

              shadow-sm
              dark:shadow-none
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                mb-5
              "
            >
              <h2
                className="
                  text-sm
                  font-semibold
                  text-slate-900
                  dark:text-white
                "
              >
                Défauts attendus
              </h2>

              <span
                className="
                  text-[11px]

                  bg-slate-100
                  dark:bg-slate-800

                  text-slate-500
                  dark:text-slate-400

                  px-2
                  py-1
                  rounded-md
                "
              >
                {defauts.length}
              </span>
            </div>

            {/* ZONE */}

            <label
              className="
                text-xs
                font-medium

                text-slate-600
                dark:text-slate-300
              "
            >
              Zone
            </label>

            <div className="relative mt-2">
              <select
                value={zoneId}
                onChange={(event) =>
                  setZoneId(
                    event.target.value
                  )
                }
                disabled={
                  !PRF || loadingPRF
                }
                className="
                  w-full
                  appearance-none

                  bg-white
                  dark:bg-slate-950

                  border
                  border-slate-300
                  dark:border-slate-700

                  text-slate-900
                  dark:text-white

                  rounded-lg

                  px-3
                  py-2.5

                  text-sm

                  outline-none

                  disabled:opacity-50

                  focus:border-teal-500
                "
              >
                <option value="">
                  {loadingPRF
                    ? "Chargement..."
                    : "Sélectionner une zone"}
                </option>

                {zones.map((zone) => (
                  <option
                    key={zone.id}
                    value={zone.id}
                  >
                    {zone.nom}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="
                  absolute
                  right-3
                  top-3

                  text-slate-400
                  dark:text-slate-500

                  pointer-events-none
                "
              />
            </div>

            {/* DEFAUT */}

            <label
              className="
                block

                text-xs
                font-medium

                text-slate-600
                dark:text-slate-300

                mt-5
              "
            >
              Défaut attendu
            </label>

            <input
              value={defaut}
              onChange={(event) =>
                setDefaut(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  ajouterDefaut();
                }
              }}
              placeholder="Ex : résistance manquante"
              className="
                mt-2

                w-full

                bg-white
                dark:bg-slate-950

                border
                border-slate-300
                dark:border-slate-700

                text-slate-900
                dark:text-white

                placeholder:text-slate-400
                dark:placeholder:text-slate-600

                rounded-lg

                px-3
                py-2.5

                text-sm

                outline-none

                focus:border-teal-500
              "
            />

            {/* AJOUTER */}

            <button
              type="button"
              onClick={ajouterDefaut}
              disabled={
                !PRF ||
                !zoneId ||
                !defaut.trim()
              }
              className="
                mt-3

                w-full

                border
                border-slate-300
                dark:border-slate-700

                bg-slate-50
                hover:bg-slate-100

                dark:bg-slate-950
                dark:hover:bg-slate-800

                text-slate-700
                dark:text-white

                disabled:opacity-50
                disabled:cursor-not-allowed

                rounded-lg

                py-2.5

                text-sm

                flex
                items-center
                justify-center
                gap-2

                transition
              "
            >
              <Plus size={16} />

              Ajouter le défaut
            </button>

            {/* LISTE DEFAUTS */}

            <div className="mt-5">
              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-3
                "
              >
                <span
                  className="
                    text-xs
                    font-semibold

                    text-slate-600
                    dark:text-slate-300
                  "
                >
                  Défauts configurés
                </span>
              </div>

              {defauts.length === 0 ? (
                <div
                  className="
                    border
                    border-dashed
                    border-slate-200
                    dark:border-slate-800

                    rounded-lg

                    p-5

                    text-center
                  "
                >
                  <p
                    className="
                      text-xs

                      text-slate-400
                      dark:text-slate-600
                    "
                  >
                    Aucun défaut ajouté
                  </p>
                </div>
              ) : (
                <div
                  className="
                    space-y-2

                    max-h-[280px]

                    overflow-y-auto

                    pr-1
                  "
                >
                  {defauts.map((item) => (
                    <div
                      key={item.id}
                      className="
                        bg-slate-50
                        dark:bg-slate-950

                        border
                        border-slate-200
                        dark:border-slate-800

                        rounded-lg

                        p-3
                      "
                    >
                      <div
                        className="
                          flex
                          justify-between
                          gap-3
                        "
                      >
                        <div className="min-w-0">
                          <div
                            className="
                              text-[11px]
                              font-semibold
                              text-teal-500
                              dark:text-cyan-400
                            "
                          >
                            {item.zoneNom}
                          </div>

                          <div
                            className="
                              text-xs

                              text-slate-600
                              dark:text-slate-300

                              mt-1
                              break-words
                            "
                          >
                            {item.defautAttendu}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            supprimerDefaut(
                              item.id
                            )
                          }
                          className="
                            shrink-0

                            text-slate-400
                            hover:text-red-500

                            dark:text-slate-600
                            dark:hover:text-red-400

                            transition
                          "
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* =================================================
            TABLE CARTES MODELES
        ================================================= */}

        <section className="mt-6">
          <div
            className="
              bg-white
              dark:bg-slate-900

              border
              border-slate-200
              dark:border-slate-800

              rounded-xl

              overflow-hidden

              shadow-sm
              dark:shadow-none
            "
          >
            <div
              className="
                px-5
                py-4

                border-b
                border-slate-200
                dark:border-slate-800
              "
            >
              <h2
                className="
                  text-sm
                  font-semibold

                  text-slate-900
                  dark:text-white
                "
              >
                Cartes modèles enregistrées
              </h2>

              <p
                className="
                  text-xs

                  text-slate-400
                  dark:text-slate-500

                  mt-1
                "
              >
                Liste des cartes modèles configurées
                dans le système.
              </p>
            </div>

            <div
              className="
                grid

                grid-cols-[1fr_1fr_3fr_70px]

                px-5
                py-3

                bg-slate-50
                dark:bg-slate-950

                border-b
                border-slate-200
                dark:border-slate-800

                text-[10px]
                font-semibold

                text-slate-500
                dark:text-slate-500

                uppercase
                tracking-wide
              "
            >
              <div>SN</div>

              <div>PRF</div>

              <div>Défauts / zones</div>

              <div />
            </div>

            {cartes.length === 0 ? (
              <div
                className="
                  py-12
                  text-center

                  text-xs

                  text-slate-400
                  dark:text-slate-600
                "
              >
                Aucune carte modèle enregistrée.
              </div>
            ) : (
              cartes.map((carte) => (
                <div
                  key={carte.id}
                  className="
                    grid

                    grid-cols-[1fr_1fr_3fr_70px]

                    items-center

                    px-5
                    py-3

                    border-b
                    border-slate-200
                    dark:border-slate-800

                    last:border-b-0

                    hover:bg-slate-50
                    dark:hover:bg-slate-800/40

                    transition
                  "
                >
                  {/* SN */}

                  <div
                    className="
                      text-xs
                      font-medium

                      text-slate-800
                      dark:text-white
                    "
                  >
                    {carte.sn}
                  </div>

                  {/* PRF */}

                  <div
                    className="
                      text-xs

                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {carte.PRF}
                  </div>

                  {/* DEFAUTS */}

                  <div className="flex flex-wrap gap-2">
                    {carte.defautAttendu?.map(
                      (item) => (
                        <span
                          key={item.id}
                          className="
                            bg-slate-100
                            dark:bg-slate-800

                            border
                            border-slate-200
                            dark:border-slate-700

                            rounded-md

                            px-2
                            py-1

                            text-[10px]

                            text-slate-600
                            dark:text-slate-300
                          "
                        >
                          <span
                            className="
                              text-teal-500
                              dark:text-teal-500
                              font-medium
                            "
                          >
                            {item.zone.nom}
                          </span>

                          {" : "}

                          {item.defautAttendu}
                        </span>
                      )
                    )}
                  </div>

                  {/* ACTION */}

                  <div
                    className="
                      flex
                      justify-end
                    "
                  >
                    <button
                      type="button"
                      onClick={() =>
                        demanderSuppression(
                          carte
                        )
                      }
                      className="
                        w-8
                        h-8

                        rounded-lg

                        flex
                        items-center
                        justify-center

                        text-slate-400
                        hover:text-red-500

                        hover:bg-red-50

                        dark:text-slate-600
                        dark:hover:text-red-400
                        dark:hover:bg-red-950/30

                        transition
                      "
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

    

      {carteASupprimer && (
        <div
          className="
            fixed
            inset-0
            z-50

            flex
            items-center
            justify-center

            bg-slate-950/40
            backdrop-blur-sm

            px-4
          "
          onClick={() => {
            if (!suppressionLoading) {
              setCarteASupprimer(null);
              setSuppressionError("");
            }
          }}
        >
          <div
            className="
              w-full
              max-w-md

              bg-white
              dark:bg-slate-900

              border
              border-slate-200
              dark:border-slate-800

              rounded-2xl

              shadow-xl
              dark:shadow-black/40

              p-6
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* ICON */}

            <div
              className="
                w-11
                h-11

                rounded-xl

                bg-red-50
                dark:bg-red-950/30

                flex
                items-center
                justify-center

                mb-4
              "
            >
              <Trash2
                size={21}
                className="
                  text-red-500
                  dark:text-red-400
                "
              />
            </div>

            {/* TITRE */}

            <h3
              className="
                text-lg
                font-semibold

                text-slate-900
                dark:text-white
              "
            >
              Supprimer la carte modèle ?
            </h3>

            {/* DESCRIPTION */}

            <p
              className="
                mt-2

                text-sm

                text-slate-500
                dark:text-slate-400

                leading-relaxed
              "
            >
              Êtes-vous sûr de vouloir supprimer
              cette carte modèle ? Cette action est
              irréversible.
            </p>

            {/* ERREUR SUPPRESSION */}

            {suppressionError && (
              <div
                className="
                  mt-4

                  flex
                  items-start
                  gap-3

                  rounded-lg

                  border
                  border-red-200
                  dark:border-red-900/50

                  bg-red-50
                  dark:bg-red-950/30

                  px-3
                  py-3
                "
              >
                <AlertCircle
                  size={18}
                  className="
                    shrink-0
                    text-red-500
                    mt-0.5
                  "
                />

                <div>
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-red-700
                      dark:text-red-400
                    "
                  >
                    Erreur
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-red-600
                      dark:text-red-400
                      whitespace-pre-line
                    "
                  >
                    {suppressionError}
                  </p>
                </div>
              </div>
            )}

            {/* CARTE INFO */}

            <div
              className="
                mt-4

                rounded-lg

                border
                border-slate-200
                dark:border-slate-800

                bg-slate-50
                dark:bg-slate-950

                px-4
                py-3
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >
                <div className="min-w-0">
                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-wide
                      font-semibold

                      text-slate-400
                      dark:text-slate-500
                    "
                  >
                    SN
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      font-semibold

                      text-slate-800
                      dark:text-white

                      truncate
                    "
                  >
                    {carteASupprimer.sn}
                  </p>
                </div>

                <div className="shrink-0">
                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-wide
                      font-semibold

                      text-slate-400
                      dark:text-slate-500
                    "
                  >
                    PRF
                  </p>

                  <p
                    className="
                      mt-1
                      text-sm
                      font-semibold

                      text-teal-300
                      dark:text-teal-400
                    "
                  >
                    {carteASupprimer.PRF}
                  </p>
                </div>
              </div>
            </div>

            {/* ACTIONS */}

            <div
              className="
                flex
                justify-end
                gap-3

                mt-6
              "
            >
              <button
                type="button"
                disabled={suppressionLoading}
                onClick={() => {
                  setCarteASupprimer(null);
                  setSuppressionError("");
                }}
                className="
                  px-4
                  py-2.5

                  rounded-lg

                  border
                  border-slate-300
                  dark:border-slate-700

                  bg-white
                  dark:bg-slate-950

                  text-sm
                  font-medium

                  text-slate-700
                  dark:text-slate-300

                  hover:bg-slate-50
                  dark:hover:bg-slate-800

                  disabled:opacity-50

                  transition
                "
              >
                Annuler
              </button>

              <button
                type="button"
                disabled={suppressionLoading}
                onClick={confirmerSuppression}
                className="
                  px-4
                  py-2.5

                  rounded-lg

                  bg-red-500
                  hover:bg-red-600

                  text-white

                  text-sm
                  font-semibold

                  disabled:opacity-50
                  disabled:cursor-not-allowed

                  transition
                "
              >
                {suppressionLoading
                  ? "Suppression..."
                  : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}