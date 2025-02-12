import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TypedUseQueryState } from "@reduxjs/toolkit/query/react";
import { useState } from "react";


export interface IDateDiapazon {startDate: Date | null, endDate: Date| null} 

const initialState: IDateDiapazon = {startDate: null, endDate: null }

export const  dateDiapazonSlice =  createSlice({
    name:"diapazon",
    initialState,
    reducers:{
        setDiapazon: (state, action: PayloadAction<IDateDiapazon>) => {
            state.startDate = action.payload.startDate
            state.endDate = action.payload.endDate
        }
    }
})

export default dateDiapazonSlice.reducer
export const dateDiapazonActions = dateDiapazonSlice.actions