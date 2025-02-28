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
import { Box, Typography, Button, Stack, Checkbox } from "@mui/material";
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
const columnDict: Partial<{ [key in ProgNameKeysType]: string }> = {
    PostDateTime: "string",
    ProgramName: "string",
    program_status: "string",
    UserName: "singleSelect",
    Material: "string",
};



type selecOptionsType = { [key in  ProgNameKeysType]: string[] } | undefined;

/**
 * Сам компонент
 * @returns
 */
const Techman = () => {
    const defaultDates: DateDiapazonType = {
        startDate: dayjs().subtract(2, "day"),
        endDate: dayjs().subtract(1, "day"),
    };
    const apiRef = useGridApiRef();
    const [dates, setDates] = useState<DateDiapazonType>(defaultDates);
    const [rawData, setRawData] = useState<PrognameType[]>([]);
    const [data, setData] = useState<ProcessedPrognameType[]>([]);
    const [selectedPrograms, setSelectedPrograms] = useState<number>(0);
    const columns = useRef<GridColDef[]>([]);
    const userOptions = useRef<selecOptionsType>(undefined);
    const [filterValue, setFilterValue] = useState(blancOption);

    const createColumns = () => {
        const colBuild: GridColDef[] = Object.entries(columnDict).map(([columnname, type]) => {
            console.log("опции для выбора", userOptions.current);
            const colName = columnname as keyof typeof columnDict
            let colDef: GridColDef = {
                field: colName,
                headerName: colName,
                flex: 1,
                type: type as GridColType,                
            } satisfies GridColDef;

            if (type === "singleSelect") {
                colDef = {
                    ...colDef,
                    type: 'singleSelect',
                    valueOptions: userOptions.current ? userOptions.current[colName]:[] ,
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
    const [showTable, setShowTable] = useState(false);

    // чтобы они отображались, их нудно сделать сотсояниям, а то при присвоении экран не перерисовывается
    // const { startDate: startDateState, endDate: endDateState } = useSelector((state: RootState) => state.diapazon);

    //если появились данные, нужно сформировать колонки таблицы
    const processData: (data: PrognameType[]) => ProcessedPrognameType[] = (data) => {
        if (loaded) {
            const tableOptions: selecOptionsType = {};
            const enriched = data.map((item) => {
                (Object.keys(columnDict) as ProgNameKeysType[]).forEach((key) => {
                    if (columnDict[key] === "singleSelect") {
                        if (tableOptions[key] === undefined) {
                            tableOptions[key] = [blancOption, item[key]];
                        } else {
                            if (!tableOptions[key].includes(item[key])) {
                                tableOptions[key].push(item[key]);
                            }
                        }
                    }
                });
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

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (loaded) {
            setData(processData(rawData));
            columns.current = createColumns();
            setShowTable(true);
        }
    }, [loaded, rawData]);

    /* оправлем данные программы для обновления статуса */
    const handleCreateData = async () => {
        console.log("Вызов работает");
        const createRecords: ICreateData[] = data
            .filter((item) => item.checked === true)
            .map((item) => ({ program_status: item.program_status, ProgramName: item.ProgramName }));
        console.log("Надо проконтролировать, что что-то создалось");
        console.log(createRecords);
        await createDataRequest(createRecords);
        loadData();
    };

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

    function getRowId(row: PrognameType): string {
        return row.ProgramName;
    }

    /**Когда прищедшие с сервера данные добработаны, позволяет таблице отображаться */
    useEffect(() => {
        if (data !== undefined) {
            setSelectedPrograms(data.reduce((sum, item) => sum + Number(item.checked), 0));
        }
        console.log("данные:");
        console.log(data);
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

    const handleFilterChange = (e: SelectChangeEvent) => {
        const value = e.target.value;
        if (value === blancOption) {
            apiRef.current.setFilterModel({
                items: [],
            });
        } else {
            apiRef.current.setFilterModel({
                items: [{ field: "UserName", operator: "is", value: value }],
            });
        }
        setFilterValue(value);
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
                {showTable && (
                    <div style={{ height: "700px", width: "100%" }}>
                        {/* <Stack spacing={2} direction="row">
                            <FormControl variant="outlined" style={{ marginBottom: "16px", minWidth: 200 }}>
                                <InputLabel>Пользователь</InputLabel>
                                <Select value={filterValue} label="Filter" onChange={handleFilterChange}>
                                    {userOptions.current["UserName"].map((item) => (
                                        <MenuItem key={item} value={item}>
                                            {item}
                                        </MenuItem>
                                    ))}
                                </Select>
                                </FormControl>
                                <FormControl variant="outlined" style={{ marginBottom: "16px", minWidth: 200 }}>
                                <InputLabel>Статус</InputLabel>
                                <Select  label="Filter2" >
                                <MenuItem key={1} value={"новая"}>
                                новая
                                </MenuItem>
                                <MenuItem key={1} value={"старая"}>
                                старая
                                </MenuItem>

                                </Select>
                           </FormControl>
                        </Stack> */}
                        {/* параметр getRowId нужен если в нет столбца с явным id, для его динамического создания можно использовать функцию */}
                        {/* <DataGrid rows={data} columns={columns.current} density="compact" getRowId={getRowId} /> */}
                        <DataGrid
                            rows={data}
                            columns={columns.current}
                            density="compact"
                            // getRowId={getRowId}
                            // checkboxSelection
                            // disableRowSelectionOnClick
                            slots={{ toolbar: GridToolbar }}
                            apiRef={apiRef}
                            // onRowSelectionModelChange={rowChange}
                        />
                    </div>
                )}
            </Box>
        </>
    );
};

export default Techman;
