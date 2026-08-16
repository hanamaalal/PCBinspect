"use client";

import Link from "next/link";
import {
  Clock3,
  User,
  ArrowRight,
  Trash2,
} from "lucide-react";

import { deletePcbCard } from "@/lib/api";

interface Props {
  card: any;
  onDelete?: (id: string) => void;
}

export default function PcbCard({
  card,
  onDelete,
}: Props) {
  const imageUrl =
    card.imageTop
      ? card.imageTop.startsWith("http")
        ? card.imageTop
        : `http://localhost:3001/${card.imageTop}`
      : card.imageBottom
        ? card.imageBottom.startsWith("http")
          ? card.imageBottom
          : `http://localhost:3001/${card.imageBottom}`
        : "/images/no-image.png";

  // =============================
  // SUPPRESSION
  // =============================

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Voulez-vous supprimer cette inspection ?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deletePcbCard(card.id);

      if (onDelete) {
        onDelete(card.id);
      }
    } catch (error) {
      console.error(
        "Erreur suppression :",
        error
      );

      alert(
        "Impossible de supprimer cette carte"
      );
    }
  };

  return (
    <div
      className="
        group
        overflow-hidden
        rounded-xl
        border
        border-gray-200
        bg-white
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-lg

        dark:border-[#31565a]
        dark:bg-[#16383bc7]
        dark:shadow-lg
        dark:hover:border-[#467276]
      "
    >

      {/* =================================================
          IMAGE
      ================================================= */}

      <div
        className="
          relative
          overflow-hidden
          bg-gray-100

          dark:bg-[#102a2d]
        "
      >
        <img
          src={imageUrl}
          alt={card.sn}
          className="
            h-32
            w-full
            object-cover
            transition-transform
            duration-300
            group-hover:scale-105
          "
        />

        {/* SN */}

        <div
          className="
            absolute
            left-3
            top-3
            rounded-full
            bg-black/70
            px-4
            py-1
            text-sm
            font-semibold
            text-white
            backdrop-blur-sm
          "
        >
          SN : {card.sn}
        </div>

        {/* RESULTAT */}

        <div
          className={`
            absolute
            right-3
            top-3
            rounded-full
            px-4
            py-1
            text-xs
            font-bold
            text-white
            shadow-sm

            ${
              card.resultat === "GOOD"
                ? "bg-green-600/90"
                : "bg-red-600/90"
            }
          `}
        >
          {card.resultat === "GOOD"
            ? "GOOD"
            : "NG"}
        </div>
      </div>

      {/* =================================================
          CONTENU
      ================================================= */}

      <div className="p-5">

        {/* OF / PRF / DATE */}

        <div className="flex justify-between gap-4">

          <div className="space-y-1">

            <p
              className="
                text-sm
                font-semibold
                text-gray-800
                dark:text-gray-100
              "
            >
              {card.of}
            </p>

            <p
              className="
                text-sm
                font-medium
                text-gray-500
                dark:text-gray-300
              "
            >
              {card.prf}
            </p>

          </div>

          <div className="text-right">

            <div
              className="
                flex
                items-center
                justify-end
                gap-1
                text-gray-500
                dark:text-gray-300
              "
            >
              <Clock3 size={16} />

              <span className="text-sm">
                {new Date(
                  card.dateHeure
                ).toLocaleTimeString(
                  "fr-FR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )}
              </span>
            </div>

            <p
              className="
                text-sm
                text-gray-500
                dark:text-gray-400
              "
            >
              {new Date(
                card.dateHeure
              ).toLocaleDateString(
                "fr-FR"
              )}
            </p>

          </div>
        </div>

        {/* SEPARATEUR */}

        <hr
          className="
            my-4
            border-gray-200
            dark:border-[#31565a]
          "
        />

        {/* =================================================
            BAS
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
          "
        >

          {/* OPERATEUR */}

          <div
            className="
              flex
              min-w-0
              items-center
              gap-2
            "
          >
            <User
              size={15}
              className="
                shrink-0
                text-gray-500
                dark:text-gray-300
              "
            />

            <span
              className="
                truncate
                text-sm
                font-medium
                text-gray-700
                dark:text-gray-200
              "
            >
              {card.operateur}
            </span>
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
            "
          >

            {/* DELETE */}

            <button
              onClick={handleDelete}
              title="Supprimer"
              className="
                flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-3
                py-1.5
                text-xs
                font-semibold
                text-red-600
                transition-all
                duration-200

                hover:border-red-300
                hover:bg-red-100

                dark:border-red-400/30
                dark:bg-red-500/10
                dark:text-red-300
                dark:hover:border-red-400/50
                dark:hover:bg-red-500/20
                dark:hover:text-red-200
              "
            >
              <Trash2 size={14} />

              
            </button>

            {/* DETAILS */}

            <Link
              href={`/dashboard/pcb_card/detail/${card.id}`}
              className="
                flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-teal-200
                bg-teal-50
                px-3
                py-1.5
                text-xs
                font-semibold
                text-teal-700
                transition-all
                duration-200

                hover:border-teal-300
                hover:bg-teal-100

                dark:border-teal-400/30
                dark:bg-teal-500/10
                dark:text-teal-300
                dark:hover:border-teal-400/50
                dark:hover:bg-teal-500/20
                dark:hover:text-teal-200
              "
            >
              

              <ArrowRight
                size={14}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}

