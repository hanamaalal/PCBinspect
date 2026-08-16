"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  CheckCircle,
  XCircle,
  Clock3,
  Camera,
  History,
  CircleStop,
  ChevronRight,
  X,
  AlertTriangle,
} from "lucide-react";

import { socket } from "@/lib/socket";
import { getInspectByPRF } from "@/lib/api";

import RobotCameraTop from "../components/Robot_cameraTop";
import RobotCameraBottom from "../components/Robot_cameraBottom";

export default function InspectionPage() {
  const params = useSearchParams();

  const PRF = params.get("PRF");

  // =====================================================
  // ETATS INSPECTION ACTUELLE
  // =====================================================

  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [SN, setSN] = useState("");

  const [status, setStatus] = useState(
    "Inspection en cours"
  );

  // =====================================================
  // HISTORIQUE
  // =====================================================

  const [inspections, setInspections] = useState<any[]>([]);

  // =====================================================
  // MODAL DETAIL
  // =====================================================

  const [selectedInspection, setSelectedInspection] =
    useState<any>(null);

  // =====================================================
  // CHARGER HISTORIQUE
  // =====================================================

  const chargerInspections = async () => {
    if (!PRF) {
      return;
    }

    try {
      const data = await getInspectByPRF(PRF);

      console.log("INSPECTIONS :", data);

      setInspections(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      console.error(
        "Erreur chargement inspections :",
        error
      );
    }
  };

  // =====================================================
  // INITIALISATION
  // =====================================================

  useEffect(() => {
    chargerInspections();
  }, [PRF]);

  // =====================================================
  // SOCKET
  // =====================================================

  useEffect(() => {
    if (!PRF) {
      return;
    }

    socket.emit(
      "inspection:join",
      PRF
    );

    // ===================================================
    // PROGRESSION
    // ===================================================

    const updateHandler = (data: any) => {
      console.log(
        "PROGRESSION :",
        data
      );

      if (data?.PRF !== PRF) {
        return;
      }

      setSN(
        data?.SN || ""
      );

      setProgress(
        Number(data?.progress || 0)
      );

      setStep(
        data?.step || ""
      );

      setRemaining(
        Number(data?.remaining || 0)
      );

      setStatus(
        "Inspection en cours"
      );
    };

    // ===================================================
    // NOUVELLE INSPECTION
    // ===================================================

    const newHandler = async (data: any) => {
      console.log(
        "NOUVELLE INSPECTION :",
        data
      );

      if (data?.PRF !== PRF) {
        return;
      }

      await chargerInspections();

      if (data?.resultat === "GOOD") {
        setStatus(
          "Inspection terminée - GOOD"
        );
      } else {
        setStatus(
          "Inspection terminée - NOT GOOD"
        );
      }

      setProgress(100);
      setRemaining(0);
    };

    // ===================================================
    // STOP
    // ===================================================

    const stopHandler = (data: any) => {
      console.log(
        "INSPECTION STOPPED :",
        data
      );

      setStatus(
        data?.message ||
          "Inspection arrêtée"
      );

      setProgress(0);
      setRemaining(0);
      setStep("");
    };

    socket.on(
      "inspection:update",
      updateHandler
    );

    socket.on(
      "inspection:new",
      newHandler
    );

    socket.on(
      "inspection:stopped",
      stopHandler
    );

    // ===================================================
    // CLEAN
    // ===================================================

    return () => {
      socket.off(
        "inspection:update",
        updateHandler
      );

      socket.off(
        "inspection:new",
        newHandler
      );

      socket.off(
        "inspection:stopped",
        stopHandler
      );
    };
  }, [PRF]);

  // =====================================================
  // STOP
  // =====================================================

  const stopInspection = () => {
    if (!PRF) {
      return;
    }

    socket.emit(
      "inspection:stop",
      {
        PRF,
      }
    );
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date: any) => {
    if (!date) {
      return "-";
    }

    try {
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
    } catch {
      return "-";
    }
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (
    image: string | null | undefined
  ) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
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
    inspection: any
  ) => {
    return inspection?.resultat === "GOOD";
  };

  // =====================================================
  // UI
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
          transition-colors
          duration-300

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
                  transition-colors
                  duration-300
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

          {/* PRF */}

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
          LIGNE PRINCIPALE
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

        {/* =================================================
            CAMERA TOP
        ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            transition-colors
            duration-300

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

              <div
                className="
                  rounded-lg
                  bg-teal-100
                  p-2

                  dark:bg-teal-500/15
                "
              >
                <Camera
                  size={19}
                  className="
                    text-teal-600
                    dark:text-teal-400
                  "
                />
              </div>

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

                <p
                  className="
                    text-xs
                    text-slate-400
                  "
                >
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

                dark:text-green-400
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

        {/* =================================================
            CAMERA BOTTOM
        ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            transition-colors
            duration-300

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

              <div
                className="
                  rounded-lg
                  bg-blue-100
                  p-2

                  dark:bg-blue-500/15
                "
              >
                <Camera
                  size={19}
                  className="
                    text-blue-600
                    dark:text-blue-400
                  "
                />
              </div>

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

                <p
                  className="
                    text-xs
                    text-slate-400
                  "
                >
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

                dark:text-green-400
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

        {/* =================================================
            INSPECTION ACTUELLE
        ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-sm
            transition-colors
            duration-300

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

              <div
                className="
                  rounded-lg
                  bg-teal-100
                  p-2

                  dark:bg-teal-500/15
                "
              >
                <Clock3
                  size={19}
                  className="
                    text-teal-600
                    dark:text-teal-400
                  "
                />
              </div>

              <div>

                <h2
                  className="
                    font-bold
                    text-slate-900

                    dark:text-white
                  "
                >
                  Inspection actuelle
                </h2>

                <p
                  className="
                    text-xs
                    text-slate-400
                  "
                >
                  Suivi en temps réel
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
                className={
                  status.includes("GOOD") &&
                  !status.includes("NOT")
                    ? `
                      rounded-full
                      bg-green-50
                      px-3
                      py-1
                      text-xs
                      font-bold
                      text-green-700

                      dark:bg-green-500/15
                      dark:text-green-400
                    `
                    : status.includes("NOT GOOD")
                      ? `
                        rounded-full
                        bg-red-50
                        px-3
                        py-1
                        text-xs
                        font-bold
                        text-red-700

                        dark:bg-red-500/15
                        dark:text-red-400
                      `
                      : `
                        rounded-full
                        bg-teal-50
                        px-3
                        py-1
                        text-xs
                        font-bold
                        text-teal-700

                        dark:bg-teal-500/15
                        dark:text-teal-400
                      `
                }
              >
                {status}
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

              {/* PROGRESS */}

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

                <span
                  className="
                    text-xs
                    text-slate-400
                  "
                >
                  Progression
                </span>

                <span
                  className="
                    text-sm
                    font-bold
                    text-teal-600

                    dark:text-teal-400
                  "
                >
                  {progress}%
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
                  className="
                    text-slate-400
                  "
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
                {remaining}s
              </span>

            </div>

            {/* STOP */}

            <button
              onClick={stopInspection}
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

                dark:bg-red-600
                dark:hover:bg-red-500
              "
            >

              <CircleStop size={18} />

              Arrêter l'inspection

            </button>

          </div>

        </div>

      </div>

      {/* =================================================
          HISTORIQUE — PLEINE LARGEUR
      ================================================= */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
          transition-colors
          duration-300

          dark:border-slate-800
          dark:bg-slate-900
        "
      >

        {/* HEADER */}

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

            <div
              className="
                rounded-xl
                bg-purple-100
                p-2.5

                dark:bg-purple-500/15
              "
            >
              <History
                size={21}
                className="
                  text-purple-600

                  dark:text-purple-400
                "
              />
            </div>

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
                Historique de la PRF {PRF || "-"}
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

        {/* LISTE */}

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
                Aucune inspection enregistrée
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
                  inspection: any,
                  index: number
                ) => {

                  const isGood =
                    getResultat(
                      inspection
                    );

                  const inspectionDate =
                    inspection.dateHeure ||
                    inspection.createdAt ||
                    inspection.date;

                  const nbDefauts =
                    inspection.defauts?.length ?? 0;

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

                        {/* RESULT ICON */}

                        <div
                          className={
                            isGood
                              ? `
                                shrink-0
                                rounded-lg
                                bg-green-100
                                p-2

                                dark:bg-green-500/15
                              `
                              : `
                                shrink-0
                                rounded-lg
                                bg-red-100
                                p-2

                                dark:bg-red-500/15
                              `
                          }
                        >

                          {isGood ? (

                            <CheckCircle
                              size={20}
                              className="
                                text-green-600

                                dark:text-green-400
                              "
                            />

                          ) : (

                            <XCircle
                              size={20}
                              className="
                                text-red-600

                                dark:text-red-400
                              "
                            />

                          )}

                        </div>

                        {/* SN */}

                        <div className="min-w-[120px]">

                          <p
                            className="
                              text-sm
                              font-bold
                              text-slate-900

                              dark:text-white
                            "
                          >
                            {inspection.sn || "-"}
                          </p>

                          <p
                            className="
                              text-[11px]
                              text-slate-400
                            "
                          >
                            Inspection #{inspections.length - index}
                          </p>

                        </div>

                        {/* DATE */}

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

                        {/* RESULTAT */}

                        <div className="hidden sm:block">

                          <span
                            className={
                              isGood
                                ? `
                                  rounded-full
                                  bg-green-100
                                  px-3
                                  py-1
                                  text-xs
                                  font-bold
                                  text-green-700

                                  dark:bg-green-500/15
                                  dark:text-green-400
                                `
                                : `
                                  rounded-full
                                  bg-red-100
                                  px-3
                                  py-1
                                  text-xs
                                  font-bold
                                  text-red-700

                                  dark:bg-red-500/15
                                  dark:text-red-400
                                `
                            }
                          >
                            {isGood
                              ? "GOOD"
                              : "NOT GOOD"}
                          </span>

                        </div>

                        {/* DEFAUTS */}

                        <div className="hidden min-w-[90px] md:block">

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
                            className={
                              nbDefauts > 0
                                ? `
                                  text-sm
                                  font-bold
                                  text-red-600

                                  dark:text-red-400
                                `
                                : `
                                  text-sm
                                  font-bold
                                  text-green-600

                                  dark:text-green-400
                                `
                            }
                          >
                            {nbDefauts}
                          </p>

                        </div>

                        {/* ARROW */}

                        <ChevronRight
                          size={19}
                          className="
                            shrink-0
                            text-slate-300
                            transition

                            group-hover:text-teal-600

                            dark:text-slate-600
                            dark:group-hover:text-teal-400
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
          MODAL DETAIL INSPECTION
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

            dark:bg-black/70
          "
          onClick={() =>
            setSelectedInspection(null)
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

              dark:border
              dark:border-slate-800
              dark:bg-slate-900
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

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

              <div className="flex items-center gap-3">

                <div
                  className={
                    getResultat(
                      selectedInspection
                    )
                      ? `
                        rounded-xl
                        bg-green-100
                        p-2.5

                        dark:bg-green-500/15
                      `
                      : `
                        rounded-xl
                        bg-red-100
                        p-2.5

                        dark:bg-red-500/15
                      `
                  }
                >

                  {getResultat(
                    selectedInspection
                  ) ? (

                    <CheckCircle
                      size={22}
                      className="
                        text-green-600

                        dark:text-green-400
                      "
                    />

                  ) : (

                    <XCircle
                      size={22}
                      className="
                        text-red-600

                        dark:text-red-400
                      "
                    />

                  )}

                </div>

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
                    {selectedInspection.sn || "-"}
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  setSelectedInspection(null)
                }
                className="
                  rounded-lg
                  p-2
                  transition

                  hover:bg-slate-100

                  dark:hover:bg-slate-800
                "
              >

                <X
                  size={21}
                  className="
                    text-slate-500

                    dark:text-slate-400
                  "
                />

              </button>

            </div>

            {/* MODAL BODY */}

            <div className="space-y-5 p-5">

              {/* INFORMATIONS */}

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50
                    p-4

                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                >

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    SN
                  </p>

                  <p
                    className="
                      mt-1
                      font-bold
                      text-slate-900

                      dark:text-white
                    "
                  >
                    {selectedInspection.sn || "-"}
                  </p>

                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50
                    p-4

                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                >

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    Date
                  </p>

                  <p
                    className="
                      mt-1
                      font-medium
                      text-slate-700

                      dark:text-slate-300
                    "
                  >
                    {formatDate(
                      selectedInspection.dateHeure ||
                        selectedInspection.createdAt ||
                        selectedInspection.date
                    )}
                  </p>

                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-100
                    bg-slate-50
                    p-4

                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                >

                  <p
                    className="
                      text-[10px]
                      uppercase
                      tracking-wide
                      text-slate-400
                    "
                  >
                    Résultat
                  </p>

                  <p
                    className={
                      getResultat(
                        selectedInspection
                      )
                        ? `
                          mt-1
                          font-bold
                          text-green-600

                          dark:text-green-400
                        `
                        : `
                          mt-1
                          font-bold
                          text-red-600

                          dark:text-red-400
                        `
                    }
                  >
                    {getResultat(
                      selectedInspection
                    )
                      ? "GOOD"
                      : "NOT GOOD"}
                  </p>

                </div>

              </div>

              {/* =================================================
                  DEFAUTS
              ================================================= */}

              <div
                className="
                  overflow-hidden
                  rounded-xl
                  border
                  border-slate-200

                  dark:border-slate-700
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    border-b
                    border-slate-100
                    bg-slate-50
                    px-4
                    py-3

                    dark:border-slate-700
                    dark:bg-slate-800
                  "
                >

                  <AlertTriangle
                    size={18}
                    className="
                      text-amber-500
                    "
                  />

                  <h3
                    className="
                      font-bold
                      text-slate-900

                      dark:text-white
                    "
                  >
                    Défauts détectés
                  </h3>

                  <span
                    className="
                      ml-auto
                      rounded-full
                      bg-slate-200
                      px-2
                      py-0.5
                      text-xs
                      font-bold
                      text-slate-700

                      dark:bg-slate-700
                      dark:text-slate-200
                    "
                  >
                    {selectedInspection.defauts?.length ?? 0}
                  </span>

                </div>

                <div className="p-4">

                  {selectedInspection.defauts?.length ? (

                    <div className="space-y-2">

                      {selectedInspection.defauts.map(
                        (
                          defaut: any,
                          i: number
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

                            <p
                              className="
                                font-semibold
                                text-red-700

                                dark:text-red-400
                              "
                            >
                              {defaut.nom ||
                                defaut.type ||
                                defaut.description ||
                                `Défaut ${i + 1}`}
                            </p>

                            {defaut.description && (
                              <p
                                className="
                                  mt-1
                                  text-sm
                                  text-red-600

                                  dark:text-red-300
                                "
                              >
                                {defaut.description}
                              </p>
                            )}

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        text-green-600

                        dark:text-green-400
                      "
                    >

                      <CheckCircle
                        size={18}
                      />

                      <span className="font-medium">
                        Aucun défaut détecté
                      </span>

                    </div>

                  )}

                </div>

              </div>

              {/* =================================================
                  IMAGES
              ================================================= */}

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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  {selectedInspection.imagePathTop ? (

                    <div
                      className="
                        overflow-hidden
                        rounded-xl
                        border
                        border-slate-200

                        dark:border-slate-700
                      "
                    >

                      <div
                        className="
                          border-b
                          border-slate-100
                          bg-slate-50
                          px-4
                          py-2

                          dark:border-slate-700
                          dark:bg-slate-800
                        "
                      >

                        <p
                          className="
                            text-sm
                            font-semibold
                            text-slate-700

                            dark:text-slate-200
                          "
                        >
                          Caméra TOP
                        </p>

                      </div>

                      <img
                        src={getImageUrl(
                          selectedInspection.imagePathTop
                        )}
                        alt="Capture TOP"
                        className="
                          h-64
                          w-full
                          bg-slate-950
                          object-contain
                        "
                      />

                    </div>

                  ) : (

                    <div
                      className="
                        flex
                        h-64
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-dashed
                        border-slate-300
                        text-slate-400

                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-slate-500
                      "
                    >
                      Aucune capture TOP
                    </div>

                  )}

                  {selectedInspection.imagePathBottom ? (

                    <div
                      className="
                        overflow-hidden
                        rounded-xl
                        border
                        border-slate-200

                        dark:border-slate-700
                      "
                    >

                      <div
                        className="
                          border-b
                          border-slate-100
                          bg-slate-50
                          px-4
                          py-2

                          dark:border-slate-700
                          dark:bg-slate-800
                        "
                      >

                        <p
                          className="
                            text-sm
                            font-semibold
                            text-slate-700

                            dark:text-slate-200
                          "
                        >
                          Caméra BOTTOM
                        </p>

                      </div>

                      <img
                        src={getImageUrl(
                          selectedInspection.imagePathBottom
                        )}
                        alt="Capture BOTTOM"
                        className="
                          h-64
                          w-full
                          bg-slate-950
                          object-contain
                        "
                      />

                    </div>

                  ) : (

                    <div
                      className="
                        flex
                        h-64
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-dashed
                        border-slate-300
                        text-slate-400

                        dark:border-slate-700
                        dark:bg-slate-800
                        dark:text-slate-500
                      "
                    >
                      Aucune capture BOTTOM
                    </div>

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
