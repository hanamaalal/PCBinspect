"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: any;
  setForm: any;
  edit: boolean;
}

export default function UserModal({
  open,
  onClose,
  onSubmit,
  form,
  setForm,
  edit,
}: Props) {
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  if (!open)
    return null;

  const validate = () => {
    let newErrors: any = {};

    if (!form.firstname.trim()) {
      newErrors.firstname = "Le prénom est obligatoire";
    }

    if (!form.lastname.trim()) {
      newErrors.lastname = "Le nom est obligatoire";
    }

    if (!form.email.trim()) {
      newErrors.email = "L'email est obligatoire";
    } else if (
      !/^[^\s@]+@[^\s@]+.[^\s@]+$/.test(form.email)
    ) {
      newErrors.email = "Email invalide";
    }

    if (!edit) {
      if (!form.password) {
        newErrors.password =
          "Le mot de passe est obligatoire";
      } else if (form.password.length < 6) {
        newErrors.password =
          "Minimum 6 caractères";
      }

      if (
        form.password !==
        form.confirmpassword
      ) {
        newErrors.confirmpassword =
          "Les mots de passe ne correspondent pas";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/50
        p-4
        backdrop-blur-sm

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

        {/* HEADER */}

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
              {edit
                ? "Modifier utilisateur"
                : "Créer utilisateur"}
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
                ? "Modifier les informations de l'utilisateur"
                : "Créer un nouvel utilisateur"}
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

        {/* Prénom */}

        <label
          className="
            mb-1.5
            block
            text-sm
            font-medium
            text-gray-700

            dark:text-slate-300
          "
        >
          Prénom
        </label>

        <input
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            p-2
            mb-1
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
          value={form.firstname}
          onChange={(e) =>
            setForm({
              ...form,
              firstname: e.target.value,
            })
          }
        />

        {errors.firstname && (
          <p className="mb-3 text-xs text-red-500 dark:text-red-400">
            {errors.firstname}
          </p>
        )}

        {/* Nom */}

        <label
          className="
            mb-1.5
            block
            text-sm
            font-medium
            text-gray-700

            dark:text-slate-300
          "
        >
          Nom
        </label>

        <input
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            p-2
            mb-1
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
          value={form.lastname}
          onChange={(e) =>
            setForm({
              ...form,
              lastname: e.target.value,
            })
          }
        />

        {errors.lastname && (
          <p className="mb-3 text-xs text-red-500 dark:text-red-400">
            {errors.lastname}
          </p>
        )}

        {/* Email */}

        <label
          className="
            mb-1.5
            block
            text-sm
            font-medium
            text-gray-700

            dark:text-slate-300
          "
        >
          Email
        </label>

        <input
          type="email"
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            p-2
            mb-1
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
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
        />

        {errors.email && (
          <p className="mb-3 text-xs text-red-500 dark:text-red-400">
            {errors.email}
          </p>
        )}

        {/* PASSWORD seulement création */}

        {!edit && (
          <>
            <label
              className="
                mb-1.5
                block
                text-sm
                font-medium
                text-gray-700

                dark:text-slate-300
              "
            >
              Mot de passe
            </label>

            <div className="relative mb-1">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  p-2
                  pr-10
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
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />

              <button
                type="button"
                className="
                  absolute
                  right-3
                  top-2.5
                  text-gray-500
                  transition-colors

                  hover:text-gray-900

                  dark:text-slate-400
                  dark:hover:text-white
                "
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {errors.password && (
              <p className="mb-3 text-xs text-red-500 dark:text-red-400">
                {errors.password}
              </p>
            )}

            {/* CONFIRMATION PASSWORD */}

            <label
              className="
                mb-1.5
                block
                text-sm
                font-medium
                text-gray-700

                dark:text-slate-300
              "
            >
              Confirmer le mot de passe
            </label>

            <div className="relative mb-1">
              <input
                type={
                  showConfirm
                    ? "text"
                    : "password"
                }
                className="
                  w-full
                  rounded-lg
                  border
                  border-gray-300
                  bg-white
                  p-2
                  pr-10
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
                value={form.confirmpassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmpassword:
                      e.target.value,
                  })
                }
              />

              <button
                type="button"
                className="
                  absolute
                  right-3
                  top-2.5
                  text-gray-500
                  transition-colors

                  hover:text-gray-900

                  dark:text-slate-400
                  dark:hover:text-white
                "
                onClick={() =>
                  setShowConfirm(
                    !showConfirm
                  )
                }
              >
                {showConfirm ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {errors.confirmpassword && (
              <p className="mb-3 text-xs text-red-500 dark:text-red-400">
                {errors.confirmpassword}
              </p>
            )}
          </>
        )}

        {/* ROLE */}

        <label
          className="
            mb-1.5
            block
            text-sm
            font-medium
            text-gray-700

            dark:text-slate-300
          "
        >
          Rôle
        </label>

        <select
          className="
            w-full
            rounded-lg
            border
            border-gray-300
            bg-white
            p-2
            mt-1
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
          value={form.role}
          onChange={(e) =>
            setForm({
              ...form,
              role: e.target.value,
            })
          }
        >
          <option
            value="ADMIN"
            className="bg-white text-gray-900 dark:bg-slate-800 dark:text-white"
          >
            ADMIN
          </option>

          <option
            value="INGENIEUR"
            className="bg-white text-gray-900 dark:bg-slate-800 dark:text-white"
          >
            INGENIEUR
          </option>

          <option
            value="TECHNICIEN"
            className="bg-white text-gray-900 dark:bg-slate-800 dark:text-white"
          >
            TECHNICIEN
          </option>

          <option
            value="OPERATEUR"
            className="bg-white text-gray-900 dark:bg-slate-800 dark:text-white"
          >
            OPERATEUR
          </option>
        </select>

        <div
          className="
            flex
            justify-end
            gap-3
            mt-6
            border-t
            border-gray-100
            pt-5

            dark:border-slate-800
          "
        >
          <button
            onClick={onClose}
            className="
              border
              border-gray-300
              bg-white
              px-4
              py-2
              rounded-lg
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
            onClick={handleSubmit}
            className="
              bg-black
              text-white
              px-4
              py-2
              rounded-lg
              transition-all
              duration-200

              hover:bg-gray-800

              dark:bg-teal-500
              dark:text-slate-950
              dark:hover:bg-teal-400
            "
          >
            {edit ? "Modifier" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}

