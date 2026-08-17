"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  CheckCircle,
  XCircle,
  Clock3,
  Camera,
  History,
  CircleStop,
  Play,
  ChevronRight,
  X,
  AlertTriangle,
} from "lucide-react";

import { socket } from "@/lib/socket";
import { getInspectByPRF } from "@/lib/api";

import RobotCameraTop from "../components/Robot_cameraTop";
import RobotCameraBottom from "../components/Robot_cameraBottom";

// =====================================================
// TYPES
// =====================================================

type InspectionStatus =
  | "IDLE"
  | "RUNNING"
  | "STOPPED"
  | "FINISHED";

interface Defaut {
  id?: string;
  nom?: string;
  type?: string;
  description?: string;
  zone?: {
    id?: string;
    nom?: string;
  };
}

interface Inspection {
  id?: string;

  sn?: string;

  PRF?: string;
  prf?: string;

  resultat?: string;
  statut?: string;

  dateHeure?: string;
  createdAt?: string;
  date?: string;

  imagePathTop?: string | null;
  imagePathBottom?: string | null;

  imageTop?: string | null;
  imageBottom?: string | null;

  defauts?: Defaut[];
}

// =====================================================
// TYPE PAYLOAD SOCKET
// =====================================================

interface InspectionSocketData {
  PRF?: string | number;

  SN?: string;

  numeroSN?: string | number;
  nombreSN?: string | number;

  progress?: string | number;

  step?: string;

  remaining?: string | number;

  status?: string;

  resultat?: string;
}

// =====================================================
// PAGE
// =====================================================

export default function InspectionPage() {
  const params = useSearchParams();

  const PRF = params.get("PRF");

  // =====================================================
  // INSPECTION ACTUELLE
  // =====================================================

  const [progress, setProgress] = useState(0);

  const [step, setStep] = useState("");

  const [remainingTime, setRemainingTime] = useState(0);

  const [SN, setSN] = useState("");

  const [numeroSN, setNumeroSN] = useState(0);

  const [nombreSN, setNombreSN] = useState(0);

  const [status, setStatus] =
    useState<InspectionStatus>("IDLE");

  // =====================================================
  // HISTORIQUE
  // =====================================================

  const [inspections, setInspections] =
    useState<Inspection[]>([]);

  // =====================================================
  // MODAL
  // =====================================================

  const [selectedInspection, setSelectedInspection] =
    useState<Inspection | null>(null);

  // =====================================================
  // UTILITAIRES
  // =====================================================

  const toNumber = (
    value: unknown,
    defaultValue = 0
  ): number => {
    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : defaultValue;
  };

  const clampProgress = (
    value: unknown
  ): number => {
    return Math.min(
      Math.max(toNumber(value, 0), 0),
      100
    );
  };

  const getInspectionDate = (
    inspection: Inspection
  ): string | null => {
    return (
      inspection?.dateHeure ||
      inspection?.createdAt ||
      inspection?.date ||
      null
    );
  };

  // =====================================================
  // AUJOURD'HUI
  // =====================================================

  const isToday = (
    dateValue: string | null | undefined
  ): boolean => {
    if (!dateValue) {
      return false;
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // =====================================================
  // VERIFIER PRF
  // =====================================================

  const isSamePRF = (
    data: InspectionSocketData | null | undefined
  ): boolean => {
    if (!PRF) {
      return false;
    }

    if (
      data?.PRF !== undefined &&
      String(data.PRF) !== String(PRF)
    ) {
      return false;
    }

    return true;
  };

  // =====================================================
  // CHARGER HISTORIQUE
  // =====================================================

  const chargerInspections = useCallback(async () => {
    if (!PRF) {
      setInspections([]);
      return;
    }

    try {
      const data = await getInspectByPRF(PRF);

      const liste: Inspection[] =
        Array.isArray(data)
          ? data
          : [];

      const inspectionsDuJour =
        liste.filter((inspection) =>
          isToday(
            getInspectionDate(inspection)
          )
        );

      inspectionsDuJour.sort((a, b) => {
        const dateA = new Date(
          getInspectionDate(a) || 0
        ).getTime();

        const dateB = new Date(
          getInspectionDate(b) || 0
        ).getTime();

        return dateB - dateA;
      });

      setInspections(
        inspectionsDuJour
      );
    } catch (error) {
      console.error(
        "Erreur chargement inspections :",
        error
      );

      setInspections([]);
    }
  }, [PRF]);

  // =====================================================
  // INITIALISATION HISTORIQUE
  // =====================================================

  useEffect(() => {
    chargerInspections();
  }, [chargerInspections]);

  // =====================================================
  // SOCKET.IO
  // =====================================================

  useEffect(() => {
    if (!PRF) {
      return;
    }

    const room = String(PRF);

    // ---------------------------------------------------
    // JOIN ROOM
    // ---------------------------------------------------

    socket.emit(
      "inspection:join",
      room
    );

    console.log(
      "🔌 Rejoint la room inspection :",
      room
    );

    // ===================================================
    // CONFIGURATION
    // ===================================================

    const configurationHandler = (
      data: InspectionSocketData
    ) => {
      console.log(
        "⚙️ CONFIGURATION :",
        data
      );

      if (!isSamePRF(data)) {
        return;
      }

      if (
        data.nombreSN !== undefined
      ) {
        const total = toNumber(
          data.nombreSN
        );

        if (total > 0) {
          setNombreSN(total);
        }
      }

      if (
        data.numeroSN !== undefined
      ) {
        setNumeroSN(
          Math.max(
            toNumber(data.numeroSN),
            0
          )
        );
      }

      if (
        data.SN !== undefined
      ) {
        setSN(
          data.SN || ""
        );
      }

      if (
        data.progress !== undefined
      ) {
        setProgress(
          clampProgress(
            data.progress
          )
        );
      }

      if (
        data.step !== undefined
      ) {
        setStep(
          data.step || ""
        );
      }

      if (
        data.remaining !== undefined
      ) {
        setRemainingTime(
          Math.max(
            toNumber(data.remaining),
            0
          )
        );
      }

      if (
        data.status === "RUNNING"
      ) {
        setStatus("RUNNING");
      }

      if (
        data.status === "STOPPED"
      ) {
        setStatus("STOPPED");
      }

      if (
        data.status === "FINISHED"
      ) {
        setStatus("FINISHED");
      }
    };

    // ===================================================
    // START
    // ===================================================

    const startedHandler = (
      data: InspectionSocketData
    ) => {
      console.log(
        "▶️ INSPECTION STARTED :",
        data
      );

      if (!isSamePRF(data)) {
        return;
      }

      setStatus("RUNNING");

      if (
        data.nombreSN !== undefined
      ) {
        const total = toNumber(
          data.nombreSN
        );

        if (total > 0) {
          setNombreSN(total);
        }
      }

      if (
        data.numeroSN !== undefined
      ) {
        setNumeroSN(
          Math.max(
            toNumber(data.numeroSN),
            0
          )
        );
      }

      if (
        data.SN !== undefined
      ) {
        setSN(
          data.SN || ""
        );
      }

      if (
        data.progress !== undefined
      ) {
        setProgress(
          clampProgress(
            data.progress
          )
        );
      }

      if (
        data.step !== undefined
      ) {
        setStep(
          data.step || ""
        );
      }

      if (
        data.remaining !== undefined
      ) {
        setRemainingTime(
          Math.max(
            toNumber(data.remaining),
            0
          )
        );
      }
    };

    // ===================================================
    // PROGRESSION
    // ===================================================

    const updateHandler = (
      data: InspectionSocketData
    ) => {
      console.log(
        "📊 PROGRESSION :",
        data
      );

      if (!isSamePRF(data)) {
        return;
      }

      if (
        data.SN !== undefined
      ) {
        setSN(
          data.SN || ""
        );
      }

      if (
        data.numeroSN !== undefined
      ) {
        const current =
          toNumber(
            data.numeroSN
          );

        if (
          current >= 0
        ) {
          setNumeroSN(
            current
          );
        }
      }

      if (
        data.nombreSN !== undefined
      ) {
        const total =
          toNumber(
            data.nombreSN
          );

        if (
          total > 0
        ) {
          setNombreSN(
            total
          );
        }
      }

      if (
        data.progress !== undefined
      ) {
        setProgress(
          clampProgress(
            data.progress
          )
        );
      }

      if (
        data.step !== undefined
      ) {
        setStep(
          data.step || ""
        );
      }

      if (
        data.remaining !== undefined
      ) {
        setRemainingTime(
          Math.max(
            toNumber(
              data.remaining
            ),
            0
          )
        );
      }

      setStatus(
        "RUNNING"
      );
    };

    // ===================================================
    // NOUVELLE INSPECTION
    // ===================================================

    const newHandler = async (
      data: InspectionSocketData
    ) => {
      console.log(
        "🆕 NOUVELLE INSPECTION :",
        data
      );

      if (!isSamePRF(data)) {
        return;
      }

      if (
        data.numeroSN !== undefined
      ) {
        setNumeroSN(
          Math.max(
            toNumber(
              data.numeroSN
            ),
            0
          )
        );
      }

      if (
        data.nombreSN !== undefined
      ) {
        const total =
          toNumber(
            data.nombreSN
          );

        if (
          total > 0
        ) {
          setNombreSN(
            total
          );
        }
      }

      if (
        data.SN !== undefined
      ) {
        setSN(
          data.SN || ""
        );
      }

      if (
        data.progress !== undefined
      ) {
        setProgress(
          clampProgress(
            data.progress
          )
        );
      }

      if (
        data.step !== undefined
      ) {
        setStep(
          data.step || ""
        );
      }

      if (
        data.remaining !== undefined
      ) {
        setRemainingTime(
          Math.max(
            toNumber(
              data.remaining
            ),
            0
          )
        );
      }

      setStatus(
        "RUNNING"
      );

      await chargerInspections();
    };

    // ===================================================
    // INSPECTION SAUVEE
    // ===================================================

    const savedHandler = async (
      data: InspectionSocketData
    ) => {
      console.log(
        "💾 INSPECTION SAVED :",
        data
      );

      if (!isSamePRF(data)) {
        return;
      }

      if (
        data.numeroSN !== undefined
      ) {
        setNumeroSN(
          Math.max(
            toNumber(
              data.numeroSN
            ),
            0
          )
        );
      }

      if (
        data.nombreSN !== undefined
      ) {
        const total =
          toNumber(
            data.nombreSN
          );

        if (
          total > 0
        ) {
          setNombreSN(
            total
          );
        }
      }

      if (
        data.SN !== undefined
      ) {
        setSN(
          data.SN || ""
        );
      }

      await chargerInspections();
    };

    // ===================================================
    // STOP
    // ===================================================

    const stopHandler = (
      data: InspectionSocketData
    ) => {
      console.log(
        "🛑 INSPECTION STOPPED :",
        data
      );

      if (!isSamePRF(data)) {
        return;
      }

      setStatus(
        "STOPPED"
      );

      // IMPORTANT :
      // On conserve toutes les valeurs.
      // On ne remet PAS numeroSN/nombreSN à zéro.

      if (
        data.numeroSN !== undefined
      ) {
        setNumeroSN(
          Math.max(
            toNumber(
              data.numeroSN
            ),
            0
          )
        );
      }

      if (
        data.nombreSN !== undefined
      ) {
        const total =
          toNumber(
            data.nombreSN
          );

        if (
          total > 0
        ) {
          setNombreSN(
            total
          );
        }
      }

      if (
        data.SN !== undefined
      ) {
        setSN(
          data.SN || ""
        );
      }

      if (
        data.progress !== undefined
      ) {
        setProgress(
          clampProgress(
            data.progress
          )
        );
      }

      setRemainingTime(0);

      setStep(
        data.step ||
          "Inspection arrêtée"
      );
    };

    // ===================================================
    // RESUME
    // ===================================================

    const resumedHandler = (
      data: InspectionSocketData
    ) => {
      console.log(
        "▶️ INSPECTION REPRISE :",
        data
      );

      if (!isSamePRF(data)) {
        return;
      }

      setStatus(
        "RUNNING"
      );

      if (
        data.numeroSN !== undefined
      ) {
        setNumeroSN(
          Math.max(
            toNumber(
              data.numeroSN
            ),
            0
          )
        );
      }

      if (
        data.nombreSN !== undefined
      ) {
        const total =
          toNumber(
            data.nombreSN
          );

        if (
          total > 0
        ) {
          setNombreSN(
            total
          );
        }
      }

      if (
        data.SN !== undefined
      ) {
        setSN(
          data.SN || ""
        );
      }

      if (
        data.progress !== undefined
      ) {
        setProgress(
          clampProgress(
            data.progress
          )
        );
      }

      if (
        data.step !== undefined
      ) {
        setStep(
          data.step || ""
        );
      }

      if (
        data.remaining !== undefined
      ) {
        setRemainingTime(
          Math.max(
            toNumber(
              data.remaining
            ),
            0
          )
        );
      }
    };

    // ===================================================
    // FIN INSPECTION
    // ===================================================

    const finishedHandler = async (
      data: InspectionSocketData
    ) => {
      console.log(
        "🏁 INSPECTION FINIE :",
        data
      );

      if (!isSamePRF(data)) {
        return;
      }

      /*
       * Le backend peut envoyer nombreSN.
       * Si ce n'est pas le cas, on conserve la valeur
       * actuellement affichée par le frontend.
       */

      if (
        data.nombreSN !== undefined
      ) {
        const total =
          toNumber(
            data.nombreSN
          );

        if (
          total > 0
        ) {
          setNombreSN(
            total
          );

          // Toutes les cartes ont été inspectées.
          setNumeroSN(
            total
          );
        }
      }

      /*
       * Si le backend n'envoie pas nombreSN,
       * on ne modifie pas numeroSN.
       */

      setProgress(100);

      setRemainingTime(0);

      setStep(
        "Toutes les cartes inspectées"
      );

      setStatus(
        "FINISHED"
      );

      // Recharger l'historique
      await chargerInspections();
    };

    // ===================================================
    // ERREUR
    // ===================================================

    const errorHandler = (
      data: any
    ) => {
      console.error(
        "❌ ERREUR INSPECTION :",
        data
      );
    };

    // ===================================================
    // LISTENERS
    // ===================================================

    socket.on(
      "inspection:configuration",
      configurationHandler
    );

    socket.on(
      "inspection:started",
      startedHandler
    );

    socket.on(
      "inspection:update",
      updateHandler
    );

    socket.on(
      "inspection:new",
      newHandler
    );

    socket.on(
      "inspection:saved",
      savedHandler
    );

    socket.on(
      "inspection:stopped",
      stopHandler
    );

    socket.on(
      "inspection:resumed",
      resumedHandler
    );

    socket.on(
      "inspection:finished",
      finishedHandler
    );

    socket.on(
      "inspection:error",
      errorHandler
    );

    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {
      console.log(
        "🔌 Nettoyage listeners inspection :",
        room
      );

      socket.off(
        "inspection:configuration",
        configurationHandler
      );

      socket.off(
        "inspection:started",
        startedHandler
      );

      socket.off(
        "inspection:update",
        updateHandler
      );

      socket.off(
        "inspection:new",
        newHandler
      );

      socket.off(
        "inspection:saved",
        savedHandler
      );

      socket.off(
        "inspection:stopped",
        stopHandler
      );

      socket.off(
        "inspection:resumed",
        resumedHandler
      );

      socket.off(
        "inspection:finished",
        finishedHandler
      );

      socket.off(
        "inspection:error",
        errorHandler
      );

      socket.emit(
        "inspection:leave",
        room
      );
    };
  }, [
    PRF,
    chargerInspections,
  ]);

  // =====================================================
  // STOP INSPECTION
  // =====================================================

  const stopInspection = () => {
    if (!PRF) {
      return;
    }

    if (
      status !== "RUNNING"
    ) {
      return;
    }

    console.log(
      "🛑 Demande arrêt inspection :",
      PRF
    );

    socket.emit(
      "inspection:stop",
      {
        PRF,
      }
    );
  };

  // =====================================================
  // REPRENDRE INSPECTION
  // =====================================================

  const resumeInspection = () => {
    if (!PRF) {
      return;
    }

    if (
      status !== "STOPPED"
    ) {
      return;
    }

    const reste =
      Math.max(
        nombreSN - numeroSN,
        0
      );

    if (
      reste <= 0
    ) {
      console.log(
        "Aucune inspection restante"
      );

      setStatus(
        "FINISHED"
      );

      return;
    }

    console.log(
      "▶️ REPRISE INSPECTION",
      {
        PRF,
        numeroSN,
        nombreSN,
        restantes: reste,
      }
    );

    socket.emit(
      "inspection:resume",
      {
        PRF,
        numeroSN,
        nombreSN,
      }
    );
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (
    dateValue:
      | string
      | null
      | undefined
  ) => {
    if (!dateValue) {
      return "-";
    }

    try {
      const date =
        new Date(
          dateValue
        );

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "-";
      }

      return date.toLocaleString(
        "fr-FR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "-";
    }
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (
    image:
      | string
      | null
      | undefined
  ) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith(
        "http://"
      ) ||
      image.startsWith(
        "https://"
      )
    ) {
      return image;
    }

    return `http://localhost:3001/${image.replace(
      /^\/+/,
      ""
    )}`;
  };

  // =====================================================
  // RESULTAT
  // =====================================================

  const getResultat = (
    inspection: Inspection
  ) => {
    return (
      inspection?.resultat ===
      "GOOD"
    );
  };

  // =====================================================
  // IMAGE INSPECTION
  // =====================================================

  const getInspectionImage = (
    inspection: Inspection,
    camera:
      | "TOP"
      | "BOTTOM"
  ) => {
    if (
      camera === "TOP"
    ) {
      return (
        inspection?.imagePathTop ||
        inspection?.imageTop ||
        ""
      );
    }

    return (
      inspection?.imagePathBottom ||
      inspection?.imageBottom ||
      ""
    );
  };

  // =====================================================
  // RESTANTS
  // =====================================================

  const inspectionsRestantes =
    Math.max(
      nombreSN - numeroSN,
      0
    );

  // =====================================================
  // TEXTE STATUT
  // =====================================================

  const getStatusText = () => {
    switch (
      status
    ) {
      case "RUNNING":
        return "Inspection en cours";

      case "STOPPED":
        return "Inspection arrêtée";

      case "FINISHED":
        return "Toutes les inspections sont terminées";

      default:
        return "Aucune inspection en cours";
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
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
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          mb-6
          overflow-hidden
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-sm
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-6
            sm:py-5
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                rounded-xl
                bg-teal-100
                p-3
                dark:bg-teal-500/15
              "
            >
              <Camera
                size={25}
                className="
                  text-teal-600
                  dark:text-teal-400
                "
              />
            </div>

            <div>
              <h1
                className="
                  text-xl
                  font-bold
                  text-slate-900
                  sm:text-2xl
                  lg:text-3xl
                  dark:text-white
                "
              >
                Supervision Inspection Robot
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Surveillance industrielle en temps réel
              </p>
            </div>
          </div>

          <div
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-5
              py-3
              dark:border-slate-700
              dark:bg-slate-800
            "
          >
            <span
              className="
                text-sm
                font-medium
                text-slate-500
                dark:text-slate-400
              "
            >
              PRF
            </span>

            <span
              className="
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              {PRF || "-"}
            </span>
          </div>
        </div>
      </div>

      {/* =================================================
          RESUME / RESTANTS
      ================================================= */}

      {status === "STOPPED" &&
        inspectionsRestantes > 0 && (
          <div
            className="
              mb-6
              flex
              flex-col
              gap-4
              rounded-2xl
              border
              border-amber-200
              bg-amber-50
              p-5
              shadow-sm
              sm:flex-row
              sm:items-center
              sm:justify-between
              dark:border-amber-500/30
              dark:bg-amber-500/10
            "
          >
            <div>
              <div
                className="
                  text-lg
                  font-bold
                  text-amber-800
                  dark:text-amber-300
                "
              >
                Inspection interrompue
              </div>

              <p
                className="
                  mt-1
                  text-sm
                  text-amber-700
                  dark:text-amber-400
                "
              >
                {inspectionsRestantes}{" "}
                inspection
                {inspectionsRestantes > 1
                  ? "s"
                  : ""}{" "}
                restante
                {inspectionsRestantes > 1
                  ? "s"
                  : ""}.
              </p>
            </div>

            <button
              onClick={
                resumeInspection
              }
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-teal-600
                px-6
                py-3
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-teal-700
                active:bg-teal-800
              "
            >
              <Play size={18} />

              Reprendre les inspections
            </button>
          </div>
        )}

      {/* =================================================
          FIN
      ================================================= */}

      {status === "FINISHED" && (
        <div
          className="
            mb-6
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-green-200
            bg-green-50
            p-5
            dark:border-green-500/30
            dark:bg-green-500/10
          "
        >
          <CheckCircle
            size={25}
            className="
              text-green-600
              dark:text-green-400
            "
          />

          <div>
            <p
              className="
                font-bold
                text-green-800
                dark:text-green-300
              "
            >
              Toutes les inspections sont terminées
            </p>

            <p
              className="
                text-sm
                text-green-700
                dark:text-green-400
              "
            >
              {nombreSN} / {nombreSN} cartes inspectées.
            </p>
          </div>
        </div>
      )}

      {/* =================================================
          CAMERAS + INSPECTION
      ================================================= */}

      <div
        className="
          mb-6
          grid
          grid-cols-1
          gap-5
          lg:grid-cols-3
        "
      >
        {/* TOP */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-100
              px-4
              py-3
              dark:border-slate-800
            "
          >
            <div className="flex items-center gap-3">
              <Camera
                size={19}
                className="text-teal-600"
              />

              <div>
                <h2
                  className="
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Caméra TOP
                </h2>

                <p className="text-xs text-slate-400">
                  Vue supérieure
                </p>
              </div>
            </div>

            <span
              className="
                flex
                items-center
                gap-1.5
                text-xs
                font-bold
                text-green-600
              "
            >
              <span
                className="
                  h-2
                  w-2
                  animate-pulse
                  rounded-full
                  bg-green-500
                "
              />

              LIVE
            </span>
          </div>

          <div className="bg-slate-950 p-3">
            <RobotCameraTop />
          </div>
        </div>

        {/* BOTTOM */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-100
              px-4
              py-3
              dark:border-slate-800
            "
          >
            <div className="flex items-center gap-3">
              <Camera
                size={19}
                className="text-blue-600"
              />

              <div>
                <h2
                  className="
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Caméra BOTTOM
                </h2>

                <p className="text-xs text-slate-400">
                  Vue inférieure
                </p>
              </div>
            </div>

            <span
              className="
                flex
                items-center
                gap-1.5
                text-xs
                font-bold
                text-green-600
              "
            >
              <span
                className="
                  h-2
                  w-2
                  animate-pulse
                  rounded-full
                  bg-green-500
                "
              />

              LIVE
            </span>
          </div>

          <div className="bg-slate-950 p-3">
            <RobotCameraBottom />
          </div>
        </div>

        {/* INSPECTION */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            dark:border-slate-800
            dark:bg-slate-900
          "
        >
          <div
            className="
              border-b
              border-slate-100
              px-4
              py-3
              dark:border-slate-800
            "
          >
            <div className="flex items-center gap-3">
              <Clock3
                size={19}
                className="text-teal-600"
              />

              <div>
                <div className="flex items-center gap-2">
                  <h2
                    className="
                      font-bold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    Inspection actuelle
                  </h2>

                  {nombreSN > 0 && (
                    <span
                      className="
                        rounded-full
                        bg-teal-100
                        px-2.5
                        py-1
                        text-xs
                        font-bold
                        text-teal-700
                        dark:bg-teal-500/15
                        dark:text-teal-400
                      "
                    >
                      {numeroSN}/{nombreSN}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400">
                  {getStatusText()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-4">
            {/* SN */}

            <div
              className="
                rounded-xl
                border
                border-slate-100
                bg-slate-50
                px-4
                py-3
                dark:border-slate-700
                dark:bg-slate-800
              "
            >
              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                Numéro de série
              </p>

              <p
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                {SN || "-"}
              </p>

              {nombreSN > 0 && (
                <p
                  className="
                    mt-1
                    text-xs
                    font-semibold
                    text-teal-600
                    dark:text-teal-400
                  "
                >
                  {inspectionsRestantes > 0
                    ? `${inspectionsRestantes} restante${
                        inspectionsRestantes > 1
                          ? "s"
                          : ""
                      }`
                    : "Toutes les cartes sont terminées"}
                </p>
              )}
            </div>

            {/* ETAT */}

            <div className="flex items-center justify-between">
              <span
                className="
                  text-sm
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Etat
              </span>

              <span
                className={`
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-bold
                  ${
                    status === "RUNNING"
                      ? "bg-teal-50 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400"
                      : status === "STOPPED"
                      ? "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"
                      : status === "FINISHED"
                      ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }
                `}
              >
                {getStatusText()}
              </span>
            </div>

            {/* ETAPE */}

            <div>
              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                "
              >
                <span
                  className="
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Etape
                </span>

                <span
                  className="
                    ml-3
                    truncate
                    text-sm
                    font-semibold
                    text-slate-900
                    dark:text-white
                  "
                >
                  {step || "-"}
                </span>
              </div>

              <div
                className="
                  h-3
                  w-full
                  overflow-hidden
                  rounded-full
                  bg-slate-100
                  dark:bg-slate-800
                "
              >
                <div
                  className="
                    h-full
                    rounded-full
                    bg-teal-500
                    transition-all
                    duration-500
                  "
                  style={{
                    width: `${Math.min(
                      Math.max(
                        progress,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />
              </div>

              <div
                className="
                  mt-2
                  flex
                  items-center
                  justify-between
                "
              >
                <span className="text-xs text-slate-400">
                  {nombreSN > 0
                    ? `${numeroSN}/${nombreSN}`
                    : "Progression"}
                </span>

                <span
                  className="
                    text-sm
                    font-bold
                    text-teal-600
                    dark:text-teal-400
                  "
                >
                  {Math.round(
                    progress
                  )}
                  %
                </span>
              </div>
            </div>

            {/* TEMPS */}

            <div
              className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-slate-100
                bg-slate-50
                px-4
                py-3
                dark:border-slate-700
                dark:bg-slate-800
              "
            >
              <div className="flex items-center gap-2">
                <Clock3
                  size={16}
                  className="text-slate-400"
                />

                <span
                  className="
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Temps restant
                </span>
              </div>

              <span
                className="
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                {remainingTime}s
              </span>
            </div>

            {/* STOP */}

            {status === "RUNNING" && (
              <button
                onClick={
                  stopInspection
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-red-600
                  py-2.5
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-red-700
                  active:bg-red-800
                "
              >
                <CircleStop size={18} />

                Arrêter l'inspection
              </button>
            )}

            {/* RESUME */}

            {status === "STOPPED" &&
              inspectionsRestantes > 0 && (
                <button
                  onClick={
                    resumeInspection
                  }
                  className="
                    flex
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-teal-600
                    py-2.5
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-teal-700
                    active:bg-teal-800
                  "
                >
                  <Play size={18} />

                  Reprendre
                  {` (${inspectionsRestantes} restante${
                    inspectionsRestantes > 1
                      ? "s"
                      : ""
                  })`}
                </button>
              )}
          </div>
        </div>
      </div>

      {/* =================================================
          HISTORIQUE
      ================================================= */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            px-5
            py-4
            dark:border-slate-800
          "
        >
          <div className="flex items-center gap-3">
            <History
              size={21}
              className="text-purple-600"
            />

            <div>
              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Historique des inspections
              </h2>

              <p
                className="
                  text-xs
                  text-slate-400
                "
              >
                Inspections de la journée — PRF{" "}
                {PRF || "-"}
              </p>
            </div>
          </div>

          <div
            className="
              rounded-full
              bg-slate-100
              px-3
              py-1.5
              text-sm
              font-bold
              text-slate-700
              dark:bg-slate-800
              dark:text-slate-200
            "
          >
            {inspections.length}
          </div>
        </div>

        <div className="p-4">
          {inspections.length === 0 ? (
            <div className="py-12 text-center">
              <History
                size={40}
                className="
                  mx-auto
                  mb-3
                  text-slate-300
                  dark:text-slate-700
                "
              />

              <p
                className="
                  text-slate-500
                  dark:text-slate-400
                "
              >
                Aucune inspection enregistrée aujourd'hui
              </p>
            </div>
          ) : (
            <div
              className="
                max-h-[430px]
                space-y-2
                overflow-y-auto
                pr-2
              "
            >
              {inspections.map(
                (
                  inspection,
                  index
                ) => {
                  const isGood =
                    getResultat(
                      inspection
                    );

                  const inspectionDate =
                    getInspectionDate(
                      inspection
                    );

                  const nbDefauts =
                    inspection
                      ?.defauts
                      ?.length ?? 0;

                  return (
                    <button
                      key={
                        inspection.id ??
                        `${inspection.sn}-${inspectionDate}-${index}`
                      }
                      onClick={() =>
                        setSelectedInspection(
                          inspection
                        )
                      }
                      className="
                        group
                        w-full
                        rounded-xl
                        border
                        border-slate-100
                        px-4
                        py-3
                        text-left
                        transition
                        hover:border-teal-200
                        hover:bg-teal-50/30
                        dark:border-slate-800
                        dark:hover:border-teal-500/40
                        dark:hover:bg-slate-800/70
                      "
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`
                            shrink-0
                            rounded-lg
                            p-2
                            ${
                              isGood
                                ? "bg-green-100 dark:bg-green-500/15"
                                : "bg-red-100 dark:bg-red-500/15"
                            }
                          `}
                        >
                          {isGood ? (
                            <CheckCircle
                              size={20}
                              className="text-green-600"
                            />
                          ) : (
                            <XCircle
                              size={20}
                              className="text-red-600"
                            />
                          )}
                        </div>

                        <div className="min-w-[120px]">
                          <p
                            className="
                              text-sm
                              font-bold
                              text-slate-900
                              dark:text-white
                            "
                          >
                            {inspection.sn ||
                              "-"}
                          </p>

                          <p
                            className="
                              text-[11px]
                              text-slate-400
                            "
                          >
                            Inspection #
                            {inspections.length -
                              index}
                          </p>
                        </div>

                        <div className="flex-1">
                          <p
                            className="
                              text-[10px]
                              uppercase
                              text-slate-400
                            "
                          >
                            Date
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-xs
                              font-medium
                              text-slate-700
                              dark:text-slate-300
                            "
                          >
                            {formatDate(
                              inspectionDate
                            )}
                          </p>
                        </div>

                        <div className="hidden sm:block">
                          <span
                            className={`
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              font-bold
                              ${
                                isGood
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }
                            `}
                          >
                            {isGood
                              ? "GOOD"
                              : "NOT GOOD"}
                          </span>
                        </div>

                        <div
                          className="
                            hidden
                            min-w-[90px]
                            md:block
                          "
                        >
                          <p
                            className="
                              text-[10px]
                              uppercase
                              text-slate-400
                            "
                          >
                            Défauts
                          </p>

                          <p
                            className={`
                              text-sm
                              font-bold
                              ${
                                nbDefauts > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            `}
                          >
                            {nbDefauts}
                          </p>
                        </div>

                        <ChevronRight
                          size={19}
                          className="
                            shrink-0
                            text-slate-300
                            transition
                            group-hover:text-teal-600
                          "
                        />
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {selectedInspection && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            p-4
            backdrop-blur-sm
          "
          onClick={() =>
            setSelectedInspection(
              null
            )
          }
        >
          <div
            className="
              max-h-[90vh]
              w-full
              max-w-4xl
              overflow-y-auto
              rounded-2xl
              bg-white
              shadow-2xl
              dark:bg-slate-900
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* HEADER */}

            <div
              className="
                sticky
                top-0
                z-10
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                bg-white
                px-5
                py-4
                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Détail de l'inspection
                </h2>

                <p
                  className="
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {selectedInspection.sn ||
                    "-"}
                </p>
              </div>

              <button
                onClick={() =>
                  setSelectedInspection(
                    null
                  )
                }
                className="
                  rounded-lg
                  p-2
                  hover:bg-slate-100
                  dark:hover:bg-slate-800
                "
              >
                <X size={21} />
              </button>
            </div>

            {/* BODY */}

            <div className="space-y-5 p-5">
              {/* INFOS */}

              <div
                className="
                  grid
                  grid-cols-1
                  gap-3
                  sm:grid-cols-3
                "
              >
                <div
                  className="
                    rounded-xl
                    border
                    bg-slate-50
                    p-4
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                >
                  <p className="text-[10px] uppercase text-slate-400">
                    SN
                  </p>

                  <p className="mt-1 font-bold dark:text-white">
                    {selectedInspection.sn ||
                      "-"}
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    bg-slate-50
                    p-4
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                >
                  <p className="text-[10px] uppercase text-slate-400">
                    Date
                  </p>

                  <p className="mt-1 dark:text-slate-300">
                    {formatDate(
                      getInspectionDate(
                        selectedInspection
                      )
                    )}
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    bg-slate-50
                    p-4
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                >
                  <p className="text-[10px] uppercase text-slate-400">
                    Résultat
                  </p>

                  <p
                    className={`
                      mt-1
                      font-bold
                      ${
                        getResultat(
                          selectedInspection
                        )
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    `}
                  >
                    {getResultat(
                      selectedInspection
                    )
                      ? "GOOD"
                      : "NOT GOOD"}
                  </p>
                </div>
              </div>

              {/* DEFAUTS */}

              <div
                className="
                  overflow-hidden
                  rounded-xl
                  border
                  dark:border-slate-700
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    border-b
                    bg-slate-50
                    px-4
                    py-3
                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                >
                  <AlertTriangle
                    size={18}
                    className="text-amber-500"
                  />

                  <h3 className="font-bold dark:text-white">
                    Défauts détectés
                  </h3>
                </div>

                <div className="p-4">
                  {selectedInspection
                    .defauts
                    ?.length ? (
                    <div className="space-y-2">
                      {selectedInspection.defauts.map(
                        (
                          defaut,
                          i
                        ) => (
                          <div
                            key={
                              defaut.id ??
                              i
                            }
                            className="
                              rounded-lg
                              border
                              border-red-100
                              bg-red-50
                              p-3
                              dark:border-red-500/20
                              dark:bg-red-500/10
                            "
                          >
                            <p className="font-semibold text-red-700">
                              {defaut.nom ||
                                defaut.type ||
                                defaut.description ||
                                `Défaut ${
                                  i + 1
                                }`}
                            </p>

                            {defaut.zone
                              ?.nom && (
                              <p className="mt-1 text-xs font-medium text-red-500">
                                Zone :{" "}
                                {
                                  defaut
                                    .zone
                                    .nom
                                }
                              </p>
                            )}

                            {defaut.description && (
                              <p className="mt-1 text-sm text-red-600">
                                {
                                  defaut.description
                                }
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle
                        size={18}
                      />

                      Aucun défaut détecté
                    </div>
                  )}
                </div>
              </div>

              {/* IMAGES */}

              <div>
                <h3
                  className="
                    mb-3
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Captures de l'inspection
                </h3>

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-4
                    sm:grid-cols-2
                  "
                >
                  {[
                    {
                      title: "Caméra TOP",
                      path:
                        getInspectionImage(
                          selectedInspection,
                          "TOP"
                        ),
                    },
                    {
                      title:
                        "Caméra BOTTOM",
                      path:
                        getInspectionImage(
                          selectedInspection,
                          "BOTTOM"
                        ),
                    },
                  ].map(
                    (
                      camera,
                      index
                    ) => (
                      <div
                        key={index}
                        className="
                          overflow-hidden
                          rounded-xl
                          border
                          dark:border-slate-700
                        "
                      >
                        <div
                          className="
                            border-b
                            bg-slate-50
                            px-4
                            py-2
                            dark:border-slate-700
                            dark:bg-slate-800
                          "
                        >
                          <p className="text-sm font-semibold dark:text-slate-200">
                            {
                              camera.title
                            }
                          </p>
                        </div>

                        {camera.path ? (
                          <img
                            src={getImageUrl(
                              camera.path
                            )}
                            alt={
                              camera.title
                            }
                            className="
                              h-64
                              w-full
                              bg-slate-950
                              object-contain
                            "
                            onError={(
                              event
                            ) => {
                              console.error(
                                "Erreur image :",
                                getImageUrl(
                                  camera.path
                                )
                              );

                              event.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div
                            className="
                              flex
                              h-64
                              items-center
                              justify-center
                              text-slate-400
                            "
                          >
                            Aucune capture
                          </div>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}