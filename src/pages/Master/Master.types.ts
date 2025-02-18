import { ProgramType, DoerType } from "./Master.types";

export type ProgramType = {
    ProgramName: string;
    RepeatIDProgram: string;
    UsedArea: number;
    ScrapFraction: number;
    MachineName: string;
    CuttingTimeProgram: string;
    PostDateTime: string;
    Material: string;
    Thickness: number;
    SheetLength: number;
    SheetWidth: number;
    ArchivePacketID: number;
    TimeLineID: number;
    Comment: string;
    PostedByUserID: number;
    PierceQtyProgram: number;
    UserName: string;
    UserFirstName: string;
    UserLastName: string;
    UserEMail: string;
    LastLoginDate: string;
    program_status: string;
    fio_doer_id: number | null;
    id: number;
    created_at: string;
    updated_at: string;
};
export type DoerType = {
    fio_doer: string;
    position: string;
    id: number;
    created_at?: string;
    updated_at?: string;
};
export type ResponseType = {
    programs: ProgramType[];
    doers: DoerType[];
};
