import React, { useState, createContext, ReactNode } from "react";
import { DateDiapazonType } from "./pages/Techman/Techman.types";
import { UserType } from "./pages/Login/Login.types";
import { getUserFromStore } from "./utils/local-storage";
import dayjs from "dayjs";

type DateDiapazonContextType = {
    dateDiapazon: DateDiapazonType;
    setDateDiapazon: React.Dispatch<React.SetStateAction<DateDiapazonType>>;
};

type OperatorSelectContextType = { currentUserId: number; setCurrentUserId: (arg: number) => void };
type UserContextType = {
    currentUser: UserType | undefined;
    setCurrentUser: React.Dispatch<React.SetStateAction<UserType | undefined>>;
};

const defaultDates: DateDiapazonType = {
    startDate: dayjs().subtract(7, "day"),
    endDate: dayjs(),
};

export const DateDiapazonContext = createContext<DateDiapazonContextType | undefined>(undefined);
export const OperatorSelectContext = createContext<OperatorSelectContextType | undefined>(undefined);
export const UserContext = createContext<UserContextType | undefined>(undefined);

const MasterContext = ({ children }: ReactNode) => {
    const [dateDiapazon, setDateDiapazon] = useState<DateDiapazonType>(defaultDates);
    const [currentUserId, setCurrentUserId] = useState<number>(10);
    const [currentUser, setCurrentUser] = useState<UserType | undefined>(getUserFromStore);
    console.log("юзер:", currentUser);

    return (
        <>
            <DateDiapazonContext.Provider value={{ dateDiapazon, setDateDiapazon }}>
                <OperatorSelectContext.Provider value={{ currentUserId, setCurrentUserId }}>
                    <UserContext.Provider value={{ currentUser, setCurrentUser }}>{children}</UserContext.Provider>
                </OperatorSelectContext.Provider>
            </DateDiapazonContext.Provider>
        </>
    );
};

export default MasterContext;
