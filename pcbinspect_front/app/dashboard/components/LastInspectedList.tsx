import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface LastInspection {
  sn: string;
  resultat: string;
}

interface LastInspectedListProps {
  inspections: LastInspection[];
}

export function LastInspectedList({
  inspections,
}: LastInspectedListProps) {
  return (
    <Card
      className="
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
      {/* =====================================================
          TITRE
      ===================================================== */}

      <h3
        className="
          mb-4
          text-sm
          font-bold
          text-gray-900
          transition-colors
          duration-300
          dark:text-white
        "
      >
        Dernier SN inspecté
      </h3>

      {/* =====================================================
          LISTE
      ===================================================== */}

      <div
        className="
          divide-y
          divide-gray-100
          dark:divide-slate-800
        "
      >
        {inspections.length === 0 ? (
          <div className="py-6 text-center">
            <p
              className="
                text-sm
                text-gray-500
                transition-colors
                duration-300
                dark:text-slate-400
              "
            >
              Aucune inspection récente
            </p>
          </div>
        ) : (
          inspections.map((inspection) => (
            <div
              key={inspection.sn}
              className="
                flex
                items-center
                justify-between
                rounded-lg
                py-3
                transition-colors
                duration-200
                hover:bg-gray-50
                dark:hover:bg-slate-800/50
              "
            >
              {/* =================================================
                  SN
              ================================================= */}

              <span
                className="
                  text-sm
                  font-medium
                  text-gray-900
                  transition-colors
                  duration-300
                  dark:text-slate-100
                "
              >
                {inspection.sn}
              </span>

              {/* =================================================
                  RESULTAT
              ================================================= */}

              <Badge
                variant={
                  inspection.resultat === "GOOD"
                    ? "good"
                    : "not-good"
                }
              />
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

