import { ICreateData } from "../../utils/requests";
import { Dayjs } from "dayjs";

export const enum ProgramStatus {
    NEW = "новая",
    CREATED = "создана"
}

export type PrognameType = { ProgramName: string, program_status: ProgramStatus, PostDateTime: string, Material: string,
    id?:string, checked?: boolean
};

export type DateDiapazonType = {
    startDate: Dayjs;
    endDate: Dayjs;
}

export type handleCreateDataType = (params: ICreateData[]) => void;
export type handleSelectType = (params: ICreateData) => void;

