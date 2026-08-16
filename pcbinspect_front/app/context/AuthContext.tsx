"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { loginUser } from "@/app/service/auth.service";


interface User {
  id: string;
  email: string;
  role: string;
  firstname?: string | null;
  lastname?: string | null;
}


interface AuthContextType {
  user: User | null;
  login: (
    email: string,
    password: string
  ) => Promise<void>;
  logout: () => void;
}


const AuthContext = createContext<AuthContextType | null>(null);



export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {


  const [user, setUser] = useState<User | null>(null);



  // Récupérer la session après actualisation de la page
  useEffect(() => {

    const savedUser = localStorage.getItem("user");

    if (savedUser && savedUser !== "undefined") {
      setUser(JSON.parse(savedUser));
    }

  }, []);



  // Connexion
  async function login(
    email: string,
    password: string
  ) {

    const data = await loginUser(
      email,
      password
    );


    // Stocker le JWT
    localStorage.setItem(
      "accessToken",
      data.accessToken
    );


    // Stocker utilisateur
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );


    // Mettre à jour le state
    setUser(data.user);

  }



  // Déconnexion
  function logout() {

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "user"
    );


    setUser(null);

  }



  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );

}




export function useAuth() {

  const context = useContext(AuthContext);


  if (!context) {
    throw new Error(
      "useAuth doit être utilisé dans AuthProvider"
    );
  }


  return context;

}