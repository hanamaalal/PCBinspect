export interface LancerProductionResponse{
    of:string;
    ofId:string;
    PRF:string;
    programme:{
        id:string;
        zones:{
            id:string;
            nom:string
        }[];
    };
    parametres:{
        verifSN: boolean;
        longeurSN: number | null;
        partieFixe: string | null;
        postpartiefixe: string | null;
        activationInterblocage: boolean;
        indicePartieFixe: number | null;
        statutSN: string | null;
        jugementOperateurBO: boolean;
  };
}