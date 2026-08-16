
import { Bot, Camera } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusDot } from "@/components/ui/Badge";
import { UnitStatus } from "@/lib/types";

interface UnitsStatusProps {
  units: UnitStatus[];
}

function getUnitIcon(name: string) {
  if (name.toLowerCase().includes("caméra")) {
    return Camera;
  }

  return Bot;
}

export function UnitsStatus({
  units,
}: UnitsStatusProps) {
  /* =====================================================
     AUCUNE DONNÉE
  ===================================================== */

  if (!units || units.length === 0) {
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
        {/* TITRE */}

        <h3
          className="
            text-sm
            font-bold
            text-gray-900
            transition-colors
            duration-300
            dark:text-white
          "
        >
          Statut des unités
        </h3>

        {/* MESSAGE */}

        <p
          className="
            mt-4
            text-sm
            text-gray-500
            transition-colors
            duration-300
            dark:text-slate-400
          "
        >
          En attente des données...
        </p>
      </Card>
    );
  }

  /* =====================================================
     UNITÉS
  ===================================================== */

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
      {/* =================================================
          TITRE
      ================================================= */}

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
        Statut des unités
      </h3>

      {/* =================================================
          LISTE
      ================================================= */}

      <div className="space-y-3">
        {units.map((unit) => {
          const Icon = getUnitIcon(unit.name);

          return (
            <div
              key={unit.id}
              className="
                flex
                items-center
                justify-between
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                px-4
                py-3
                transition-all
                duration-200
                hover:border-teal-200
                hover:bg-teal-50/40
                dark:border-slate-800
                dark:bg-slate-800/50
                dark:hover:border-teal-900
                dark:hover:bg-slate-800
              "
            >
              {/* =================================================
                  NOM + ICÔNE
              ================================================= */}

              <span
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-gray-900
                  transition-colors
                  duration-300
                  dark:text-slate-100
                "
              >
                <Icon
                  size={18}
                  className="
                    text-gray-500
                    transition-colors
                    duration-300
                    dark:text-teal-400
                  "
                />

                {unit.name}
              </span>

              {/* =================================================
                  STATUT
              ================================================= */}

              <StatusDot
                status={
                  unit.status === "OK"
                    ? "ok"
                    : "nok"
                }
                label={unit.status}
                timestamp={
                  unit.status === "NOK"
                    ? unit.lastUpdate
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
