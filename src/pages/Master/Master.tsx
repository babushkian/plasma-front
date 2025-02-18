import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLoaderData } from "react-router-dom";
import DoersSelect from "../../components/DoerSelect/DoerSelect";
import { assignProgramsRequest } from "../../utils/requests";

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

type ResponseType = {
    programs: ProgramType[];
    doers: DoerType[];
};

const blancDoerOption: DoerType = { fio_doer: "", position: "", id: 0 };

type AssignProgramRequestType = { id: number; fio_doer_id: number };
type AssignedProgramType = Record<number, AssignProgramRequestType>;

const Master = () => {
    const data = useLoaderData() as ResponseType;
    console.log("Загрузка данных мастера");
    console.log(data);
    const [programsData, setProgramsData] = useState<ProgramType[] | null>(null);
    const [doers, setDoers] = useState<DoerType[]>([]);
    const [assignedPrograms, setAssignedPrograms] = useState<AssignedProgramType>({});
    const navigate = useNavigate();

    useEffect(() => {
        if (data.programs !== undefined) {
            setProgramsData(data.programs);
            setDoers([blancDoerOption, ...data.doers.sort((a, b) => a.fio_doer.localeCompare(b.fio_doer))]);
        }
    }, [data]);

    console.log(assignedPrograms);
    const handleDoerAssing = (programId: number, doerId: number) => {
        if (doerId === 0) {
            if (Object.keys(assignedPrograms).includes(programId.toString())) {
                //исключаем объект из списка распределенных, если у него выбрали пустого работника
                setAssignedPrograms((oldState) => {
                    const { [programId]: _, ...newState } = oldState;
                    return newState;
                });
            } else {
                return;
            }
        } else {
            const newItem: AssignProgramRequestType = { id: programId, fio_doer_id: doerId };
            setAssignedPrograms((oldState) => ({ ...oldState, [programId]: newItem }));
        }
    };

    const handleAssignPrograms = () => {
        const programs = Object.values(assignedPrograms);
        assignProgramsRequest(programs);
        // сброс заполненных работников и перезагрузка страницы
        setAssignedPrograms({});
        navigate(0);
    };

    return (
        <>
            <h2>Рабочее место мастера</h2>
            <div>
                <button onClick={handleAssignPrograms}>Отправить в работу</button>
            </div>
            <table>
                <tbody>
                    {programsData?.map((row) => {
                        return (
                            <tr key={row.id}>
                                <td>{row.ProgramName}</td>
                                <td>{row.MachineName}</td>
                                <td>
                                    {Math.round(row.SheetLength)} x {Math.round(row.SheetWidth)} x {row.Thickness}
                                </td>
                                <td>{row.fio_doer_id}</td>
                                <td>
                                    <DoersSelect
                                        rowId={row.id}
                                        doers={doers}
                                        assignHandler={handleDoerAssing}
                                    ></DoersSelect>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </>
    );
};

export default Master;
