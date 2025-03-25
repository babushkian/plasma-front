import { MasterProgramPartsRecordType } from "../pages/LogistTable/LogistTable.types";
import { DoerType, ProgramType } from "../pages/Master/Master.types";

export type ResponsePartsType = { data: MasterProgramPartsRecordType[]; headers: Record<string, string> };
export type OperatorResponseType = {
    data: ProgramType[];
    headers: Record<string, string>;
};
export type LogistResponseType = OperatorResponseType;
export type MasterResponseType = {
    data: ProgramType[];
    doers: DoerType[];
    headers: Record<string, string>;
};
