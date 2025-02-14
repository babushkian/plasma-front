import React, { useState } from "react";
import { Link } from "react-router-dom";
import { PrognameType, ProgramStatus } from "../../pages/MainScreen/MainScreen.types";

const actionmap: Record<ProgramStatus, string> ={
    [ProgramStatus.NEW]: "создать", 
    [ProgramStatus.CREATED]: "изменить"}



const TableRow = ({ data, handleCreateData }: { data: PrognameType}) => {

    return (
    <tr>            
        <td><Link to={`/program/${data.ProgramName}`}> {data.ProgramName} </Link></td>
        <td>{data.program_status}</td>
        <td>{data.PostDateTime}</td>
        <td>{data.Material}</td>
        <td>
            <button>{actionmap[data.program_status]}</button>
        </td>
    </tr>
    )


}

export default TableRow