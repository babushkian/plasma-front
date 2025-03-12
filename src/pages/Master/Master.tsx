import { useState, useEffect, useRef, useCallback } from "react";
import { useLoaderData, Link } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { Box, Typography, Button, Stack, Checkbox } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import DoersSelect from "../../components/DoerSelect/DoerSelect";
import PrioritySelect from "../../components/PrioritySelect/PropritySelect";
import { assignProgramsRequest, getProgramsAndDoers } from "../../utils/requests";
import { DoerType, ProgramType, ProgramExtendedType, ResponseType, AssignProgramRequestType } from "./Master.types";
import { ProgramPriorityType } from "../Logist/Logist.types";

const priorityArray: ProgramPriorityType[] = Object.values(ProgramPriorityType);

const blancDoerOption: DoerType = { fio_doer: "---", position: "---", id: 0 };

type AssignedProgramType = Record<number, AssignProgramRequestType>;

const columnFields: (keyof ProgramExtendedType)[] = [
    "id",
    "ProgramName",
    "doerFio",
    "program_status",
    "dimensions",
    "program_priority",
];

const Master = () => {
    const columns = useRef<GridColDef[]>([]);

    const data = useLoaderData() as ResponseType;

    const [programsData, setProgramsData] = useState<Partial<ProgramType>[] | null>(null);
    // в переменной содержатся сфмилии исполнителей, они не меняются, поэтому useState не нужен
    const doers = useRef<DoerType[]>([]);
    const [assignedPrograms, setAssignedPrograms] = useState<AssignedProgramType>({});

    /**Когда данные загружаются, их надо подогнать под конкретную таблицу, а именно выделить
     * из пришедшего с сервера объекта только нужные имена столбцов для отображения их в таблице.
     * заполняет переменную programsData
     * необходимые колонки берет из columnFields
     * */
    useEffect(() => {
        if (data.programs !== undefined) {
            setProgramsData(
                data.programs.map((item) => {
                    const row = columnFields.reduce<Partial<ProgramExtendedType>>((acc, field) => {
                        acc[field] = item[field];
                        return acc;
                    }, {});
                    row["doerFio"] = item.fio_doers.map((doer) => doer.fio_doer).join(", ");
                    row["dimensions"] = `${Math.round(item.SheetLength)} x ${Math.round(item.SheetWidth)} x ${
                        item.Thickness
                    }`;

                    return row;
                })
            );

            doers.current = [blancDoerOption, ...data.doers.sort((a, b) => a.fio_doer.localeCompare(b.fio_doer))];
        }
    }, [data]);

    /**
     * Формирует словарь с записями, которые будут отправлены на сервер для назначения исполнителя на
     * конкретную программу. Если работник назначается на программу, в массив assignedPrograms добавляется
     * соответствующая запись. Если в селекте выбриается пустая опция - запись удаляетс яиз масива.
     * @param programId идентификатор программы, которой будет присвоен работник
     * @param doerId  массив идентификаторов работников
     * @returns
     */

    const handlePriorityChange = useCallback(
        (rowId: number, value: ProgramPriorityType) => {
            const prevItem = assignedPrograms[rowId];
            console.log("Перед сменой приоритета");
            if (prevItem) {
                console.log(prevItem.fio_doers_ids);
            } else {
                console.log("массив изменений пустой");
            }

            const newItem: AssignProgramRequestType = prevItem
                ? { ...prevItem, program_priority: value }
                : { id: rowId, program_priority: value };
            setAssignedPrograms((oldState) => ({ ...oldState, [rowId]: newItem }));

            setProgramsData((prev) =>
                prev!.map((row) => {
                    if (row.id === rowId) {
                        return { ...row, program_priority: value };
                    }
                    return row;
                })
            );
        },
        [assignedPrograms]
    );

    const handleDoerAssign = useCallback((rowId: number, doerIds: number[]) => {
        
        const prevItem = assignedPrograms[rowId];
        console.log("Перед изменением работников");
        if (prevItem) {
            console.log(prevItem.fio_doers_ids);
        } else {
            console.log("массив изменений пустой");
        }

        const newItem: AssignProgramRequestType = prevItem
            ? { ...prevItem, fio_doers_ids: doerIds } // объект уже существует
            : { id: rowId, fio_doers_ids: doerIds }; // создаем новый
        setAssignedPrograms((oldState) => ({ ...oldState, [rowId]: newItem }));
    }, [assignedPrograms]);

    const showAssinedPrograns = () => console.log("assign:", assignedPrograms);
    useEffect(showAssinedPrograns, [assignedPrograms]);

    const createColumns = useCallback(() => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let colTemplate: GridColDef = {
                field: columnname,
                headerName: columnname,
                flex: 1,
            };
            if (columnname === "ProgramName") {
                colTemplate = {
                    ...colTemplate,
                    renderCell: (params) => (
                        <MuiLink component={Link} state={params.row} to={`/parts/${params.row.ProgramName}`}>
                            {params.row.ProgramName}
                        </MuiLink>
                    ),
                };
            }
            if (columnname === "program_priority") {
                colTemplate = {
                    ...colTemplate,
                    renderCell: (params) => (
                        <PrioritySelect
                            selectedValue={params.value}
                            rowId={params.row.id}
                            priorityOptions={priorityArray}
                            assignHandler={handlePriorityChange}
                        />
                    ),
                };
            }

            return colTemplate;
        });
        clmns.push({
            field: "действие",
            headerName: "действие",
            flex: 1,
            renderCell: (params) => (
                <DoersSelect
                    selectValue={assignedPrograms[params.row.id]?.fio_doers_ids ?? []}
                    rowId={params.row.id}
                    doers={doers.current}
                    assignHandler={handleDoerAssign}
                />
            ),
        });

        return clmns;
    }, [assignedPrograms, handleDoerAssign]);

    useEffect(() => {
        columns.current = createColumns();
    }, [programsData, createColumns]);



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
                        <DataGrid rows={programsData} columns={columns.current} getRowHeight={() => "auto"} />
                    </div>
                )}
                <Button variant="contained" onClick={showAssinedPrograns}>
                    Показать состояние
                </Button>
            </Box>
        </>
    );
};

export default Master;
