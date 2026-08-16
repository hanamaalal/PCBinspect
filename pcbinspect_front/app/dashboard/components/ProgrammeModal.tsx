"use client";

import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  zones: {
    nom: string;
  }[];
  setZones: (
    value: {
      nom: string;
    }[]
  ) => void;
  edit: boolean;
}

export default function ProgrammeModal({
  open,
  onClose,
  onSave,
  zones,
  setZones,
  edit,
}: Props) {
  if (!open) return null;

  const addZone = () => {
    setZones([
      ...zones,
      {
        nom: "",
      },
    ]);
  };

  const removeZone = (index: number) => {
    setZones(
      zones.filter((_, i) => i !== index)
    );
  };

  const changeZone = (
    index: number,
    value: string
  ) => {
    const copy = [...zones];

    copy[index].nom = value;

    setZones(copy);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="
          w-full
          max-w-[450px]
          max-h-[90vh]
          overflow-y-auto
          rounded-2xl
          border
          border-gray-200
          bg-white
          p-6
          shadow-2xl
          transition-colors
          duration-300

          dark:border-slate-800
          dark:bg-slate-900
        "
      >
        {/* HEADER */}
        <div
          className="
            mb-5
            flex
            items-center
            justify-between
            border-b
            border-gray-100
            pb-4

            dark:border-slate-800
          "
        >
          <div>
            <h2
              className="
                text-xl
                font-bold
                text-gray-900

                dark:text-white
              "
            >
              {edit
                ? "Modifier programme"
                : "Ajouter programme"}
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500

                dark:text-slate-400
              "
            >
              Configurez les zones du programme
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-gray-500
              transition-all
              duration-200

              hover:bg-gray-100
              hover:text-gray-900

              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-white
            "
          >
            <X size={21} />
          </button>
        </div>

        {/* ZONES */}
        <div className="space-y-3">
          <label
            className="
              block
              text-xs
              font-medium
              text-gray-600

              dark:text-slate-300
            "
          >
            Zones
          </label>

          {zones.map((zone, index) => (
            <div
              key={index}
              className="flex gap-2"
            >
              <input
                value={zone.nom}
                onChange={(e) =>
                  changeZone(
                    index,
                    e.target.value
                  )
                }
                placeholder={`Zone ${index + 1}`}
                className="
                  h-10
                  flex-1
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  px-3
                  text-sm
                  text-gray-900
                  outline-none
                  transition-all
                  duration-200

                  placeholder:text-gray-400

                  focus:border-teal-500
                  focus:ring-2
                  focus:ring-teal-500/20

                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-white
                  dark:placeholder:text-slate-500

                  dark:focus:border-teal-400
                  dark:focus:ring-teal-400/20
                "
              />

              <button
                type="button"
                onClick={() =>
                  removeZone(index)
                }
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-red-50
                  text-red-600
                  transition-all
                  duration-200

                  hover:bg-red-100

                  dark:bg-red-950/40
                  dark:text-red-400
                  dark:hover:bg-red-950/70
                "
                title="Supprimer la zone"
              >
                <X size={18} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addZone}
            className="
              rounded-lg
              border
              border-gray-200
              bg-gray-100
              px-4
              py-2
              text-sm
              font-medium
              text-gray-700
              transition-all
              duration-200

              hover:border-teal-300
              hover:bg-teal-50
              hover:text-teal-700

              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-200

              dark:hover:border-teal-500
              dark:hover:bg-teal-500
              dark:hover:text-slate-950
            "
          >
            + Ajouter zone
          </button>
        </div>

        {/* FOOTER */}
        <div
          className="
            mt-6
            flex
            justify-end
            gap-3
            border-t
            border-gray-100
            pt-5

            dark:border-slate-800
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              border
              border-gray-300
              bg-white
              px-4
              py-2
              text-sm
              font-medium
              text-gray-700
              transition-all
              duration-200

              hover:border-teal-400
              hover:bg-teal-50
              hover:text-teal-700

              dark:border-slate-700
              dark:bg-slate-800
              dark:text-slate-200

              dark:hover:border-teal-500
              dark:hover:bg-teal-500
              dark:hover:text-slate-950
            "
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={onSave}
            className="
              rounded-lg
              bg-gray-900
              px-5
              py-2
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200

              hover:bg-gray-800

              dark:bg-teal-500
              dark:text-slate-950
              dark:hover:bg-teal-400
            "
          >
            {edit ? "Modifier" : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}