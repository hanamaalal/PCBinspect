"use client";

import { InspectionDetails } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface DefautModalProps {
  details: InspectionDetails;
  onClose: () => void;
}

export default function DefautModal({
  details,
  onClose,
}: DefautModalProps) {
  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        p-4
        backdrop-blur-sm

        dark:bg-black/70
      "
    >
      <div
        className="
          w-full
          max-w-[420px]
          overflow-hidden
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-2xl
          transition-colors
          duration-300

          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div
          className="
            relative
            border-b
            border-teal-200
            bg-teal-50
            px-5
            py-4

            dark:border-teal-900/60
            dark:bg-[#0b2528]
          "
        >
          {/* SN */}

          <h3
            className="
              pr-24
              text-lg
              font-bold
              text-gray-900

              dark:text-white
            "
          >
            {details.sn}
          </h3>

          {/* OF + HEURE */}

          <p
            className="
              mt-1
              text-sm
              text-gray-600

              dark:text-slate-400
            "
          >
            {details.of} -
            {" "}
            {new Date(
              details.dateHeure
            ).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {/* =================================================
              RESULTAT
          ================================================= */}

          <div
            className={`
              absolute
              right-4
              top-4
              inline-flex
              items-center
              rounded-full
              px-3
              py-1
              text-xs
              font-bold

              ${
                details.resultat === "GOOD"
                  ? `
                    bg-green-100
                    text-green-700

                    dark:bg-green-500/15
                    dark:text-green-400
                  `
                  : `
                    bg-red-100
                    text-red-700

                    dark:bg-red-500/15
                    dark:text-red-400
                  `
              }
            `}
          >
            {details.resultat === "GOOD"
              ? "GOOD"
              : "NOT GOOD"}
          </div>
        </div>

        {/* =====================================================
            LISTE DES DÉFAUTS
        ===================================================== */}

        <div
          className="
            max-h-[400px]
            overflow-y-auto
            px-5
            py-2

            divide-y
            divide-gray-100

            dark:divide-slate-800
          "
        >
          {details.defauts.length === 0 ? (
            <p
              className="
                py-6
                text-center
                text-sm
                text-gray-500

                dark:text-slate-400
              "
            >
              Aucun défaut détecté
            </p>
          ) : (
            details.defauts.map((defaut) => (
              <div
                key={defaut.id}
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  py-4
                "
              >
                {/* =================================================
                    INFORMATIONS DÉFAUT
                ================================================= */}

                <div className="min-w-0">
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-gray-800

                      dark:text-slate-200
                    "
                  >
                    {defaut.defaut}
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-gray-500

                      dark:text-slate-500
                    "
                  >
                    Zone : {defaut.zone}
                  </p>
                </div>

                {/* =================================================
                    JUGEMENT OPÉRATEUR
                ================================================= */}

                {details.jugementOperateurBO && (
                  <div className="shrink-0">
                    <Badge
                      variant={
                        defaut.jugement === "EN_ATTENTE"
                          ? "pending"
                          : defaut.jugement === "PASS"
                          ? "confirmed"
                          : "refused"
                      }
                    >
                      {defaut.jugement === "EN_ATTENTE"
                        ? "EN ATTENTE"
                        : defaut.jugement === "PASS"
                        ? "Confirmé"
                        : "Refusé"}
                    </Badge>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div
          className="
            border-t
            border-gray-200
            p-4

            dark:border-slate-800
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              w-full
              rounded-lg
              bg-gray-900
              py-2.5
              font-semibold
              text-white
              transition-all
              duration-200

              hover:bg-gray-800

              dark:bg-teal-500
              dark:text-slate-950
              dark:hover:bg-teal-400
            "
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
