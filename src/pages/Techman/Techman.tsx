import React, { useState, useEffect, lazy, Suspense, useRef, ChangeEvent, useContext, useMemo } from "react";

import { Link } from "react-router-dom";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar.tsx";
import { TechProgramType, ProcessedPrognameType, DateDiapazonType, ICreateData } from "./Techman.types.ts";
import { DateDiapazon } from "../../components/DateDiapazon/DateDiapazon.tsx";
import Notification from "../../components/Notification/Notification.tsx";
import { createDataRequest, getNewPrograms } from "../../utils/requests.ts";
import { Box, Typography, Button, Stack, Checkbox, Link as MuiLink } from "@mui/material";
import FilteredDataGrid from "../../components/FilterableDataGrid/FilterableDataGrid.tsx";
import { hiddenIdColumn } from "../../utils/tableInitialState.ts";
import {
    DataGrid,
    GridColDef,
    GridColType,
    GridRenderCellParams,
    GridSingleSelectColDef,
    useGridApiRef,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
import { DateDiapazonContext } from "../../context.tsx";
import { endpoints } from "../../utils/authorization.ts";

type PrognameAndIdType = Exclude<TechProgramType, undefined> & { id: string; checked: boolean };

type ProgNameKeysType = keyof PrognameAndIdType;

// колонки, которые будут отображаться в таблице
const columnDict: Partial<{ [key in ProgNameKeysType]: string }> = {
    PostDateTime: "string",
    ProgramName: "string",
    program_status: "singleSelect",
    UserName: "singleSelect",
    Material: "string",
};

type ProgramFilterStatusType = "новые" | "загруженные";

type originalDataType = Record<ProgramFilterStatusType, ProcessedPrognameType[]> | undefined;

//const initialColumnFields = ["PostDateTime", "ProgramName", "program_status", "UserName", "Material"];
const columnFields = ["id", "PostDateTime", "ProgramName", "program_status", "UserName", "Material", "checked"];

/**
 * Сам компонент
 * @returns
 */
export function Techman() {
    // интерфейс для управления таблицей
    const apiRef = useGridApiRef();
    // диапазон дат, за который будут загружаться данные
    const dateDiapazonContext = useContext(DateDiapazonContext);
    if (!dateDiapazonContext) {
        throw new Error("не определено начальное значение для диапазона загрузки программ");
    }
    const { dateDiapazon, setDateDiapazon } = dateDiapazonContext;
    const [originalData, setOriginalData] = useState<originalDataType>(undefined);
    // данные, обработанные для отображения в таблице(все данные целиком, в том числе и те, которые не показываются)
    const [data, setData] = useState<ProcessedPrognameType[]>([]);
    // количество программ, выделенных для загрузки в нашу таблицу из сигмы
    const [selectedPrograms, setSelectedPrograms] = useState<number>(0);
    // стабильная переменная для храенеия данных о столбцах таблицы]
    const columns = useRef<GridColDef[]>([]);
    const [noData, setNoData] = useState(false);
    
    const programFilterStatus = useRef<ProgramFilterStatusType>("новые");

    const createColumns = (headers) => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            const colName = columnname as keyof typeof columnDict;
            let col: GridColDef = {
                field: colName,
                headerName: headers[colName],
                flex: 1,
            };
            if (columnname === "ProgramName") {
                col = {
                    ...col,
                    renderCell: (params) => (
                        <MuiLink
                            component={Link}
                            state={params.row}
                            to={`${endpoints.TECHMAN}/${params.row.ProgramName}`}
                        >
                            {params.row.ProgramName}
                        </MuiLink>
                    ),
                };
            }
            if (columnname === "checked") {
                col = {
                    ...col,
                    width: 150,
                    renderCell: (params: GridRenderCellParams<ProcessedPrognameType>) => (
                        <Checkbox checked={params.row.checked} onChange={() => handleSelect(params)} />
                    ),
                };
            }
            return col;
        });
        return clmns;
    };

    // свидетельствует о том, что данные получены с сервера, можно их обработать
    // можно показывать таблицу
    const [showTable, setShowTable] = useState(false);
    const [notification, setNotification] = useState(false); // всплывающее уведомление, что данные ушли на сервер

    //если появились данные, нужно сформировать колонки таблицы
    // Добавляем к исходным данным колокии
    const prepareData: (data: TechProgramType[]) => ProcessedPrognameType[] = (data) => {
        const newProgams: ProcessedPrognameType[] = [];
        const loadedProgams: ProcessedPrognameType[] = [];
        data.forEach((item) => {
            const prepared = {
                ...item,
                id: item.ProgramName,
                checked: false,
                PostDateTime: dayjs(item.PostDateTime).format("YYYY-MM-DD"),
            };

            if (item.program_status === "новая") {
                newProgams.push(prepared);
            } else {
                loadedProgams.push(prepared);
            }
        });
        return { новые: newProgams, загруженные: loadedProgams } satisfies Exclude<originalDataType, undefined>;
    };

    /*загружаем даные о програмах с сервера*/
    const loader = async (diapazon: DateDiapazonType) => {
        setShowTable(false);
        setNoData(false);

        const response = await getNewPrograms({
            start_date: diapazon.startDate.format("YYYY-MM-DD"),
            end_date: diapazon.endDate.format("YYYY-MM-DD"),
        });
        if (response) {
            if (response.data.length > 0) {
                const processed = prepareData(response.data);
                setOriginalData(processed);
                setData(processed[programFilterStatus.current]);

                columns.current = createColumns({ ...response.headers, checked: "выбрать для загрузки" });
                setShowTable(true);
            } else {
                setNoData(true);
            }
        }
    };

    // первоначальная загрузка данных
    useEffect(() => {
        loader(dateDiapazon);
    }, []);

    /**
     * Отправлем данные программы для загрузки из базы Плазмы в нашу базу.
     */
    const handleCreateData = async () => {
        const createRecords: ICreateData[] = data
            .filter((item) => item.checked === true)
            .map((item) => ({ program_status: item.program_status, ProgramName: item.ProgramName }));
        console.log(createRecords);
        await createDataRequest(createRecords);
        setNotification(true);
        loader(dateDiapazon);
    };

    //обработка выбора строк с помощью чекбокса
    const handleSelect = (props: GridRenderCellParams<TechProgramType>) => {
        // изменение данных в исходной таблице
        // вообще, данные в ней нужно менять только после изменения значения фильтра (или его сборса)
        setData((prevRows) =>
            prevRows.map((row) => {
                if (row.id === props.id) {
                    return { ...row, checked: !row.checked };
                }
                return row;
            })
        );
    };

    const switchTableData = () => {
        const cuttentFilter = programFilterStatus.current !== "новые" ? "новые" : "загруженные"
        const temp = [...data]
        setOriginalData(prev => ({...prev, [programFilterStatus.current]: temp} as originalDataType))
        programFilterStatus.current = cuttentFilter

    };

    useEffect(() => {
        if (originalData) {
            setData(originalData[programFilterStatus.current]);            
        }
    }, [originalData]);


    /**Считает количество выделенных чекбоксами строк*/
    useEffect(() => {
        if (data?.length > 0) {
            setSelectedPrograms(data.reduce((sum, item) => sum + Number(item.checked), 0));
        }
    }, [data]);

    const selectCurrentday = () => {
        const diap: DateDiapazonType = { startDate: dayjs(), endDate: dayjs() };
        setDateDiapazon(diap);
        loader(diap);
    };

    const selectWeek = () => {
        const diap: DateDiapazonType = { startDate: dayjs().subtract(7, "days"), endDate: dayjs() };
        setDateDiapazon(diap);
        loader(diap);
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
                <Typography variant="h5">Загрузка программ</Typography>
                <Stack spacing={2} direction="row">
                    <DateDiapazon dates={dateDiapazon} setDates={setDateDiapazon} />
                    <Button variant="contained" onClick={() => loader(dateDiapazon)}>
                        за период
                    </Button>
                    <Box width={50} />
                    <Button variant="contained" onClick={selectCurrentday}>
                        за сегодня
                    </Button>
                    <Button variant="contained" onClick={selectWeek}>
                        за неделю
                    </Button>
                </Stack>
                <Stack spacing={2} direction="row">
                    <Button variant="contained" onClick={switchTableData} sx={{ width: 150 }}>
                        {programFilterStatus.current}
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => {
                            handleCreateData();
                        }}
                        disabled={!Boolean(selectedPrograms).valueOf()}
                    >
                        Отправить выбранные программы
                    </Button>
                </Stack>
                <Notification value={notification} setValue={setNotification} />
                {noData && <Typography variant="h6">Данные за указанный период отсутствуют.</Typography>}
                {showTable && (
                    <div style={{ height: "600px", width: "100%" }}>
                        <FilteredDataGrid {...gridParams} />
                    </div>
                )}
            </Box>
        </>
    );
}
