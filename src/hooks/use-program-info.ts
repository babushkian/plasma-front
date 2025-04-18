import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";

export function useProgramInfo() {
    console.log("получаем информацию из  запроса")
    const {programId: programIdAdderss} = useParams()
    const programId = programIdAdderss

    const {search} = useLocation();
    const queryParams = new URLSearchParams(search);
    const programName = queryParams.get("ProgramName")
    
    const programInfo = useMemo(()=>( {programId, programName}), [programId, programName])
    return programInfo       
}