import { useState, useEffect } from "react";
import { useLoaderData } from "react-router-dom";
import DoersSelect from "../../components/DoerSelect/DoerSelect";
import { assignProgramsRequest, getProgramsAndDoers } from "../../utils/requests";
import { DoerType, ProgramType, ResponseType } from "./Master.types";

const blancDoerOption: DoerType = { fio_doer: "", position: "", id: 0 };

type AssignProgramRequestType = { id: number; fio_doer_id: number };
type AssignedProgramType = Record<number, AssignProgramRequestType>;

const Master = () => {
    const data = useLoaderData() as ResponseType;
    const [programsData, setProgramsData] = useState<ProgramType[] | null>(null);
    const [doers, setDoers] = useState<DoerType[]>([]);
    const [assignedPrograms, setAssignedPrograms] = useState<AssignedProgramType>({});
    

    useEffect(() => {
        if (data.programs !== undefined) {
            setProgramsData(data.programs);
            setDoers([blancDoerOption, ...data.doers.sort((a, b) => a.fio_doer.localeCompare(b.fio_doer))]);
        }
    }, [data]);

    /**
     * Формирует словарь с записями, которые будут отправлены на сервер для назначения исполнителя на 
     * конкретную программу. Если работник назначается на программу, в массив assignedPrograms добавляется 
     * соответствующая запись. Если в селекте выбриается пустая опция - запись удаляетс яиз масива.
     * @param programId идентификатор программы, которой будет присвоен работник
     * @param doerId  идентификатор работника
     * @returns
     */
    const handleDoerAssign = (programId: number, doerId: number) => {
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

    const handleAssignPrograms =  async () => {
        //если фамилии не выбраны, запрос не посылаем
        if (Object.keys(assignedPrograms).length === 0) {
            return;
        }
        const programs = Object.values(assignedPrograms);
        await assignProgramsRequest(programs);
        // сброс заполненных работников и перезагрузка страницы
        setAssignedPrograms({});
        const data  = await getProgramsAndDoers()
        if (data?.programs !== undefined) {
            setProgramsData(data.programs);        
    }}

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
                                        assignHandler={handleDoerAssign}
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
