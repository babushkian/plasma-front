import React, { useState, useEffect, lazy, Suspense, useRef, ChangeEvent } from "react";

//import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL, URL_GET_PROGRAMS } from "../../utils/urls";
import { PrognameType } from "./Techman.types";
// import { AddDispatch, RootState } from "../../store/store";
// import { dateDiapazonActions } from "../../store/date_diapazon.slice";
// import { DateDiapazon } from "../../components/DateDiapazon/DateDiapazon";
import { DateDiapazon } from "../../components/DateDiapazon/DateDiapazon";
import { DateDiapazonType } from "./Techman.types";
import { createDataRequest, ICreateData } from "../../utils/requests";
import { Box, Typography, Button, Stack, Checkbox } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridToolbar, GridRowSelectionModel } from "@mui/x-data-grid";
import dayjs from "dayjs";
axios.defaults.withCredentials = true;

const Techman = () => {
    const defaultDates: DateDiapazonType = { startDate: dayjs().subtract(14, "day"), endDate: dayjs() };
    const [dates, setDates] = useState<DateDiapazonType>(defaultDates);
    const [data, setData] = useState<PrognameType[]>([]);
    const [selectedPrograms, setSelectedPrograms] = useState<number>(0);
    const columns = useRef<GridColDef[]>([]);

    const createColumns = () => {
        const colBuild: GridColDef[] = [];
        for (const colname in data[0]) {
            colBuild.push({ field: colname, headerName: colname, flex: 1 } satisfies GridColDef);
        }
        colBuild.push({
            field: "actions",
            headerName: "Выбрать для загрузки",
            width: 150,
            renderCell: (params: GridRenderCellParams<PrognameType>) => (
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

    // TODO:  вставить данные из глобального состояния
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
            setData(response.data);
            console.log("данные с сревера:", response.data);
            setLoading(false);
            setLoaded(true);
        } catch (error) {
            console.error("Error fetching protected data:", error);
            return;
        }
    };
    useEffect(() => {
        const temp = async () => {
            await new Promise<void>((resolve) => setTimeout(() => resolve(), 200));
            
        
        };
        loadData();
        temp();
        
    }, []);

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

    useEffect(() => {
        setSelectedPrograms(data.reduce((sum, item) => sum + Number(item.checked), 0));
    }, [data]);

    //если появились данные, нужно сформировать колонки таблицы
    useEffect(() => {
        if (loaded) {
            columns.current = createColumns();
            setData((prev) =>
                prev.map((item) => {
                    return {
                        ...item,
                        id: item.ProgramName,
                        checked: false,
                        PostDateTime: dayjs(item.PostDateTime).format("DD.MM.YYYY"),
                    };
                })
            );
            setShowTable(true);
        }
    }, [loaded]);
    // глобальное хранилице
    // const dispatchDiapazon = () => {
    //     dispatch(
    //         dateDiapazonActions.setDiapazon({
    //             startDate: convertDateToString(new Date(2025, 0, 1)),
    //             endDate: convertDateToString(new Date(2025, 1, 15)),
    //         })
    //     );
    // };
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
                    <div style={{ height: "600px", width: "100%" }}>
                        {/* параметр getRowId нужен если в нет столбца с явным id, для его динамического создания можно использовать функцию */}
                        {/* <DataGrid rows={data} columns={columns.current} density="compact" getRowId={getRowId} /> */}
                        <DataGrid
                            rows={data}
                            columns={columns.current}
                            density="compact"
                            // checkboxSelection
                            // disableRowSelectionOnClick
                            slots={{ toolbar: GridToolbar }}
                            // onRowSelectionModelChange={rowChange}
                        />
                    </div>
                )}
            </Box>
        </>
    );
};

export default Techman;
