import { ICreateData } from "../../utils/requests";

export const enum ProgramStatus {
    NEW = "новая",
    CREATED = "создана"
}

export type PrognameType = { ProgramName: string, program_status: ProgramStatus, PostDateTime: string, Material: string};

export type DateDiapazonType = {
    startDate: Date;
    endDate: Date;
}

export type handleCreateDataType = (params: ICreateData) => void;
