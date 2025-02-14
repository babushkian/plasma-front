import React from "react";
import { useParams, useLoaderData } from "react-router-dom";

export type ProgramPartsType = IProgramPartsRecord[]
export interface IProgramPartsRecord {
    WONumber: string
    ProgramName: string
    PartName: string
    RepeatID: number
    QtyInProcess: number
    PartLength: number
    PartWidth: number
    TrueArea: number
    RectArea: number
    TrueWeight: number
    RectWeight: number
    CuttingTime: number
    CuttingLength: number
    PierceQty: number
    NestedArea: number
    TotalCuttingTime: number
    MasterPartQty: number
    WOState: number
    DueDate: string
    RevisionNumber: string
    PK_PIP: string
  }
  


const MainScreen = () => {
    const data = useLoaderData() as ProgramPartsType
    //const {programName} = useParams() 
    return data.map((record) => <div key={record.PK_PIP}>Детали задания {`${record.ProgramName}    ${record.PartName}  ${record.RepeatID}  ${record.QtyInProcess}`}</div>);
};

export default MainScreen;
