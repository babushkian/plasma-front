import { ProgramPriorityType, LogistProgramType } from "../Logist/Logist.types";

export type ProgramType =  LogistProgramType & {fio_doers: DoerType[]};

export type DoerType = {
    fio_doer: string;
    position: string;
    is_active: boolean;
    id: number;
    created_at?: string;
    updated_at?: string;
};


export type ProgramExtendedType = ProgramType & { doerFio: string; dimensions: string };

export type ResponseType = {
    programs: ProgramType[];
    doers: DoerType[];
};
export type AssignProgramRequestType = {
    id: number;
    fio_doers_ids: Array<number>;
    program_priority?: ProgramPriorityType;
};
