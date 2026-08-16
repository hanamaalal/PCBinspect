import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { verifierSNDTO } from './dto/verifSNDTO';
import { VerifierSNResponse } from './response/VerifierSNResponse';

@Injectable()
export class VerificationSnService {
   
    verifSN(dto:verifierSNDTO,
        parametres:{verifSN:boolean;
                    activationInterblocage:boolean;
                    longeurSN:number;
                    partieFixe:string;
                    indicePartieFixe:number;
                    statutSN?:string|null;
                    postpartiefixe:string;
        }):VerifierSNResponse{
            if(!parametres.activationInterblocage){
                return{valide:true,erreur:"pas de verification si activationInterblocage est desac"};
            }
                if(!parametres.verifSN){
                    return{valide:true,erreur:"pas de verification si la verifsn est desac"}
                }
                if(parametres.longeurSN!==dto.sn.length){
                    return{
                        valide:false,
                        erreur:"sn invlaide"
                    }
                }
                const debut=parametres.indicePartieFixe;
                const fin=debut+parametres.partieFixe.length;
                const partiefixeDetecte=dto.sn.substring(debut,fin);
                if(partiefixeDetecte!==parametres.partieFixe){
                    return{
                        valide:false,
                        erreur:'partie fixe incompatible'
                    }
                }
                const debutpost=fin;
                const finpost=debutpost+parametres.postpartiefixe.length;
                const postpartiefixeDetecte=dto.sn.substring(debutpost,finpost);
                if(postpartiefixeDetecte!==parametres.postpartiefixe){
                    return{
                        valide:false,
                        erreur:'post partie fixe est incompatible'
                    }
                }
                return{valide:true,erreur:null};
            }
        }

