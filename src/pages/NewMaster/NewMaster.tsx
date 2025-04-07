import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { Box, Typography, Button } from "@mui/material";
import { GridColDef, useGridApiRef } from "@mui/x-data-grid";

import DumbDoerSelect from "../../components/DoerSelect/DumbDoerSelect";
import PrioritySelect from "../../components/PrioritySelect/PropritySelect";
import { assignProgramsRequest, getProgramsAndDoers } from "../../utils/requests";
import { DoerType, ProgramExtendedType, changeFieldType, ProgramType } from "../Master/Master.types";
import { ProgramPriorityType } from "../Logist/Logist.types";
import Notification from "../../components/Notification/Notification";
import { hiddenIdColumn } from "../../utils/tableInitialState";
import FilteredDataGrid from "../../components/FilterableDataGrid/FilterableDataGrid";
import { endpoints } from "../../utils/authorization";

//список приоритетов, полученный из множетсва ProgramPriorityType
const priorityArray: ProgramPriorityType[] = Object.values(ProgramPriorityType);
//колонки, которые будут обображаться в таблице
const columnFields: (keyof ProgramExtendedType)[] = [
    "id",
    "ProgramName",
    "program_priority",
    "doerIds",
    "doerFio",
    "program_status",
    "wo_numbers",
    "wo_data1",
    "Thickness",
    "SheetWidth",
    "SheetLength",
];

export function NewMaster() {
    const columns = useRef<GridColDef[]>([]); // стабильная переменная, чтобы хоанить описание столбцов

    const [data, setData] = useState<Partial<ProgramExtendedType>[] | null>(null);
    // в переменной содержатся сфмилии исполнителей, они не меняются, поэтому useState не нужен
    const doers = useRef<DoerType[]>([]);

    // объкт русификации заголовков  таблицы
    const headers = useRef({});
    const apiRef = useGridApiRef();
    // создаем стабильную переменную, чтобы внутри колбэков содержащих обработанные столбцы всегда было
    // актуальное состояние assignedProgramsRef.current , а не замороженное из-за замыкания assignedPrograms
    const [assignedPrograms, setAssignedPrograms] = useState<number[]>([]);
    const assignedProgramsRef = useRef<typeof assignedPrograms>([]);
    useEffect(() => {
        assignedProgramsRef.current = assignedPrograms;
    }, [assignedPrograms]);
    const [notification, setNotification] = useState(false); // уведомление, что данные ушли на сервер

    /**
     * Загрузка программ и операторов для отображения на странице мастера
     */
    const load = async () => {
        const response = await getProgramsAndDoers();
        if (response !== undefined) {
            console.log(response);
            setData(processData(response.data));
            doers.current = [...response.doers.sort((a, b) => a.fio_doer.localeCompare(b.fio_doer))];
            headers.current = response.headers;
        }
    };

    useEffect(() => {
        // загрузка данных при загрузке страницы
        load();
    }, []);

    const processData = (data: ProgramType[]) => {
        const processedData = data.map((item) => {
            const row = columnFields.reduce<Partial<ProgramExtendedType>>((acc, field) => {
                acc[field] = item[field];
                return acc;
            }, {});
            row["doerFio"] = item.fio_doers.map((doer) => doer.fio_doer).join(", ");
            row["doerIds"] = item.fio_doers.map((doer) => doer.id);
            return row;
        });
        console.log("processedData", processedData);
        return processedData;
    };

    /**
     * Формирует словарь с записями, которые будут отправлены на сервер для назначения исполнителя на
     * конкретную программу. Если работник назначается на программу, в массив assignedPrograms добавляется
     * соответствующая запись. Если в селекте выбриается пустая опция - запись удаляетс яиз масива.
     */

    const handleChangedCell = useCallback((rowId: number, value: string | number[], field: changeFieldType) => {
        // изменяем массив модифицированных строк
        if (!assignedProgramsRef.current.includes(rowId)) {
            setAssignedPrograms((prev) => [...prev, rowId]);
        }
        //изменяем данные в таблице
        setData((prev) =>
            prev!.map((row) => {
                if (row.id === rowId) {
                    return { ...row, [field]: value };
                }
                return row;
            })
        );
    }, []);

    type changeFieldFunction = (...args: any[]) => any;
    type changeFieldsCallback = Record<string, changeFieldFunction>

    const callbackChangedCell = useCallback((rowId: number, processObject:changeFieldsCallback) => {
        // изменяем массив модифицированных строк
        if (!assignedProgramsRef.current.includes(rowId)) {
            setAssignedPrograms((prev) => [...prev, rowId]);
        }
        //изменяем данные в таблице

        const processFields = Object.keys(processObject);
        setData((prev) =>
            prev!.map((row) => {
                if (row.id === rowId) {
                    const newRow = columnFields.reduce(
                        (acc, field) => {
                            if (processFields.includes(field)) {
                                acc[field] = processObject[field](row);
                            }
                            return acc;
                        },
                        { ...row }
                    );

                    return newRow;
                }
                return row;
            })
        );
    }, []);

    /**
     * Описываем столбцы таблицы. Внутри отдельных столбцов помещаются другие компоненты.
     * В эти копопоненты в качестве колбэков передаются функции. Так как колбэки создают
     * замыкания, если в этих функциях используется состояние, то оно може стать неактуальным.
     * Если функция не обновится, то она будет обрабатывать ланне на момент создания колбэка,
     * так что надо быть аккуратнее.
     */
    const createColumns = useCallback(() => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let colTemplate: GridColDef = {
                field: columnname,
                headerName: headers.current[columnname],
                flex: 1,
            };

            if (["wo_numbers", "wo_data1"].includes(columnname)) {
                colTemplate = {
                    ...colTemplate,
                    valueGetter: (value) => value.join(", "),
                };
            }

            if (columnname === "ProgramName") {
                colTemplate = {
                    ...colTemplate,
                    renderCell: (params) => (
                        <MuiLink
                            component={Link}
                            state={params.row}
                            to={`${endpoints.MASTER}/${params.row.ProgramName}`}
                        >
                            {params.row.ProgramName}
                        </MuiLink>
                    ),
                };
            }
            if (columnname === "program_priority") {
                colTemplate = {
                    ...colTemplate,
                    width: 170,
                    flex: 0,
                    renderCell: (params) => (
                        <PrioritySelect
                            selectedValue={params.row.program_priority}
                            rowId={params.row.id}
                            priorityOptions={priorityArray}
                            assignHandler={handleChangedCell}
                        />
                    ),
                };
            }
            if (columnname === "doerIds") {
                colTemplate = {
                    ...colTemplate,
                    headerName: "Исполнители",
                    width: 330,
                    flex: 0,
                    renderCell: (params) => (
                        <DumbDoerSelect
                            selectValue={params.row.doerIds}
                            rowId={params.row.id}
                            doers={doers.current}
                            // assignHandler={handleChangedCell}
                            assignHandler={callbackChangedCell}
                        />
                    ),
                };
            }
            return colTemplate;
        });

        return clmns;
    }, [handleChangedCell, headers]);

    useEffect(() => {
        columns.current = createColumns();
    }, [data, createColumns, headers]);

    const handleAssignPrograms = async () => {
        if (data !== null) {
            const programs = data
                // рассматриваем только те записи, у которых есть фамилии. Без фамилий приоритет поменять
                // нельзя, поле с исполнителями обязательно при отправке на сервер
                ?.filter((item) => assignedPrograms.includes(item.id) && item.doerIds.length)
                .map((item) => {
                    if (item.doerIds.length) {
                        return { id: item.id, fio_doers_ids: item.doerIds, program_priority: item.program_priority };
                    }
                    return;
                });
            console.log(programs);
            //если фамилии не выбраны, запрос не посылаем

            if (programs.length === 0) {
                return;
            }

            await assignProgramsRequest(programs);
            // сброс заполненных работников и перезагрузка страницы
            setAssignedPrograms([]);
            setNotification(true);
            load();
        }
    };

    const gridParams = useMemo(
        () => ({
            rows: data,
            setRows: setData,
            columns: columns.current,
            initialState: hiddenIdColumn,
            apiRef: apiRef,
        }),
        [apiRef, data]
    );

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
                <Notification value={notification} setValue={setNotification} />
                {data == null && "данных нет"}
                {data !== null && (
                    <div style={{ height: 700, width: "100%" }}>
                        <FilteredDataGrid {...gridParams} />
                    </div>
                )}
            </Box>
        </>
    );
}
