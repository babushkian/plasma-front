import React, { createContext } from "react";
import { DateDiapazonType } from "./pages/Techman/Techman.types";

type DateDiapazonContextType = {
    dateDiapazon: DateDiapazonType;
    setDateDiapazon: React.Dispatch<React.SetStateAction<DateDiapazonType>>;
};

type UserContextType = { currentUserId: number; setCurrentUserId: (arg: number) => void };

export const DateDiapazonContext = createContext<DateDiapazonContextType | undefined>(undefined);
export const UserContext = createContext<UserContextType | undefined>(undefined); // default user id
