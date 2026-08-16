"use client";

import { Play, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

export function ProductionCard() {
  const router = useRouter();

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
      <div className="flex items-center justify-between gap-6">

        {/* =====================================================
            CONTENU
        ===================================================== */}

        <div>
          <h3
            className="
              text-lg
              font-bold
              text-gray-900
              transition-colors
              duration-300
              dark:text-white
            "
          >
            Lancer le Mode Production
          </h3>

          <p
            className="
              mt-2
              max-w-xl
              text-sm
              leading-relaxed
              text-gray-500
              transition-colors
              duration-300
              dark:text-slate-400
            "
          >
            Assurez-vous que l'ordre de fabrication (OF) est correct
            pour démarrer le Mode d'inspection
          </p>

          {/* =================================================
              BOUTON
          ================================================= */}

          <button
            onClick={() => router.push("/dashboard/production")}
            className="
              mt-5
              flex
              items-center
              gap-2
              rounded-lg
              bg-teal-600
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              shadow-sm
              transition-all
              duration-200
              hover:bg-teal-700
              hover:shadow-md
              focus:outline-none
              focus:ring-2
              focus:ring-teal-500/40
              dark:bg-teal-500
              dark:hover:bg-teal-400
              dark:focus:ring-teal-400/40
            "
          >
            <Play
              size={16}
              fill="currentColor"
            />

            Démarrer Mode d&apos;inspection

            <ArrowRight size={16} />
          </button>
        </div>

        {/* =====================================================
            ICÔNE
        ===================================================== */}

        <span
          className="
            flex
            h-16
            w-16
            flex-shrink-0
            items-center
            justify-center
            rounded-full
            border-4
            border-gray-200
            bg-gray-50
            text-gray-500
            transition-all
            duration-300
            dark:border-slate-700
            dark:bg-slate-800
            dark:text-teal-400
          "
        >
          <Play
            size={20}
            fill="currentColor"
          />
        </span>
      </div>
    </Card>
  );
}
