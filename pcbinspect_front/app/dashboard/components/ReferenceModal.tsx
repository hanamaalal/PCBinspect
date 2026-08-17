"use client";

import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: any;
  setForm: (value: any) => void;
  edit: boolean;
}

export default function ReferenceModal({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  edit,
}: Props) {
  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]:
        name === "longeurSN" ||
        name === "indicePartieFixe" ||
        name === "nombreSN"
          ? Number(value)
          : value,
    });
  };

  const handleBooleanChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    field: string
  ) => {
    setForm({
      ...form,
      [field]: e.target.value === "true",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className="
          w-full
          max-w-[650px]
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
        {/* ================= HEADER ================= */}
        <div
          className="
            mb-6
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
              {edit ? "Modifier référence" : "Ajouter référence"}
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
                dark:text-slate-400
              "
            >
              {edit
                ? "Modifier les paramètres de la référence"
                : "Créer une nouvelle référence"}
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

        {/* ================= FORMULAIRE ================= */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* ================= PRF ================= */}
          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-medium
                text-gray-600
                dark:text-slate-300
              "
            >
              PRF
            </label>

            <input
              type="text"
              name="PRF"
              value={form.PRF ?? ""}
              onChange={handleChange}
              placeholder="Ex : PRF001"
              className="
                h-10
                w-full
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
          </div>

          {/* ================= OF ================= */}
          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-medium
                text-gray-600
                dark:text-slate-300
              "
            >
              OF
            </label>

            <input
              type="text"
              name="OF"
              value={form.OF ?? ""}
              onChange={handleChange}
              placeholder="Ex : OF001"
              className="
                h-10
                w-full
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
          </div>

          {/* ================= LONGUEUR SN ================= */}
          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-medium
                text-gray-600
                dark:text-slate-300
              "
            >
              Longueur SN
            </label>

            <input
              type="number"
              min="1"
              name="longeurSN"
              value={form.longeurSN ?? ""}
              onChange={handleChange}
              placeholder="Ex : 12"
              className="
                h-10
                w-full
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
          </div>

          {/* ================= NOMBRE DE SN ================= */}
          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-medium
                text-gray-600
                dark:text-slate-300
              "
            >
              Nombre de cartes à inspecter
            </label>

            <input
              type="number"
              min="1"
              name="nombreSN"
              value={form.nombreSN ?? ""}
              onChange={handleChange}
              placeholder="Ex : 50"
              className="
                h-10
                w-full
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

            <p
              className="
                mt-1
                text-[11px]
                text-gray-400
                dark:text-slate-500
              "
            >
              Nombre total de cartes que le robot doit inspecter pour cet OF.
            </p>
          </div>

          {/* ================= INDICE PARTIE FIXE ================= */}
          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-medium
                text-gray-600
                dark:text-slate-300
              "
            >
              Indice partie fixe
            </label>

            <input
              type="number"
              min="0"
              name="indicePartieFixe"
              value={form.indicePartieFixe ?? ""}
              onChange={handleChange}
              placeholder="Ex : 1"
              className="
                h-10
                w-full
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
          </div>

          {/* ================= PARTIE FIXE ================= */}
          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-medium
                text-gray-600
                dark:text-slate-300
              "
            >
              Partie fixe
            </label>

            <input
              type="text"
              name="partieFixe"
              value={form.partieFixe ?? ""}
              onChange={handleChange}
              placeholder="Ex : ABC"
              className="
                h-10
                w-full
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
          </div>

          {/* ================= POST PARTIE FIXE ================= */}
          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-medium
                text-gray-600
                dark:text-slate-300
              "
            >
              Post partie fixe
            </label>

            <input
              type="text"
              name="postpartiefixe"
              value={form.postpartiefixe ?? ""}
              onChange={handleChange}
              placeholder="Ex : XYZ"
              className="
                h-10
                w-full
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
          </div>

          {/* ================= VERIFICATION SN ================= */}
          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-medium
                text-gray-600
                dark:text-slate-300
              "
            >
              Vérification SN
            </label>

            <select
              name="verifSN"
              value={String(form.verifSN ?? false)}
              onChange={(e) => handleBooleanChange(e, "verifSN")}
              className="
                h-10
                w-full
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

                focus:border-teal-500
                focus:ring-2
                focus:ring-teal-500/20

                dark:border-slate-700
                dark:bg-slate-800
                dark:text-white

                dark:focus:border-teal-400
                dark:focus:ring-teal-400/20
              "
            >
              <option value="true">Activée</option>
              <option value="false">Désactivée</option>
            </select>
          </div>

          {/* ================= INTERBLOCAGE ================= */}
          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-medium
                text-gray-600
                dark:text-slate-300
              "
            >
              Activation interblocage
            </label>

            <select
              name="activationInterblocage"
              value={String(form.activationInterblocage ?? false)}
              onChange={(e) =>
                handleBooleanChange(e, "activationInterblocage")
              }
              className="
                h-10
                w-full
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

                focus:border-teal-500
                focus:ring-2
                focus:ring-teal-500/20

                dark:border-slate-700
                dark:bg-slate-800
                dark:text-white

                dark:focus:border-teal-400
                dark:focus:ring-teal-400/20
              "
            >
              <option value="true">Activée</option>
              <option value="false">Désactivée</option>
            </select>
          </div>

          {/* ================= STATUT SN ================= */}
          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-medium
                text-gray-600
                dark:text-slate-300
              "
            >
              Statut SN
            </label>

            <select
              name="statutSN"
              value={form.statutSN ?? ""}
              onChange={handleChange}
              className="
                h-10
                w-full
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

                focus:border-teal-500
                focus:ring-2
                focus:ring-teal-500/20

                dark:border-slate-700
                dark:bg-slate-800
                dark:text-white

                dark:focus:border-teal-400
                dark:focus:ring-teal-400/20
              "
            >
              <option value="">Choisir</option>
              <option value="OK">OK</option>
              <option value="NOK">NOK</option>
            </select>
          </div>

          {/* ================= JUGEMENT OPERATEUR BO ================= */}
          <div>
            <label
              className="
                mb-1.5
                block
                text-xs
                font-medium
                text-gray-600
                dark:text-slate-300
              "
            >
              Jugement opérateur BO
            </label>

            <select
              name="jugementOperateurBO"
              value={String(form.jugementOperateurBO ?? false)}
              onChange={(e) =>
                handleBooleanChange(e, "jugementOperateurBO")
              }
              className="
                h-10
                w-full
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

                focus:border-teal-500
                focus:ring-2
                focus:ring-teal-500/20

                dark:border-slate-700
                dark:bg-slate-800
                dark:text-white

                dark:focus:border-teal-400
                dark:focus:ring-teal-400/20
              "
            >
              <option value="true">Activé</option>
              <option value="false">Désactivé</option>
            </select>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
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
          {/* ANNULER */}
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

          {/* AJOUTER / MODIFIER */}
          <button
            type="button"
            onClick={onSubmit}
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