import React, { useState } from "react";
import { PrognameType, ProgramStatus } from "../../pages/MainScreen/MainScreen.types";
import TableRow from "../TableRow/TableRow";
import {handleSelectType} from "../../pages/MainScreen/MainScreen.types"
import { ICreateData } from "../../utils/requests";
// import styles from "./ProgramMainTable.module.css"



const ProgramMainTable = ({ data,  handleSelect}: { data: PrognameType[], handleSelect: handleSelectType}) => {
    const table = data.map((record) => {
        return <TableRow key={record.ProgramName} data={record} handleSelect = {handleSelect}/>;
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
