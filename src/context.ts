import React, { createContext } from "react";
import { DateDiapazonType } from "./pages/Techman/Techman.types";

type DateDiapazonContextType = {
    dateDiapazon: DateDiapazonType;
    setDateDiapazon: React.Dispatch<React.SetStateAction<DateDiapazonType>>;
};

type OperatorSelectContextType = { currentUserId: number; setCurrentUserId: (arg: number) => void };

export const DateDiapazonContext = createContext<DateDiapazonContextType | undefined>(undefined);
export const OperatorSelectContext = createContext<OperatorSelectContextType | undefined>(undefined); 
export const UserContext = createContext<OperatorSelectContextType | undefined>(undefined); // default user id

