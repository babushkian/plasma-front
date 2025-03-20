import { UserType } from "../pages/Login/Login.types";

export const TOKEN_LOCAL_STORAGE_KEY = "token";
export const USER_LOCAL_STORAGE_KEY = "user";

export const getUserFromStore:()=>UserType| undefined  = () => {
    const user =  localStorage.getItem(USER_LOCAL_STORAGE_KEY)
    if (user) return  JSON.parse(user)
        

}