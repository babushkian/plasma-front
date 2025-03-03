import React, { useState, useEffect, lazy, Suspense, useRef, ChangeEvent } from "react";

//import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL, URL_GET_PROGRAMS } from "../../utils/urls";
import { PrognameType, ProcessedPrognameType } from "./Techman.types";
// import { AddDispatch, RootState } from "../../store/store";
// import { dateDiapazonActions } from "../../store/date_diapazon.slice";
// import { DateDiapazon } from "../../components/DateDiapazon/DateDiapazon";
import { DateDiapazon } from "../../components/DateDiapazon/DateDiapazon";
import { DateDiapazonType } from "./Techman.types";
import { createDataRequest } from "../../utils/requests";
import { ICreateData } from "./Techman.types";
import { Box, Typography, Button, Stack, Checkbox, TextField } from "@mui/material";
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from "@mui/material";

import {
    DataGrid,
    GridColDef,
    GridColType,
    GridRenderCellParams,
    ValueOptions,
    GridToolbar,
    GridRowSelectionModel,
    GridSingleSelectColDef,
    useGridApiRef,
} from "@mui/x-data-grid";
import dayjs from "dayjs";
axios.defaults.withCredentials = true;

type PrognameAndIdType = Exclude<PrognameType, undefined> & { id: string; checked: boolean };

const blancOption = "---";

type ProgNameKeysType = keyof PrognameAndIdType;

// колонки, которые будут отображаться в таблице
const columnDict: Partial<{ [key in ProgNameKeysType]: string }> = {
    PostDateTime: "string",
    ProgramName: "string",
    program_status: "singleSelect",
    UserName: "singleSelect",
    Material: "string",
};

// структура, формирующая опуии для авпадающих списков для полей типа "singleSelect"
type selecOptionsType = Partial<{ [key in ProgNameKeysType]: string[] }> | undefined;

/**
 * Сам компонент
 * @returns
 */
const Techman = () => {
    // даты определяющие за какой период сказивать данные. Выставляемые по умолчанию при загрузке станицы
    const defaultDates: DateDiapazonType = {
        startDate: dayjs().subtract(7, "day"),
        endDate: dayjs(),
    };
    // интерфейс для управления таблицей
    const apiRef = useGridApiRef();
    // диапазон дат, за который будут загружаться данные
    const [dates, setDates] = useState<DateDiapazonType>(defaultDates);
    //данные пришедшие из запроса в первоначальном виде
    const [rawData, setRawData] = useState<PrognameType[]>([]);
    // данные, обработанные для отображения в таблице
    const [data, setData] = useState<ProcessedPrognameType[]>([]);
    // список программ, выделенных для загрузки в нашу таблицу из сигмы
    const [selectedPrograms, setSelectedPrograms] = useState<number>(0);
    // стабильная переменная для храенеия данных о столбцах таблицы]
    const columns = useRef<GridColDef[]>([]);
    // пользователи, хранимые в выпадающем списке для фильтрации
    const userOptions = useRef<selecOptionsType>(undefined);
    // список значений выставленных в выпадающих фильтрах, по которым фильтруется таблица

    const [filterValue, setFilterValue] = useState<Partial<Record<ProgNameKeysType, string>>>({});
    const [noData, setNoData] = useState(false);

    const createColumns = () => {
        const colBuild: GridColDef[] = Object.entries(columnDict).map(([columnname, type]) => {
            console.log("опции для выбора", userOptions.current);
            const colName = columnname as keyof typeof columnDict;
            let colDef: GridColDef = {
                field: colName,
                headerName: colName,
                flex: 1,
                type: type as GridColType,
            };

            if (type === "singleSelect") {
                colDef = {
                    ...colDef,
                    valueOptions: userOptions.current ? userOptions.current[colName] : [],
                } as GridSingleSelectColDef;
            }
            return colDef;
        });

        colBuild.push({
            field: "actions",
            headerName: "Выбрать для загрузки",
            type: "actions",
            width: 150,
            renderCell: (params: GridRenderCellParams<ProcessedPrognameType>) => (
                <Checkbox checked={params.row.checked} onChange={() => handleSelect(params)} />
            ),
        });
        return colBuild;
    };

    // const dispatch = useDispatch<AddDispatch>();
    // свидетельствует о том, что данные загружаются
    const [loading, setLoading] = useState(false);
    // свидетельствует о том, что данные получены с сервера, можно их обработать
    const [loaded, setLoaded] = useState(false);
    // можно показывать таблицу
    const [showTable, setShowTable] = useState(false);

    // чтобы они отображались, их нудно сделать сотсояниям, а то при присвоении экран не перерисовывается
    // const { startDate: startDateState, endDate: endDateState } = useSelector((state: RootState) => state.diapazon);

    //если появились данные, нужно сформировать колонки таблицы
    // Добавляем к исходным данным колокии
    const processData: (data: PrognameType[]) => ProcessedPrognameType[] = (data) => {
        if (loaded) {
            const tableOptions: selecOptionsType = {};
            const enriched = data.map((item) => {
                (Object.keys(columnDict) as ProgNameKeysType[]).forEach((key) => {
                    // формируем опции для ыпадающих списков
                    if (columnDict[key] === "singleSelect") {
                        if (tableOptions[key] === undefined) {
                            tableOptions[key] = [blancOption, item[key]];
                            setFilterValue((prev) => ({ ...prev, [key]: blancOption }));
                        } else {
                            if (!tableOptions[key].includes(item[key])) {
                                tableOptions[key].push(item[key]);
                            }
                        }
                    }
                });
                // возвращаем данные с добавлением колонок id и checked
                return {
                    ...item,
                    id: item.ProgramName,
                    checked: false,
                    PostDateTime: dayjs(item.PostDateTime).format("DD.MM.YYYY"),
                };
            });
            console.log("список опций для селекта", tableOptions);
            userOptions.current = tableOptions;
            return enriched;
        }
        return [];
    };

    /*загружаем заные о програмах */
    const loadData = async () => {
        setShowTable(false);
        setLoading(true);
        setLoaded(false);
        setNoData(false);
        // задержка загрузки данных для того, чтобы отправленные на сервер данные успели обновиться
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 400));
        try {
            const response = await axios.get<PrognameType[]>(`${BASE_URL}/${URL_GET_PROGRAMS}`, {
                params: {
                    start_date: dates.startDate.format("YYYY-MM-DD"),
                    end_date: dates.endDate.format("YYYY-MM-DD"),
                },
            });
            if (response.data) {
                setRawData(response.data);
                console.log("данные с сревера:", response.data);
                setLoaded(true);
            }
        } catch (error) {
            console.error("Error fetching protected data:", error);
            return;
        } finally {
            setLoading(false);
        }
    };

    // первоначальная загрузка данных
    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (loaded && rawData.length > 0) {
            setData(processData(rawData));
            columns.current = createColumns();
            setShowTable(true);
        } else if (loaded && rawData.length === 0) {
            setNoData(true);
        }
    }, [loaded, rawData]);



    /* оправлем данные программы для обновления статуса */
    const handleCreateData = async () => {
        const createRecords: ICreateData[] = data
            .filter((item) => item.checked === true)
            .map((item) => ({ program_status: item.program_status, ProgramName: item.ProgramName }));
        console.log("Надо проконтролировать, что что-то создалось");
        console.log(createRecords);
        await createDataRequest(createRecords);
        loadData();
    };

    //обработка выбора строк с помощью чекбокса
    const handleSelect = (props: GridRenderCellParams<PrognameType>) => {
        setData((prevRows) =>
            prevRows.map((row) => {
                if (row.id === props.id) {
                    return { ...row, checked: !row.checked };
                }
                return row;
            })
        );
    };

    /**Считает количество выделенных чекбоксами строк*/
    useEffect(() => {
        if (data?.length > 0) {
            setSelectedPrograms(data.reduce((sum, item) => sum + Number(item.checked), 0));
        }
    }, [data]);

    // глобальное хранилице
    // const dispatchDiapazon = () => {
    //     dispatch(
    //         dateDiapazonActions.setDiapazon({
    //             startDate: convertDateToString(new Date(2025, 0, 1)),
    //             endDate: convertDateToString(new Date(2025, 1, 15)),
    //         })
    //     );
    // };

    const handleFilterChange = (e: SelectChangeEvent, filterField: string) => {
        const value = e.target.value;
        if (value === blancOption) {
            apiRef.current.setFilterModel({
                items: [],
            });
        } else {
            apiRef.current.setFilterModel({
                items: [{ field: filterField, operator: "is", value: value }],
            });
        }
        setFilterValue((prev) => {
            const a = Object.keys(prev).map((key) => [key, blancOption]);
            const b = Object.fromEntries(a);
            b[filterField] = value;
            return b;
        });
    };

    /**
     * Сигнализирует, что количество выделенных строк в таблице изменилось.
     * Работает только если включить опцию выделения рядов через чекбоксы checkboxSelection
     * @param newSelectionModel
     */
    const rowChange = (newSelectionModel: GridRowSelectionModel) => {
        console.log(newSelectionModel);
    };

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">Загрузка программ</Typography>
                <DateDiapazon defultDates={dates} setDates={setDates} />
                <Stack spacing={2} direction="row">
                    <Button variant="contained" onClick={loadData}>
                        Получить данные
                    </Button>

                    <Button
                        variant="contained"
                        onClick={() => {
                            handleCreateData();
                        }}
                        disabled={!Boolean(selectedPrograms).valueOf()}
                    >
                        Отправить данные
                    </Button>
                </Stack>
                {noData && <Typography variant="h6">Данные за указанный период отсутствуют.</Typography>}
                {showTable && (
                    <div style={{ height: "600px", width: "100%" }}>
                        <Stack spacing={2} direction="row" sx={{ pb: 2,  px:1}}>
                            <FormControl variant="outlined" style={{ minWidth: 200 }}>
                                <InputLabel>Пользователь</InputLabel>
                                <Select
                                    value={filterValue["UserName"]}
                                    label="Filter"
                                    onChange={(e) => handleFilterChange(e, "UserName")}
                                >
                                    {userOptions.current["UserName"].map((item) => (
                                        <MenuItem key={item} value={item}>
                                            {item}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl variant="outlined" style={{ minWidth: 200 }}>
                                <InputLabel>Статус</InputLabel>
                                <Select
                                    label="Filter2"
                                    value={filterValue["program_status"]}
                                    onChange={(e) => handleFilterChange(e, "program_status")}
                                >
                                    {userOptions.current["program_status"].map((item) => (
                                        <MenuItem key={item} value={item}>
                                            {item}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField sx={"flex:1"} placeholder="поиск по всей таблице" />
                            <Button variant="outlined">Найти</Button>
                            <Button variant="outlined" color="error">
                                сбросить
                            </Button>
                        </Stack>

                        <DataGrid
                            rows={data}
                            columns={columns.current}
                            density="compact"
                            // checkboxSelection
                            // disableRowSelectionOnClick
                            // onRowSelectionModelChange={rowChange}
                            slots={{ toolbar: GridToolbar }}
                            apiRef={apiRef}
                        />
                    </div>
                )}
            </Box>
        </>
    );
};

export default Techman;
