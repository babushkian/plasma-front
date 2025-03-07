import { Dayjs } from "dayjs";

export const enum ProgramStatus {
    NEW = "новая",
    CREATED = "создана",
}

export type TechProgramType = {
    ProgramName: string;
    program_status: ProgramStatus;
    UserName: string;
    PostDateTime: string;
    Material: string;
};

export type ProcessedPrognameType = TechProgramType & { id: string; checked: boolean };

export type DateDiapazonType = {
    startDate: Dayjs;
    endDate: Dayjs;
};

export type handleCreateDataType = (params: ICreateData[]) => void;
export type handleSelectType = (params: ICreateData) => void;

export interface ICreateData {
    program_status: ProgramStatus;
    ProgramName: string;
}
