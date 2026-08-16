export interface CarteModeleResponse{
    id:string;
    sn:string;
    defautAttendu:{
        id:string;
        defautAttendu:string;
        zone:{
            id:string;
            nom:string;
        }
       
    }[];
}