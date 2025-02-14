import React, { useState } from "react";
import { PrognameType, ProgramStatus } from "../../pages/MainScreen/MainScreen.types";
import TableRow from "../TableRow/TableRow";
import {handleCreateDataType} from "../../pages/MainScreen/MainScreen.types"
// import styles from "./ProgramMainTable.module.css"



const ProgramMainTable = ({ data,  handleCreateData}: { data: PrognameType[], handleCreateData: handleCreateDataType}) => {
    const table = data.map((record) => {
        return <TableRow key={record.ProgramName} data={record} handleCreateData = {handleCreateData}/>;
    });
    return (
        <>
            <table>
                <tbody>{table}</tbody>
            </table>
        </>
    );
};

export default ProgramMainTable;
