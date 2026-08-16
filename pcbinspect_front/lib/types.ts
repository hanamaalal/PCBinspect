
export type InspectionResult = "GOOD" | "NOT_GOOD";
export type UnitStatusValue = "OK" | "NOK";

export interface CurrentUser {
  firstName: string;
  lastName: string;
  role: string;
}

export interface DashboardStats {
  ofPrfCount: number;
  inspectedPiecesCount: number;
}

export interface LastInspection {
  id: string;
  serialNumber: string;
  result: InspectionResult;
}

export interface UnitStatus {
  id: string;
  name: string;
  status: UnitStatusValue;
  lastUpdate?: string; // format "DD/MM/YYYY HH:mm", uniquement si NOK
}

export interface ShiftReport {
  id: string;
  shift: "Matin" | "Après-midi" | "Nuit";
  prf: string;
  sn: string;
  defectRate: number; 
}

export interface DashboardData {
  user: CurrentUser;
  stats: DashboardStats;
  lastInspections: LastInspection[];
  unitsStatus: UnitStatus[];
  shiftHistory: ShiftReport[];
}
export interface HistoriqueFilters {
  page?: number;
  limit?: number;
  date?: string;
  sn?: string;
  of?: string;
  statut?: "GOOD" | "NOT_GOOD";
}

export interface HistoriqueItem {
  id: string;
  dateHeure: string;
  sn: string;
  of: string;
  resultat: "GOOD" | "NOT_GOOD";
  nombreDefauts: number;
}

export interface InspectionDetails {
  id: string;
  sn: string;
  of: string;
  JugementOperateurBO:boolean,
  resultat: "GOOD" | "NOT_GOOD";
  dateHeure: string;
  operateur: {
    id: string;
    firstname?: string;
    lastname?: string;
  };
  defauts: {
    id: string;
    defaut: string;
    zone: string;
    zoneId: string;
    jugement: "PASS" | "FAIL" | "EN_ATTENTE";
  }[];
}
export interface PcbCard {
  id: string;
  sn: string;
  of: string;
  prf: string;
  resultat: "GOOD" | "NOT_GOOD";
  imageTop: string | null;
  imageBottom: string | null;
  dateHeure: string;
  operateur: string;
}

export interface PcbCardFilters {
  page?: number;
  limit?: number;
  sn?: string;
  of?: string;
  date?: string;
  statut?: "GOOD" | "NOT_GOOD";
}
export interface StatisticsFilters {
  champ?: "OF" | "PRF" | "SN" | "DATE" | "PROGRAMME";
  valeur?: string;
  date?: string;
}
export interface StatisticsData {
firstPassYield:number;
tempsMoyenInspection:number;
tauxConformite:number;
tauxDefauts:number;
nombreTotalInspections:number;
nombreTotalDefauts:number;
pareto:{
 nom:string;
 count:number;
}[];

}
export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  role: "ADMIN" | "INGENIEUR" | "TECHNICIEN" | "OPERATEUR";
}

export interface CreateUserDTO {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  confirmpassword: string;
  role: "ADMIN" | "INGENIEUR" | "TECHNICIEN" | "OPERATEUR";
}

export interface UpdateUserDTO {
  firstname?: string;
  lastname?: string;
  email?: string;
  role?: | "ADMIN"| "INGENIEUR"| "TECHNICIEN"| "OPERATEUR";

}