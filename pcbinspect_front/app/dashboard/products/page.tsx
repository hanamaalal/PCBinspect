"use client";

import {
  useEffect,
  useState
} from "react";

import Header from "@/components/layout/Header";

import {
  getReferences,
  createReference,
  updateReference,
  deleteReference,
  createProgramme,
  updateProgramme
} from "@/lib/api";

import {
  Plus,
  Pencil,
  Trash2,
  PlusIcon
} from "lucide-react";

import ReferenceModal from "../components/ReferenceModal";
import ProgrammeModal from "../components/ProgrammeModal";
import { useAuth } from "@/app/context/AuthContext";

export default function ReferencePage() {

  useEffect(() => {
    loadReferences();
  }, []);

  const [references, setReferences] = useState<any[]>([]);
  const { user } = useAuth();

  const emptyForm = {
    PRF: "",
    OF: "",
    verifSN: true,
    longeurSN: 0,
    partieFixe: "",
    postpartiefixe: "",
    activationInterblocage: true,
    indicePartieFixe: 0,
    statutSN: "",
    jugementOperateurBO: false,
    imagepath: ""
  };

  const [form, setForm] = useState(emptyForm);
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [programmeModal, setProgrammeModal] =
    useState(false);

  const [programmeEdit, setProgrammeEdit] =
    useState(false);

  const [programmeId, setProgrammeId] =
    useState<string | null>(null);

  const [selectedReference, setSelectedReference] =
    useState<any>(null);

  const [zones, setZones] =
    useState<{ nom: string }[]>([]);

  const [deleteModal, setDeleteModal] =
    useState(false);

  const [referenceToDelete, setReferenceToDelete] =
    useState<string | null>(null);

  const loadReferences = async () => {
    try {
      const data = await getReferences();
      setReferences(data);
    } catch (error) {
      console.error(
        "Erreur chargement références",
        error
      );
    }
  };

  const handleAdd = () => {
    setEditMode(false);
    setSelectedId(null);
    setForm(emptyForm);
    setOpenModal(true);
  };

  const handleEdit = (ref: any) => {
    setEditMode(true);
    setSelectedId(ref.id);

    setForm({
      PRF: ref.PRF ?? "",
      OF: ref.ordreFabrication?.OF ?? "",
      verifSN: ref.verifSN ?? true,
      longeurSN: ref.longeurSN ?? 0,
      partieFixe: ref.partieFixe ?? "",
      postpartiefixe: ref.postpartiefixe ?? "",
      activationInterblocage:
        ref.activationInterblocage ?? true,
      indicePartieFixe:
        ref.indicePartieFixe ?? 0,
      statutSN: ref.statutSN ?? "",
      jugementOperateurBO:
        ref.jugementOperateurBO ?? false,
      imagepath: ref.imagepath ?? ""
    });

    setOpenModal(true);
  };

  const handleSave = async () => {
    try {
      if (editMode && selectedId) {
        await updateReference(
          selectedId,
          form
        );
      } else {
        await createReference(form);
      }

      setOpenModal(false);
      await loadReferences();

    } catch (error: any) {
      console.log(
        error.response?.data
      );

      alert(
        error.response?.data?.message ??
        "Erreur"
      );
    }
  };

  const handleProgramme = (ref: any) => {
    setSelectedReference(ref);

    const programme =
      ref.programme?.[0];

    if (programme) {
      setProgrammeEdit(true);
      setProgrammeId(programme.id);

      setZones(
        programme.Zone.map(
          (z: any) => ({
            nom: z.nom
          })
        )
      );
    } else {
      setProgrammeEdit(false);
      setProgrammeId(null);

      setZones([
        {
          nom: ""
        }
      ]);
    }

    setProgrammeModal(true);
  };

  const handleSaveProgramme = async () => {
    try {
      if (
        programmeEdit &&
        programmeId
      ) {
        await updateProgramme(
          programmeId,
          {
            zones
          }
        );
      } else {
        await createProgramme({
          PRF: selectedReference.PRF,
          zones
        });
      }

      setProgrammeModal(false);
      await loadReferences();

    } catch (error: any) {
      console.log(
        error.response?.data
      );

      alert(
        error.response?.data?.message ??
        "Erreur programme"
      );
    }
  };

  const handleDelete = (id: string) => {
    setReferenceToDelete(id);
    setDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!referenceToDelete)
      return;

    try {
      await deleteReference(
        referenceToDelete
      );

      await loadReferences();

      setDeleteModal(false);
      setReferenceToDelete(null);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Header
        user={{
          firstName: user?.firstname ?? "",
          lastName: user?.lastname ?? "",
          role: user?.role ?? ""
        }}
      />

      {/* =====================================================
          MAIN
      ===================================================== */}

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

        {/* ===================================================
            TITRE
        =================================================== */}

        <div className="mb-8">
          <h1
            className="
              text-2xl
              font-bold
              tracking-tight
              text-gray-900
              transition-colors
              duration-300
              sm:text-3xl

              dark:text-white
            "
          >
            Gestion des références
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-gray-500

              dark:text-slate-400
            "
          >
            Consultez et gérez les références de production
          </p>
        </div>

        {/* ===================================================
            BOUTON AJOUTER
        =================================================== */}

        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={handleAdd}
            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-gray-900
              px-4
              py-2
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              duration-200

              hover:bg-gray-800
              hover:shadow-md

              dark:bg-teal-500
              dark:text-slate-950
              dark:hover:bg-teal-400
            "
          >
            <Plus size={17} />
            Ajouter référence
          </button>
        </div>

        {/* ===================================================
            TABLE
        =================================================== */}

        <section
          className="
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

          {/* =================================================
              HEADER TABLE
          ================================================= */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-gray-200
              bg-gray-100
              px-5
              py-3

              dark:border-slate-800
              dark:bg-slate-800
            "
          >
            <div
              className="
                text-sm
                font-medium
                text-gray-700

                dark:text-slate-300
              "
            >
              NB références trouvées :

              <b
                className="
                  ml-2
                  font-bold
                  text-gray-900

                  dark:text-white
                "
              >
                {references.length}
              </b>
            </div>
          </div>

          {/* =================================================
              TABLE RESPONSIVE
          ================================================= */}

          <div className="overflow-x-auto">
            <table
              className="
                w-full
                min-w-[1100px]
                text-sm
              "
            >

              {/* =================================================
                  THEAD
              ================================================= */}

              <thead>
                <tr
                  className="
                    border-b
                    border-gray-200
                    bg-gray-50
                    text-gray-500

                    dark:border-slate-800
                    dark:bg-slate-800/60
                    dark:text-slate-400
                  "
                >
                  <th
                    className="
                      p-3
                      text-center
                      font-semibold
                    "
                  >
                    PRF
                  </th>

                  <th
                    className="
                      p-3
                      text-center
                      font-semibold
                    "
                  >
                    OF
                  </th>

                  <th
                    className="
                      p-3
                      text-center
                      font-semibold
                    "
                  >
                    Vérification SN
                  </th>

                  <th
                    className="
                      p-3
                      text-center
                      font-semibold
                    "
                  >
                    Longueur SN
                  </th>

                  <th
                    className="
                      p-3
                      text-center
                      font-semibold
                    "
                  >
                    Interblocage
                  </th>

                  <th
                    className="
                      p-3
                      text-center
                      font-semibold
                    "
                  >
                    Statut SN
                  </th>

                  <th
                    className="
                      p-3
                      text-center
                      font-semibold
                    "
                  >
                    Programme
                  </th>

                  <th
                    className="
                      p-3
                      text-center
                      font-semibold
                    "
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              {/* =================================================
                  TBODY
              ================================================= */}

              <tbody
                className="
                  divide-y
                  divide-gray-200

                  dark:divide-slate-800
                "
              >

                {references.length === 0 ? (

                  <tr>
                    <td
                      colSpan={8}
                      className="
                        p-8
                        text-center
                        text-sm
                        text-gray-500

                        dark:text-slate-400
                      "
                    >
                      Aucune référence trouvée
                    </td>
                  </tr>

                ) : (

                  references.map(
                    (ref: any) => (

                      <tr
                        key={ref.id}
                        className="
                          bg-white
                          transition-colors
                          duration-200
                          hover:bg-gray-50

                          dark:bg-slate-900
                          dark:hover:bg-slate-800/70
                        "
                      >

                        {/* PRF */}

                        <td
                          className="
                            p-3
                            text-center
                            font-medium
                            text-gray-900

                            dark:text-white
                          "
                        >
                          {ref.PRF}
                        </td>

                        {/* OF */}

                        <td
                          className="
                            p-3
                            text-center
                            text-gray-700

                            dark:text-slate-300
                          "
                        >
                          {ref.ordreFabrication?.OF ??
                            ref.OF ??
                            "-"}
                        </td>

                        {/* VERIFICATION SN */}

                        <td
                          className="
                            p-3
                            text-center
                          "
                        >
                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              font-medium

                              ${
                                ref.verifSN
                                  ? `
                                    bg-green-100
                                    text-green-700
                                    dark:bg-green-950/40
                                    dark:text-green-400
                                  `
                                  : `
                                    bg-gray-100
                                    text-gray-600
                                    dark:bg-slate-800
                                    dark:text-slate-400
                                  `
                              }
                            `}
                          >
                            {ref.verifSN
                              ? "Activée"
                              : "Désactivée"}
                          </span>
                        </td>

                        {/* LONGUEUR SN */}

                        <td
                          className="
                            p-3
                            text-center
                            text-gray-700

                            dark:text-slate-300
                          "
                        >
                          {ref.longeurSN}
                        </td>

                        {/* INTERBLOCAGE */}

                        <td
                          className="
                            p-3
                            text-center
                          "
                        >
                          <span
                            className={`
                              inline-flex
                              rounded-full
                              px-3
                              py-1
                              text-xs
                              font-medium

                              ${
                                ref.activationInterblocage
                                  ? `
                                    bg-green-100
                                    text-green-700
                                    dark:bg-green-950/40
                                    dark:text-green-400
                                  `
                                  : `
                                    bg-gray-100
                                    text-gray-600
                                    dark:bg-slate-800
                                    dark:text-slate-400
                                  `
                              }
                            `}
                          >
                            {ref.activationInterblocage
                              ? "Activé"
                              : "Désactivé"}
                          </span>
                        </td>

                        {/* STATUT SN */}

                        <td
                          className="
                            p-3
                            text-center
                            text-gray-700

                            dark:text-slate-300
                          "
                        >
                          {ref.statutSN || "-"}
                        </td>

                        {/* PROGRAMME */}

                        <td
                          className="
                            p-3
                            text-center
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleProgramme(ref)
                            }
                            className="
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-lg
                              border
                              border-gray-300
                              bg-white
                              px-3
                              py-1.5
                              text-xs
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
                            <PlusIcon size={14} />

                            {ref.programme?.length
                              ? "Modifier"
                              : "Ajouter"}
                          </button>
                        </td>

                        {/* ACTIONS */}

                        <td
                          className="
                            p-3
                            text-center
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              justify-center
                              gap-2
                            "
                          >

                            {/* MODIFIER */}

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(ref)
                              }
                              className="
                                flex
                                h-9
                                w-9
                                items-center
                                justify-center
                                rounded-lg
                                border
                                border-gray-300
                                bg-white
                                text-gray-600
                                transition-all
                                duration-200

                                hover:border-teal-400
                                hover:bg-teal-50
                                hover:text-teal-700

                                dark:border-slate-700
                                dark:bg-slate-800
                                dark:text-slate-300

                                dark:hover:border-teal-500
                                dark:hover:bg-teal-500
                                dark:hover:text-slate-950
                              "
                              title="Modifier"
                            >
                              <Pencil size={16} />
                            </button>

                            {/* SUPPRIMER */}

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(ref.id)
                              }
                              className="
                                flex
                                h-9
                                w-9
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
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>
            </table>
          </div>
        </section>

        {/* ===================================================
            MODAL REFERENCE
        =================================================== */}

        <ReferenceModal
          open={openModal}
          onClose={() =>
            setOpenModal(false)
          }
          onSubmit={handleSave}
          form={form}
          setForm={setForm}
          edit={editMode}
        />

        {/* ===================================================
            MODAL PROGRAMME
        =================================================== */}

        <ProgrammeModal
          open={programmeModal}
          onClose={() =>
            setProgrammeModal(false)
          }
          onSave={handleSaveProgramme}
          zones={zones}
          setZones={setZones}
          edit={programmeEdit}
        />

        {/* ===================================================
            MODAL DELETE
        =================================================== */}

        {deleteModal && (

          <div
            className="
              fixed
              inset-0
              z-50
              flex
              items-center
              justify-center
              bg-black/40
              px-4

              dark:bg-black/70
            "
          >

            <div
              className="
                w-full
                max-w-md
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

              <h2
                className="
                  text-lg
                  font-bold
                  text-gray-900

                  dark:text-white
                "
              >
                Supprimer la référence
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  text-gray-500

                  dark:text-slate-400
                "
              >
                Êtes-vous sûr de vouloir supprimer
                cette référence ?
              </p>

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
                  onClick={() => {
                    setDeleteModal(false);
                    setReferenceToDelete(null);
                  }}
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
                  onClick={confirmDelete}
                  className="
                    flex
                    items-center
                    gap-2
                    rounded-lg
                    bg-red-600
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-white
                    transition-all
                    duration-200

                    hover:bg-red-700

                    dark:bg-red-500
                    dark:text-white
                    dark:hover:bg-red-400
                  "
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>

              </div>

            </div>
          </div>
        )}

      </main>
    </>
  );
}