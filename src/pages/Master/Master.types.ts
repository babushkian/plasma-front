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
    path_to_ods: string | null;
    master_fio_id: number | null;
    time_program_started: string | null;
    time_program_finished: string | null;
    program_status: string;
    program_priority: ProgramPriorityType;
    id: number;
    created_at: string;
    updated_at: string;
    fio_doers: DoerType[];
};

export type DoerType = {
    fio_doer: string;
    position: string;
    id: number;
    created_at?: string;
    updated_at?: string;
};

export type ProgramExtendedType = ProgramType & { doerFio: string; dimensions: string };

export type ProgramPriorityType = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ResponseType = {
    programs: ProgramType[];
    doers: DoerType[];
};
export type AssignProgramRequestType = {
    id: number;
    fio_doers_ids: Array<number>;
    program_priority?: ProgramPriorityType;
};

fio_doer_id