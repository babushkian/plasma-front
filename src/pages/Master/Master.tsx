import { useState, useEffect } from "react";
import { useLoaderData } from "react-router-dom";

import { Box, Typography, Button, Stack, Checkbox } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import DoersSelect from "../../components/DoerSelect/DoerSelect";
import { assignProgramsRequest, getProgramsAndDoers } from "../../utils/requests";
import { DoerType, ProgramType, ResponseType } from "./Master.types";

const blancDoerOption: DoerType = { fio_doer: "", position: "", id: 0 };

type AssignProgramRequestType = { id: number; fio_doer_id: number };
type AssignedProgramType = Record<number, AssignProgramRequestType>;

const Master = () => {
    const columnFields: (keyof ProgramType)[] = ["id", "ProgramName", "MachineName"];
    const columns: GridColDef[] = columnFields.map((columnname) => ({
        field: columnname,
        headerName: columnname,
        flex: 1,
    }));
    columns.push({
        field: "действие",
        headerName: "действие",
        flex: 1,
        renderCell: (params) => <DoersSelect rowId={params.row.id} doers={doers} assignHandler={handleDoerAssign} />,
    });

    const data = useLoaderData() as ResponseType;
    const [programsData, setProgramsData] = useState<Partial<ProgramType>[] | null>(null);
    const [doers, setDoers] = useState<DoerType[]>([]);
    const [assignedPrograms, setAssignedPrograms] = useState<AssignedProgramType>({});

    /**Когда данные загружаются, из надо подогнать под конкретную таблицу, а именно выделить
     * из пришедшего с сервера объекта только нужные имена столбцов для отображения их в таблице.
     * заполняет переменную programsData
     * необходимые колонки берет из columnFields
     * */
    useEffect(() => {
        if (data.programs !== undefined) {
            setProgramsData(
                data.programs.map((item) => {
                    const acc = columnFields.reduce<Partial<ProgramType>>((acc, field) => {
                        acc[field] = item[field];
                        return acc;
                    }, {});
                    return acc;
                })
            );
            setDoers([blancDoerOption, ...data.doers.sort((a, b) => a.fio_doer.localeCompare(b.fio_doer))]);
        }
    }, [data]);

    useEffect(() => {
        console.log(assignedPrograms);
    }, [assignedPrograms]);

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
            // выбрана пустая опция работника
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

    const handleAssignPrograms = async () => {
        //если фамилии не выбраны, запрос не посылаем
        if (Object.keys(assignedPrograms).length === 0) {
            return;
        }
        const programs = Object.values(assignedPrograms);
        await assignProgramsRequest(programs);
        // сброс заполненных работников и перезагрузка страницы
        setAssignedPrograms({});
        const data = await getProgramsAndDoers();
        if (data?.programs !== undefined) {
            setProgramsData(data.programs);
        }
    };

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">Рабочее место мастера</Typography>

                <Button
                    variant="contained"
                    onClick={handleAssignPrograms}
                    disabled={Object.keys(assignedPrograms).length === 0}
                >
                    Отправить в работу
                </Button>
                {programsData !== null && (
                    <div style={{ height: 600, width: "100%" }}>
                        console.log(programsData)
                        <DataGrid rows={programsData} columns={columns} />
                    </div>
                )}
            </Box>
        </>
    );
};

export default Master;
