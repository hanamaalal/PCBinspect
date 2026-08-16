import api from "./axios";
import { CreateUserDTO, HistoriqueFilters, PcbCardFilters, StatisticsFilters, UpdateUserDTO } from "./types";

// ================= Dashboard =================

export async function getDashboardData() {
  const response = await api.get("/dashboard");
  return response.data;
}

// ================= Production =================

export async function extrairePRF(OF: string) {
  const response = await api.get(`/production/${OF}`);
  return response.data;
}

export async function lancerProduction(of: string) {
  try {
    const response = await api.get(`/production/lancer/${of}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erreur serveur"
    );
  }
}

export async function getProgramme(PRF: string) {
  const response = await api.get(`/production/programme/${PRF}`);
  return response.data;
}

// ================= Utilisateur =================

export async function getCurrentUser() {
  const response = await api.get("/utilisateur/me");
  return response.data;
}

// ================= Historique =================

export async function getHistorique(filters: HistoriqueFilters) {
  const response = await api.get("/historique", {
    params: filters,
  });

  return response.data;
}

export async function getInspectionDetails(id: string) {
  const response = await api.get(`/historique/${id}`);

  return response.data;
}

export async function exportHistorique(filters:HistoriqueFilters){
  const response = await api.get("/historique/export",{
    params:filters,
    responseType:"blob",
  });
  const url = window.URL.createObjectURL(
    new Blob([response.data])//transformele text en objet fichier
  );//existe cote navigateur pas serveur next.js
  const link = document.createElement("a");
  link.href=url;
  link.download="historique.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

}
// ================= Export Historique =================

export async function getHistoriqueExport(filters?: {
  date?: string;
  sn?: string;
  of?: string;
  statut?: string;
}) {

  const params = new URLSearchParams();
  if(filters?.date)
    params.append("date", filters.date);
  if(filters?.sn)
    params.append("sn", filters.sn);
  if(filters?.of)
    params.append("of", filters.of);
  if(filters?.statut)
    params.append("statut", filters.statut);
  const response = await api.get(
    `/historique/export-data?${params.toString()}`
  );

  return response.data;

}
export async function getPcbCards(filters: PcbCardFilters) {
  const { data } = await api.get("/pcb-cards", {
    params: filters,
  });

  return data;
}

export async function getInspectByPRF(PRF: string) {
  const response = await api.get(`/inspection/prf/${PRF}`);
  return response.data;
}
// =====================================================
// GET STATISTIQUES
// ====================================================
export async function getStatistiques(
  filters?: StatisticsFilters
): Promise<StatisticsData> {
  const params = new URLSearchParams();
  if(filters?.champ){
    params.append("champ",filters.champ);
  }
  if(filters?.valeur){
    params.append("valeur",filters.valeur);
  }
  if(filters?.date){
    params.append("date",filters.date);
  }
  console.log("PARAMS ENVOYES:",params.toString());
  const response = await api.get(`/statistics?${params.toString()}`);
  return response.data;

}

export async function getUsers() {
  const { data } = await api.get("/utilisateur");
  return data;
}

export async function createUser(dto: CreateUserDTO) {
  const { data } = await api.post("/utilisateur/register", dto);
  return data;
}

export async function updateUser(
  id: string,
  dto: UpdateUserDTO
) {
  const { data } = await api.put(`/utilisateur/${id}`, dto);
  return data;
}

export async function deleteUser(id: string) {
  const { data } = await api.delete(`/utilisateur/${id}`);
  return data;
}
// ================= Reference =================


export async function getReferences(){

  const response = await api.get(
    "/reference/getall"
  );
  return response.data;

}


export async function createReference(
  dto:any
){

  const response = await api.post(
    "/reference/addRef",
    dto
  );

  return response.data;

}



export async function updateReference(
  id:string,
  dto:any
){

  const response = await api.put(
    `/reference/${id}`,
    dto
  );

  return response.data;

}



export async function deleteReference(
  id:string
){

  const response = await api.delete(
    `/reference/${id}`
  );

  return response.data;

}



// ================= Programme =================



export async function createProgramme(
data:{
  PRF:string;

  zones:{
    nom:string;
  }[];
}

){


const response = await api.post(

"/production/programme",

data

);


return response.data;


}






export async function updateProgramme(

id:string,

data:{
 zones:{
  nom:string;
 }[];
}

){


const response = await api.put(

`/production/programme/${id}`,

data

);


return response.data;


}
export const exportHistoriqueExcel = async (
  filters:{
    date?:string;
    sn?:string;
    of?:string;
    statut?: "GOOD" | "NOT_GOOD";
  }
)=>{

  const params = new URLSearchParams();

  if(filters.date)
    params.append("date",filters.date);

  if(filters.sn)
    params.append("sn",filters.sn);

  if(filters.of)
    params.append("of",filters.of);

  if(filters.statut)
    params.append("statut",filters.statut);


  const response = await api.get(
    `/historique/export/excel?${params.toString()}`,
    {
      responseType:"blob",
    }
  );


  const blob = new Blob(
    [response.data],
    {
      type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  );


  const url = window.URL.createObjectURL(blob);

  const link=document.createElement("a");

  link.href=url;
  link.download="Historique_Inspection.xlsx";

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);

};
export async function deletePcbCard(id:string){

    const response = await fetch(
        `http://localhost:3001/pcb-cards/${id}`,
        {
            method:"DELETE",
        }
    );


    if(!response.ok){
        throw new Error(
            "Erreur suppression"
        );
    }


    return response.json();

}// ================= Carte Modèle =================

export interface DefautAttenduDTO {
  defautAttendu: string;
  zoneId: string;
}

export interface CarteModeleDTO {
  sn: string;
  PRF: string;
  defautAttendu: DefautAttenduDTO[];
  image?: File | null;
}

// =====================================================
// GET TOUTES LES CARTES MODELES
// =====================================================

export async function getCarteModeles() {
  const response = await api.get("/carte-modele/getall");

  return response.data;
}

// =====================================================
// GET UNE CARTE MODELE
// =====================================================

export async function getCarteModele(sn: string) {
  const response = await api.get(`/carte-modele/${sn}`);

  return response.data;
}

// =====================================================
// CREATE CARTE MODELE
// =====================================================

export async function createCarteModele(
  data: CarteModeleDTO
) {
  const formData = new FormData();

  formData.append("sn", data.sn);
  formData.append("PRF", data.PRF);

  // Les défauts sont envoyés sous forme JSON
  formData.append(
    "defautAttendu",
    JSON.stringify(data.defautAttendu)
  );

  // Image optionnelle
  if (data.image) {
    formData.append("image", data.image);
  }

  const response = await api.post(
    "/carte-modele/addcarte",
    formData
  );

  return response.data;
}

// =====================================================
// UPDATE CARTE MODELE
// =====================================================

export async function updateCarteModele(
  id: string,
  data: CarteModeleDTO
) {
  const formData = new FormData();

  formData.append("sn", data.sn);
  formData.append("PRF", data.PRF);

  formData.append(
    "defautAttendu",
    JSON.stringify(data.defautAttendu)
  );

  // Image optionnelle
  if (data.image) {
    formData.append("image", data.image);
  }

  const response = await api.put(
    `/carte-modele/${id}`,
    formData
  );

  return response.data;
}

// =====================================================
// DELETE CARTE MODELE
// =====================================================

export async function deleteCarteModele(
  id: string
) {
  const response = await api.delete(
    `/carte-modele/${id}`
  );

  return response.data;
}

// =====================================================
// GET PROGRAMMES
// =====================================================

export async function getProgrammes() {
  const response = await api.get(
    "/production/programmes"
  );

  return response.data;
}