import React, { createContext } from "react";
import { DateDiapazonType } from "./pages/Techman/Techman.types";

type DateDiapazonContextType = {
    dateDiapazon: DateDiapazonType;
    setDateDiapazon: React.Dispatch<React.SetStateAction<DateDiapazonType>>;
};

export const DateDiapazonContext = createContext<DateDiapazonContextType>(undefined);
