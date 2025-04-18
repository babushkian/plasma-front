import { useRef } from "react";
import { useLocation, useParams } from "react-router-dom";

export function useProgramInfo() {
    console.log("получаем информацию из  запроса")
    const {programId: programIdAdderss} = useParams()
    // const programId = useRef(programIdAdderss)
    const programId = programIdAdderss

    const {search} = useLocation();
    const queryParams = new URLSearchParams(search);
    // const programName = useRef(queryParams.get("ProgramName"))
    const programName = queryParams.get("ProgramName")
    return {programId, programName}        
}