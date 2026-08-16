"use client";

import {
  useEffect,
  useState
} from "react";

import Header from "@/components/layout/Header";

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from "@/lib/api";

import {
  Plus,
  Pencil,
  Trash2
} from "lucide-react";

import UserModal from "../components/UserModal";
import { useAuth } from "@/app/context/AuthContext";

export default function UsersPage() {

  const [users, setUsers] = useState<any[]>([]);

  const emptyForm = {
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmpassword: "",
    role: "OPERATEUR"
  };

  const [form, setForm] = useState(emptyForm);
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const { user } = useAuth();

  const [userToDelete, setUserToDelete] =
    useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error(
        "Erreur chargement users",
        error
      );
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAdd = () => {
    setEditMode(false);
    setSelectedId(null);
    setForm(emptyForm);
    setOpenModal(true);
  };

  const handleEdit = (u: any) => {
    setEditMode(true);
    setSelectedId(u.id);

    setForm({
      firstname: u.firstname ?? "",
      lastname: u.lastname ?? "",
      email: u.email ?? "",
      password: "",
      confirmpassword: "",
      role: u.role
    });

    setOpenModal(true);
  };

  const handleSave = async () => {
    try {

      if (editMode && selectedId) {

        await updateUser(
          selectedId,
          {
            firstname: form.firstname,
            lastname: form.lastname,
            email: form.email,
            role: form.role
          }
        );

      } else {

        await createUser(form);

      }

      setOpenModal(false);
      setForm(emptyForm);

      await loadUsers();

    } catch (error: any) {

      console.log(
        error.response?.data
      );

      alert(
        error.response?.data?.message ??
        "Erreur lors de l'opération"
      );
    }
  };

  const handleDelete = (id: string) => {
    setUserToDelete(id);
    setDeleteModal(true);
  };

  const confirmDeleteUser = async () => {

    if (!userToDelete)
      return;

    try {

      await deleteUser(userToDelete);

      await loadUsers();

      setDeleteModal(false);
      setUserToDelete(null);

    } catch (error) {

      console.error(
        "Erreur suppression",
        error
      );
    }
  };

  return (
    <>
      {/* =====================================================
          HEADER
          CONSERVÉ COMME IL EST
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

        {/* =================================================
            TITRE + BOUTON AJOUT
        ================================================= */}

        <div
          className="
            mb-8
            flex
            flex-col
            gap-4

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

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
              Gestion des utilisateurs
            </h1>

            <p
              className="
                mt-2
                text-sm

                text-gray-500

                dark:text-slate-400
              "
            >
              Gérez les utilisateurs et leurs rôles
            </p>

          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="
              flex
              items-center
              justify-center
              gap-2

              rounded-lg

              bg-gray-900
              px-4
              py-2.5

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
            <Plus size={18} />

            Ajouter un utilisateur
          </button>

        </div>

        {/* =================================================
            CARTE TABLE
        ================================================= */}

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
              py-4

              dark:border-slate-800
              dark:bg-slate-800
            "
          >

            <div>

              <h2
                className="
                  text-sm
                  font-semibold

                  text-gray-800

                  dark:text-white
                "
              >
                Liste des utilisateurs
              </h2>

              <p
                className="
                  mt-1
                  text-xs

                  text-gray-500

                  dark:text-slate-400
                "
              >
                {users.length} utilisateur
                {users.length > 1 ? "s" : ""}
              </p>

            </div>

          </div>

          {/* =================================================
              TABLE RESPONSIVE
          ================================================= */}

          <div className="overflow-x-auto">

            <table
              className="
                w-full
                min-w-[750px]
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
                      p-4
                      text-left
                      font-semibold
                    "
                  >
                    Prénom
                  </th>

                  <th
                    className="
                      p-4
                      text-left
                      font-semibold
                    "
                  >
                    Nom
                  </th>

                  <th
                    className="
                      p-4
                      text-left
                      font-semibold
                    "
                  >
                    Email
                  </th>

                  <th
                    className="
                      p-4
                      text-center
                      font-semibold
                    "
                  >
                    Rôle
                  </th>

                  <th
                    className="
                      p-4
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

                {users.length === 0 ? (

                  <tr>

                    <td
                      colSpan={5}
                      className="
                        p-10
                        text-center
                        text-sm

                        text-gray-500

                        dark:text-slate-400
                      "
                    >
                      Aucun utilisateur trouvé
                    </td>

                  </tr>

                ) : (

                  users.map((u: any) => (

                    <tr
                      key={u.id}
                      className="
                        bg-white

                        transition-colors
                        duration-200

                        hover:bg-gray-50

                        dark:bg-slate-900
                        dark:hover:bg-slate-800/70
                      "
                    >

                      {/* PRÉNOM */}

                      <td
                        className="
                          p-4

                          font-medium

                          text-gray-900

                          dark:text-white
                        "
                      >
                        {u.firstname}
                      </td>

                      {/* NOM */}

                      <td
                        className="
                          p-4

                          text-gray-700

                          dark:text-slate-300
                        "
                      >
                        {u.lastname}
                      </td>

                      {/* EMAIL */}

                      <td
                        className="
                          p-4

                          text-gray-700

                          dark:text-slate-300
                        "
                      >
                        {u.email}
                      </td>

                      {/* ROLE */}

                      <td
                        className="
                          p-4
                          text-center
                        "
                      >

                        <span
                          className="
                            inline-flex
                            rounded-full

                            bg-gray-100

                            px-3
                            py-1

                            text-xs
                            font-semibold

                            text-gray-700

                            dark:bg-slate-800
                            dark:text-teal-300
                          "
                        >
                          {u.role}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td
                        className="
                          p-4
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
                              handleEdit(u)
                            }
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center

                              rounded-full

                              bg-gray-100

                              text-gray-700

                              transition-all
                              duration-200

                              hover:bg-teal-500
                              hover:text-white

                              dark:bg-slate-800
                              dark:text-slate-300

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
                              handleDelete(u.id)
                            }
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center

                              rounded-full

                              bg-red-100

                              text-red-600

                              transition-all
                              duration-200

                              hover:bg-red-600
                              hover:text-white

                              dark:bg-red-950/40
                              dark:text-red-400

                              dark:hover:bg-red-600
                              dark:hover:text-white
                            "
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

      {/* =====================================================
          MODAL UTILISATEUR
          Le composant UserModal reçoit les classes dark
          si tu les ajoutes dans UserModal.
      ===================================================== */}

      <UserModal
        open={openModal}
        onClose={() =>
          setOpenModal(false)
        }
        onSubmit={handleSave}
        form={form}
        setForm={setForm}
        edit={editMode}
      />

      {/* =====================================================
          POPUP SUPPRESSION
      ===================================================== */}

      {deleteModal && (

        <div
          className="
            fixed
            inset-0
            z-50

            flex
            items-center
            justify-center

            bg-black/50

            px-4

            backdrop-blur-sm
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

              dark:border-slate-700
              dark:bg-slate-900
            "
          >

            {/* ICÔNE */}

            <div
              className="
                mx-auto
                mb-4

                flex
                h-12
                w-12
                items-center
                justify-center

                rounded-full

                bg-red-100

                text-red-600

                dark:bg-red-950/40
                dark:text-red-400
              "
            >
              <Trash2 size={22} />
            </div>

            {/* TITRE */}

            <h2
              className="
                text-center
                text-lg
                font-bold

                text-gray-900

                dark:text-white
              "
            >
              Supprimer l'utilisateur
            </h2>

            {/* MESSAGE */}

            <p
              className="
                mt-2
                text-center
                text-sm

                text-gray-500

                dark:text-slate-400
              "
            >
              Êtes-vous sûr de vouloir supprimer
              cet utilisateur ?
            </p>

            <p
              className="
                mt-1
                text-center
                text-xs

                text-gray-400

                dark:text-slate-500
              "
            >
              Cette action est irréversible.
            </p>

            {/* BOUTONS */}

            <div
              className="
                mt-6

                flex
                justify-end
                gap-3
              "
            >

              <button
                type="button"
                onClick={() => {
                  setDeleteModal(false);
                  setUserToDelete(null);
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

                  hover:border-gray-400
                  hover:bg-gray-50

                  dark:border-slate-700
                  dark:bg-slate-800
                  dark:text-slate-200

                  dark:hover:bg-slate-700
                "
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={confirmDeleteUser}
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

                  dark:bg-red-600
                  dark:hover:bg-red-500
                "
              >
                <Trash2 size={16} />

                Supprimer
              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}

