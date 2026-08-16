import api from "@/lib/axios";

export interface LoginResponse{
    accessToken:string;
    user:{
        id:string;
        email:string;
        role:string;
        firstname?:string|null;
        lastname?:string|null;
    };

}
export async function loginUser(
    email:string,
    password:string
):Promise<LoginResponse>{
    const response=await api.post("/utilisateur/login",{
        email,
        password,
    });
    return response.data;
}