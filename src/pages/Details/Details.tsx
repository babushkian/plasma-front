import React from "react";
import { useLoaderData } from "react-router-dom";

export type ProgramPartsType = IProgramPartsRecord[];
export interface IProgramPartsRecord {
    WONumber: string;
    ProgramName: string;
    PartName: string;
    RepeatID: number;
    QtyInProcess: number;
    PartLength: number;
    PartWidth: number;
    TrueArea: number;
    RectArea: number;
    TrueWeight: number;
    RectWeight: number;
    CuttingTime: number;
    CuttingLength: number;
    PierceQty: number;
    NestedArea: number;
    TotalCuttingTime: number;
    MasterPartQty: number;
    WOState: number;
    DueDate: string;
    RevisionNumber: string;
    PK_PIP: string;
}

const Details = () => {
    const data = useLoaderData() as ProgramPartsType;
    const tableBody = data.map((record, index) => {
        return (
            <tr key={index}>
                {(Object.keys(record) as Array<keyof IProgramPartsRecord>).map((cellData, cellindex) => (
                    <td key={cellindex}> {record[cellData]}</td>
                ))}
            </tr>
        );
    });
    return <table> <tbody>{tableBody}</tbody></table>
};

export default Details;
