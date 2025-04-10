import { createContext, useContext, useEffect, useState } from "react";
import { UserType } from "./pages/Login/Login.types";
import { getUserFromStore, getTokenFromStore, saveTokenToStore, saveUserToStore } from "./utils/local-storage";
import { getCurrentUser } from "./utils/requests";
type UserContextType = {
    token: string | undefined;
    currentUser: UserType | undefined;
    setCurrentUser: React.Dispatch<React.SetStateAction<UserType | undefined>>;
    login: (newToken: string) => void;
    logout: () => void;
};
export const AuthContext = createContext<UserContextType | undefined>(undefined);

export function AuthProvider({ children }) {
    const [token, setToken] = useState<string | undefined>(getTokenFromStore);
    const [currentUser, setCurrentUser] = useState<UserType | undefined>(getUserFromStore);

    useEffect(()=>{
        const getUser = () =>{
            return getCurrentUser();
        }
        if (token) {
            saveTokenToStore(token)
            const user = getUser()
            if (user) {
                saveUserToStore(user);
                setCurrentUser(user);
                //navigate(getDefaultPage(user)); // переход на дефолтный адрес после логина
            }
            
        }
        else{}
    }, [token])

    function login(newToken: string) {
        setToken(newToken);
    }
    
    function logout() {
        setToken(undefined);
    }

    return (
        <AuthContext.Provider value={{ token, currentUser, setCurrentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
