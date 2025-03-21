import { UserType } from "../pages/Login/Login.types";

export const TOKEN_LOCAL_STORAGE_KEY = "token";
export const USER_LOCAL_STORAGE_KEY = "user";

export const getUserFromStore: () => UserType | undefined = () => {
    const user = localStorage.getItem(USER_LOCAL_STORAGE_KEY);
    if (user) return JSON.parse(user);
};

export const getTokenFromStore: () => string | undefined = () => {
    return  localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY);
    
};


export const saveTokenToStore = (token: string) => {
    localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, token);
};

export const saveUserToStore = (user: UserType) => {
    localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(user));
};

export const clearStore = () => {
    for (const key of [TOKEN_LOCAL_STORAGE_KEY, USER_LOCAL_STORAGE_KEY]) { 
        console.log("удаляем ключ:", key)
        localStorage.removeItem(key)};
};
