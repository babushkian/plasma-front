import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PrognameType } from "../../pages/MainScreen/MainScreen.types";
// import styles from "./ProgramMainTable.module.css"

const ProgramMainTable = ({ data }: { data: PrognameType[] }) => {
    const table = data.map((record) => {
        return (




            <tr key={record.ProgramName}>
                
                <td><Link to={`/program/${record.ProgramName}`}>{record.ProgramName} </Link></td>
                <td>{record.program_status}</td>
                <td>{record.PostDateTime}</td>
                <td>{record.Material}</td>
            </tr>
        );
    });
    return <>
    <table><tbody>{table}</tbody></table>
    </>;
};

export default ProgramMainTable;
