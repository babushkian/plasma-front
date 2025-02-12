import React, { useState, } from "react";
import {Link} from "react-router-dom"
import { PrognameType } from "../../pages/MainScreen/MainScreen.types";



const ProgramMainTable: React.FC<{data: PrognameType[]}> = ({data}) =>{
    const table = data.map(
                    (record, index) => {
                        return <div key={record.ProgramName}>
                            <Link  to={`/program/${record.ProgramName}`}>{record.ProgramName} </Link>                            
                            {record.status}</div>
                    })
    return <>{table}</>

}


export default ProgramMainTable;
