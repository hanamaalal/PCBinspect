"use client";

import { useEffect, useState } from "react";
import {
  X,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

interface Zone {
  id: string;
  nom: string;
}

interface DefautAttendu {
  defautAttendu: string;
  zoneId: string;
}

interface CarteModele {
  id?: string;
  sn: string;
  PRF: string;
  imagePath?: string | null;
  defautAttendu?: {
    id?: string;
    defautAttendu: string;
    zoneId: string;
    zone?: {
      id: string;
      nom: string;
    };
  }[];
}

interface CarteModeleModalProps {
  open: boolean;
  onClose: () => void;

  PRF: string;
  zones: Zone[];

  carte?: CarteModele | null;

  onSave: (data: {
    sn: string;
    PRF: string;
    image: File | null;
    defautAttendu: DefautAttendu[];
  }) => Promise<void>;
}

export default function CarteModeleModal({
  open,
  onClose,
  PRF,
  zones,
  carte,
  onSave,
}: CarteModeleModalProps) {
  const [sn, setSn] = useState("");

  const [image, setImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [defauts, setDefauts] = useState<
    DefautAttendu[]
  >([]);

  const [error, setError] = useState("");

  const [saving, setSaving] =
    useState(false);

  // =====================================================
  // INITIALISATION
  // =====================================================

  useEffect(() => {
    if (!open) return;

    setError("");
    setImage(null);

    if (carte) {
      setSn(carte.sn);

      setDefauts(
        carte.defautAttendu?.map(
          (defaut) => ({
            defautAttendu:
              defaut.defautAttendu,
            zoneId: defaut.zoneId,
          })
        ) || []
      );

      if (carte.imagePath) {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL ||
          "http://localhost:3001";

        setImagePreview(
          carte.imagePath.startsWith("http")
            ? carte.imagePath
            : `${baseUrl}${carte.imagePath}`
        );
      } else {
        setImagePreview(null);
      }
    } else {
      setSn("");
      setDefauts([]);
      setImagePreview(null);
    }
  }, [open, carte]);

  // =====================================================
  // IMAGE
  // =====================================================

  function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Veuillez sélectionner une image."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "L'image ne doit pas dépasser 5 Mo."
      );
      return;
    }

    setError("");

    setImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  // =====================================================
  // AJOUTER DEFAUT
  // =====================================================

  function addDefaut() {
    if (zones.length === 0) {
      setError(
        "Aucune zone disponible pour ce programme."
      );
      return;
    }

    setDefauts((previous) => [
      ...previous,
      {
        defautAttendu: "",
        zoneId: zones[0].id,
      },
    ]);
  }

  // =====================================================
  // MODIFIER DEFAUT
  // =====================================================

  function updateDefaut(
    index: number,
    field: keyof DefautAttendu,
    value: string
  ) {
    setDefauts((previous) =>
      previous.map((defaut, i) =>
        i === index
          ? {
              ...defaut,
              [field]: value,
            }
          : defaut
      )
    );
  }

  // =====================================================
  // SUPPRIMER DEFAUT
  // =====================================================

  function removeDefaut(index: number) {
    setDefauts((previous) =>
      previous.filter(
        (_, i) => i !== index
      )
    );
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");

    if (!sn.trim()) {
      setError(
        "Le numéro de série est obligatoire."
      );
      return;
    }

    if (!PRF) {
      setError(
        "Aucun PRF sélectionné."
      );
      return;
    }

    if (zones.length === 0) {
      setError(
        "Ce programme ne possède aucune zone."
      );
      return;
    }

    for (const defaut of defauts) {
      if (!defaut.defautAttendu.trim()) {
        setError(
          "Tous les défauts doivent être renseignés."
        );
        return;
      }

      if (!defaut.zoneId) {
        setError(
          "Chaque défaut doit avoir une zone."
        );
        return;
      }
    }

    try {
      setSaving(true);

      await onSave({
        sn: sn.trim(),
        PRF,
        image,
        defautAttendu: defauts.map(
          (defaut) => ({
            defautAttendu:
              defaut.defautAttendu.trim(),
            zoneId: defaut.zoneId,
          })
        ),
      });

      onClose();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.message ||
          "Erreur lors de l'enregistrement."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/60
        p-4
      "
    >
      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-card
          shadow-2xl
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-border
            px-6
            py-4
          "
        >
          <div>
            <h2 className="text-lg font-bold text-text-primary">
              {carte
                ? "Modifier la carte modèle"
                : "Ajouter une carte modèle"}
            </h2>

            <p className="mt-1 text-xs text-text-secondary">
              Programme : {PRF}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="
              rounded-lg
              p-2
              text-text-secondary
              transition
              hover:bg-background
              hover:text-text-primary
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="
            overflow-y-auto
            p-6
          "
        >

          {/* ERROR */}

          {error && (
            <div
              className="
                mb-5
                rounded-lg
                border
                border-red-500/30
                bg-red-500/10
                px-4
                py-3
                text-sm
                text-red-500
              "
            >
              {error}
            </div>
          )}

          {/* =================================================
              SN
          ================================================= */}

          <div className="mb-5">
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-text-primary
              "
            >
              Numéro de série de la carte modèle
            </label>

            <input
              type="text"
              value={sn}
              onChange={(e) =>
                setSn(e.target.value)
              }
              placeholder="Ex : SN-MODELE-001"
              disabled={saving}
              className="
                w-full
                rounded-lg
                border
                border-border
                bg-background
                px-4
                py-3
                text-sm
                text-text-primary
                outline-none
                placeholder:text-text-secondary
                focus:border-primary
              "
            />
          </div>

          {/* =================================================
              PRF
          ================================================= */}

          <div className="mb-5">
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-text-primary
              "
            >
              PRF
            </label>

            <input
              type="text"
              value={PRF}
              disabled
              className="
                w-full
                cursor-not-allowed
                rounded-lg
                border
                border-border
                bg-background
                px-4
                py-3
                text-sm
                text-text-secondary
              "
            />
          </div>

          {/* =================================================
              IMAGE
          ================================================= */}

          <div className="mb-7">
            <label
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-text-primary
              "
            >
              Image de la carte modèle
            </label>

            <div
              className="
                overflow-hidden
                rounded-xl
                border
                border-dashed
                border-border
                bg-background
              "
            >

              {imagePreview ? (
                <div className="relative">

                  <img
                    src={imagePreview}
                    alt="Carte modèle"
                    className="
                      mx-auto
                      max-h-72
                      max-w-full
                      object-contain
                      p-4
                    "
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setImage(null);
                      setImagePreview(null);
                    }}
                    className="
                      absolute
                      right-3
                      top-3
                      rounded-lg
                      bg-black/60
                      p-2
                      text-white
                      hover:bg-black/80
                    "
                  >
                    <X size={17} />
                  </button>

                </div>
              ) : (
                <label
                  className="
                    flex
                    cursor-pointer
                    flex-col
                    items-center
                    justify-center
                    px-6
                    py-12
                    text-center
                  "
                >

                  <div
                    className="
                      mb-3
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-full
                      bg-primary/10
                      text-primary
                    "
                  >
                    <Upload size={25} />
                  </div>

                  <p className="text-sm font-semibold text-text-primary">
                    Cliquer pour choisir une image
                  </p>

                  <p className="mt-1 text-xs text-text-secondary">
                    PNG, JPG ou WEBP — 5 Mo maximum
                  </p>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={
                      handleImageChange
                    }
                  />

                </label>
              )}

            </div>
          </div>

          {/* =================================================
              DEFAUTS ATTENDUS
          ================================================= */}

          <div>

            <div
              className="
                mb-4
                flex
                items-center
                justify-between
              "
            >
              <div>
                <h3 className="text-sm font-bold text-text-primary">
                  Défauts attendus
                </h3>

                <p className="mt-1 text-xs text-text-secondary">
                  Définissez les défauts attendus pour chaque zone.
                </p>
              </div>

              <button
                type="button"
                onClick={addDefaut}
                disabled={
                  saving ||
                  zones.length === 0
                }
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-primary/10
                  px-3
                  py-2
                  text-xs
                  font-semibold
                  text-primary
                  hover:bg-primary/20
                  disabled:opacity-50
                "
              >
                <Plus size={15} />
                Ajouter un défaut
              </button>
            </div>

            {defauts.length === 0 ? (
              <div
                className="
                  rounded-xl
                  border
                  border-dashed
                  border-border
                  px-5
                  py-10
                  text-center
                "
              >
                <p className="text-sm text-text-secondary">
                  Aucun défaut attendu.
                </p>

                <button
                  type="button"
                  onClick={addDefaut}
                  disabled={
                    saving ||
                    zones.length === 0
                  }
                  className="
                    mt-3
                    text-sm
                    font-semibold
                    text-primary
                    hover:underline
                  "
                >
                  + Ajouter un défaut
                </button>
              </div>
            ) : (
              <div className="space-y-3">

                {defauts.map(
                  (defaut, index) => (
                    <div
                      key={index}
                      className="
                        rounded-xl
                        border
                        border-border
                        bg-background
                        p-4
                      "
                    >

                      <div
                        className="
                          mb-3
                          flex
                          items-center
                          justify-between
                        "
                      >
                        <span
                          className="
                            text-xs
                            font-bold
                            uppercase
                            tracking-wide
                            text-text-secondary
                          "
                        >
                          Défaut {index + 1}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            removeDefaut(
                              index
                            )
                          }
                          disabled={saving}
                          className="
                            rounded-lg
                            p-2
                            text-red-500
                            hover:bg-red-500/10
                          "
                        >
                          <Trash2
                            size={16}
                          />
                        </button>
                      </div>

                      <div
                        className="
                          grid
                          gap-4
                          md:grid-cols-2
                        "
                      >

                        {/* ZONE */}

                        <div>
                          <label
                            className="
                              mb-2
                              block
                              text-xs
                              font-semibold
                              text-text-secondary
                            "
                          >
                            Zone
                          </label>

                          <select
                            value={
                              defaut.zoneId
                            }
                            onChange={(e) =>
                              updateDefaut(
                                index,
                                "zoneId",
                                e.target.value
                              )
                            }
                            disabled={saving}
                            className="
                              w-full
                              rounded-lg
                              border
                              border-border
                              bg-card
                              px-3
                              py-2.5
                              text-sm
                              text-text-primary
                              outline-none
                              focus:border-primary
                            "
                          >
                            {zones.map(
                              (zone) => (
                                <option
                                  key={zone.id}
                                  value={
                                    zone.id
                                  }
                                >
                                  {zone.nom}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        {/* DEFAUT */}

                        <div>
                          <label
                            className="
                              mb-2
                              block
                              text-xs
                              font-semibold
                              text-text-secondary
                            "
                          >
                            Défaut attendu
                          </label>

                          <input
                            type="text"
                            value={
                              defaut.defautAttendu
                            }
                            onChange={(e) =>
                              updateDefaut(
                                index,
                                "defautAttendu",
                                e.target.value
                              )
                            }
                            disabled={saving}
                            placeholder="Ex : Composant manquant"
                            className="
                              w-full
                              rounded-lg
                              border
                              border-border
                              bg-card
                              px-3
                              py-2.5
                              text-sm
                              text-text-primary
                              outline-none
                              placeholder:text-text-secondary
                              focus:border-primary
                            "
                          />
                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

          {/* =================================================
              BUTTONS
          ================================================= */}

          <div
            className="
              mt-7
              flex
              justify-end
              gap-3
              border-t
              border-border
              pt-5
            "
          >

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                rounded-lg
                border
                border-border
                bg-background
                px-5
                py-2.5
                text-sm
                font-semibold
                text-text-primary
                hover:bg-primary/5
              "
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={saving}
              className="
                rounded-lg
                bg-primary
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving
                ? "Enregistrement..."
                : carte
                ? "Modifier la carte"
                : "Ajouter la carte"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}