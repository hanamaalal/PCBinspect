"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { lancerProduction } from "@/lib/api";
import Header from "@/components/layout/Header";
import { useAuth } from "@/app/context/AuthContext";
import { socket } from "@/lib/socket";

interface ProductionData {
  PRF: string;

  programme?: {
    zones?: Array<{
      id?: string;
      nom: string;
    }>;
  };

  parametres?: {
    verifSN?: boolean;
    activationInterblocage?: boolean;
  };
}

export default function ProductionPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [of, setOf] = useState("");
  const [data, setData] = useState<ProductionData | null>(null);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // CHARGER OF
  // =========================================================

  const handleProduction = async () => {
    if (!of.trim()) {
      setError("Veuillez saisir un OF");
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await lancerProduction(of);

      console.log("Production reçue :", response);

      if (
        !response ||
        !response.programme ||
        !response.programme.zones
      ) {
        setData(null);
        setError("Aucun programme configuré pour cet OF");
        return;
      }

      setData(response);
    } catch (error) {
      console.error(error);

      setError(
        "Erreur lors de récupération de production"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // DÉMARRER INSPECTION
  // =========================================================

  const startInspection = () => {
    if (!user?.id) {
      setError("Utilisateur non connecté");
      return;
    }

    if (!data) {
      setError("Aucune production chargée");
      return;
    }

    setStarting(true);
    setError("");

    // =======================================================
    // SUCCÈS
    // =======================================================

    socket.once(
      "inspection:started",
      (result) => {
        console.log(
          "Inspection démarrée :",
          result
        );

        router.push(
          `/dashboard/inspection?PRF=${result.PRF}`
        );
      }
    );

    // =======================================================
    // ERREUR
    // =======================================================

    socket.once(
      "inspection:error",
      (result) => {
        console.error(
          "Erreur inspection :",
          result
        );

        setStarting(false);

        setError(
          result?.message ||
            "Erreur lors du démarrage de l'inspection"
        );
      }
    );

    socket.emit(
      "inspection:start",
      {
        production: data,
        operatorId: user.id,
      }
    );
  };

  // =========================================================
  // NETTOYAGE SOCKET
  // =========================================================

  useEffect(() => {
    return () => {
      socket.off("inspection:started");
      socket.off("inspection:error");
    };
  }, []);

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
          min-h-screen
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
              text-3xl
              font-bold
              tracking-tight
              text-gray-900
              transition-colors
              duration-300
              dark:text-white
            "
          >
            Lancer le Mode Production
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-gray-500
              transition-colors
              duration-300
              dark:text-slate-400
            "
          >
            Saisir l'ordre de fabrication afin de préparer
            l'inspection robot
          </p>
        </div>

        {/* ===================================================
            FORMULAIRE OF
        =================================================== */}

        <section
          className="
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
          "
        >
          {/* TITRE */}

          <h2
            className="
              text-lg
              font-semibold
              text-gray-900
              transition-colors
              duration-300
              dark:text-white
            "
          >
            Ordre de fabrication
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-gray-500
              transition-colors
              duration-300
              dark:text-slate-400
            "
          >
            Entrez le numéro de l'ordre de fabrication
          </p>

          {/* LABEL */}

          <label
            className="
              mt-6
              block
              text-sm
              font-medium
              text-gray-700
              transition-colors
              duration-300
              dark:text-slate-300
            "
          >
            Numéro d'ordre de fabrication (OF)
          </label>

          {/* INPUT */}

          <input
            value={of}
            onChange={(e) => setOf(e.target.value)}
            placeholder="Ex: OF001"
            className="
              mt-3
              w-full
              rounded-lg
              border
              border-gray-300
              bg-white
              px-4
              py-3
              text-gray-900
              placeholder:text-gray-400
              outline-none
              transition-all
              duration-200

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

          {/* BUTTON */}

          <div className="mt-5 flex justify-end">
            <button
              onClick={handleProduction}
              disabled={loading}
              className="
                rounded-lg
                bg-gray-900
                px-6
                py-3
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

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {loading
                ? "Chargement..."
                : "Récupérer PRF →"}
            </button>
          </div>
        </section>

        {/* ===================================================
            ERREUR
        =================================================== */}

        {error && (
          <div
            className="
              mt-5
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-5
              py-4
              text-sm
              font-medium
              text-red-600
              transition-colors
              duration-300

              dark:border-red-900/60
              dark:bg-red-950/40
              dark:text-red-300
            "
          >
            {error}
          </div>
        )}

        {/* ===================================================
            RESULTAT PRODUCTION
        =================================================== */}

        <section
          className="
            mt-8
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
          "
        >
          {/* TITRE */}

          <div className="mb-6">
            <h2
              className="
                text-xl
                font-bold
                text-gray-900
                transition-colors
                duration-300
                dark:text-white
              "
            >
              Production
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
                transition-colors
                duration-300
                dark:text-slate-400
              "
            >
              Informations de production et paramètres
              d'inspection
            </p>
          </div>

          {data ? (
            <div className="space-y-6">

              {/* =================================================
                  PRF
              ================================================= */}

              <div
                className="
                  rounded-xl
                  border
                  border-gray-200
                  bg-gray-50
                  p-5
                  transition-colors
                  duration-300
                  dark:border-slate-800
                  dark:bg-slate-800/50
                "
              >
                <p
                  className="
                    text-sm
                    text-gray-500
                    dark:text-slate-400
                  "
                >
                  PRF
                </p>

                <p
                  className="
                    mt-1
                    text-2xl
                    font-bold
                    text-teal-600
                    dark:text-teal-400
                  "
                >
                  {data.PRF}
                </p>
              </div>

              {/* =================================================
                  ZONES
              ================================================= */}

              <div>
                <p
                  className="
                    mb-3
                    text-sm
                    font-semibold
                    text-gray-700
                    dark:text-slate-300
                  "
                >
                  Zones inspection
                </p>

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-3
                    md:grid-cols-2
                    lg:grid-cols-3
                  "
                >
                  {data.programme?.zones?.map(
                    (zone, index) => (
                      <div
                        key={zone.id ?? index}
                        className="
                          rounded-xl
                          border
                          border-gray-200
                          bg-gray-50
                          px-4
                          py-3
                          text-sm
                          text-gray-700
                          transition-all
                          duration-200

                          hover:border-teal-300
                          hover:bg-teal-50

                          dark:border-slate-800
                          dark:bg-slate-800/50
                          dark:text-slate-200
                          dark:hover:border-teal-800
                          dark:hover:bg-slate-800
                        "
                      >
                        <span
                          className="
                            mr-2
                            text-teal-600
                            dark:text-teal-400
                          "
                        >
                          ●
                        </span>

                        {zone.nom}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* =================================================
                  PARAMETRES
              ================================================= */}

              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  md:grid-cols-2
                "
              >
                {/* =================================================
                    VERIFICATION SN
                ================================================= */}

                <div
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-5
                    transition-colors
                    duration-300
                    dark:border-slate-800
                    dark:bg-slate-800/50
                  "
                >
                  <p
                    className="
                      text-sm
                      text-gray-500
                      dark:text-slate-400
                    "
                  >
                    Vérification SN
                  </p>

                  <p
                    className={`mt-2 font-semibold ${
                      data.parametres?.verifSN
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-gray-500 dark:text-slate-500"
                    }`}
                  >
                    {data.parametres?.verifSN
                      ? "✓ Activée"
                      : "✕ Désactivée"}
                  </p>
                </div>

                {/* =================================================
                    INTERBLOCAGE
                ================================================= */}

                <div
                  className="
                    rounded-xl
                    border
                    border-gray-200
                    bg-gray-50
                    p-5
                    transition-colors
                    duration-300
                    dark:border-slate-800
                    dark:bg-slate-800/50
                  "
                >
                  <p
                    className="
                      text-sm
                      text-gray-500
                      dark:text-slate-400
                    "
                  >
                    Interblocage
                  </p>

                  <p
                    className={`mt-2 font-semibold ${
                      data.parametres?.activationInterblocage
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-gray-500 dark:text-slate-500"
                    }`}
                  >
                    {data.parametres?.activationInterblocage
                      ? "✓ Activé"
                      : "✕ Désactivé"}
                  </p>
                </div>
              </div>

              {/* =================================================
                  LANCER INSPECTION
              ================================================= */}

              <div
                className="
                  border-t
                  border-gray-200
                  pt-6
                  dark:border-slate-800
                "
              >
                <button
                  onClick={startInspection}
                  disabled={starting}
                  className="
                    w-full
                    rounded-lg
                    bg-gray-900
                    py-3.5
                    font-bold
                    text-white
                    shadow-sm
                    transition-all
                    duration-200
                    hover:bg-gray-800
                    hover:shadow-md

                    dark:bg-teal-500
                    dark:text-slate-950
                    dark:hover:bg-teal-400

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {starting
                    ? "Lancement..."
                    : "Lancer inspection"}
                </button>
              </div>
            </div>
          ) : (
            /* =================================================
               AUCUNE PRODUCTION
            ================================================= */

            <div
              className="
                rounded-xl
                border
                border-dashed
                border-gray-300
                bg-gray-50
                py-12
                text-center
                transition-colors
                duration-300

                dark:border-slate-700
                dark:bg-slate-800/40
              "
            >
              <p
                className="
                  text-gray-500
                  dark:text-slate-400
                "
              >
                Aucune production chargée
              </p>

              <p
                className="
                  mt-2
                  text-sm
                  text-gray-400
                  dark:text-slate-500
                "
              >
                Saisissez un OF pour récupérer les
                informations de production.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
