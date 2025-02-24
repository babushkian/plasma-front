import React, { useState, useEffect, lazy, Suspense, useRef, ChangeEvent } from "react";

//import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL, URL_GET_PROGRAMS } from "../../utils/urls";
import { PrognameType } from "./Techman.types";
// import { AddDispatch, RootState } from "../../store/store";
// import { dateDiapazonActions } from "../../store/date_diapazon.slice";
// import { DateDiapazon } from "../../components/DateDiapazon/DateDiapazon";
import { DateDiapazon } from "../../components/DateDiapazon/MaterialDiapazon";
import { convertDateToString, convertStringToDate } from "../../utils/convert_time";
import { DateDiapazonType, ProgramStatus, handleCreateDataType, handleSelectType } from "./Techman.types";
import { createDataRequest, ICreateData } from "../../utils/requests";
import styles from "./Techman.module.css";
import { Box, TextField, Typography, Button, Stack, Checkbox } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DataGrid, GridRowsProp, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

const ProgramMainTable = lazy(() => import("../../components/ProgramMainTable/ProgramMainTable"));

axios.defaults.withCredentials = true;

const Techman = () => {
    const defaultDates: DateDiapazonType = { startDate: new Date(2025, 1, 10), endDate: new Date(2025, 1, 15) };
    const [dates, setDates] = useState<DateDiapazonType>(defaultDates);
    const [data, setData] = useState<PrognameType[]>([]);

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
                    start_date: convertDateToString(dates.startDate),
                    end_date: convertDateToString(dates.endDate),
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

    /* оправлем данные программы для обновления статуса */
    const handleCreateData = async () => {
        console.log("Вызов работает")
        const createRecords: ICreateData[] = data
            .filter((item) => item.checked === true)
            .map((item) => ({ program_status: item.program_status, ProgramName: item.ProgramName }));
        console.log("Надо проконтролировать, что что-то создалось")
        console.log(createRecords)
        await createDataRequest(createRecords);
        loadData();
    };

    const handleSelect = (props: GridRenderCellParams<PrognameType>) => {
        setData((prevRows) => prevRows.map((row) => (row.id === props.id ? { ...row, checked: !row.checked } : row)));
    };

    function getRowId(row: PrognameType): string {
        return row.ProgramName;
    }


    //если появились данные, нужно сформировать колонки таблицы
    useEffect(() => {
        if (loaded) {
            columns.current = createColumns();
            setData((prev) =>
                prev.map((item) => {
                    return { ...item, id: item.ProgramName, checked: false };
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

    const dateEvent = (e:ChangeEvent<HTMLInputElement>) =>{console.log(e.target.value, typeof e.target.value,)}
    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h4">Загрузка программ</Typography>
                <DateDiapazon defultDates={dates} setDates={setDates} />
                <Grid container spacing={2} justifyContent="center">
                    <Grid>
                        <Typography align="center">Начальная дата</Typography>
                        <TextField size="small" variant="outlined" type="date"></TextField>
                    </Grid>
                    <Grid>
                        <Typography align="center">Конечная дата</Typography>
                        <TextField size="small" type="date" onChange={dateEvent}></TextField>
                    </Grid>
                </Grid>
                <Stack spacing={2} direction="row">
                    <Button variant="contained" onClick={loadData}>
                        Получить данные
                    </Button>

                    <Button variant="contained" onClick={() => {handleCreateData()}}>
                        Отправить данные
                    </Button>
                </Stack>
                {showTable && (
                    <div style={{ height: "500px", width: "100%" }}>
                        {/* параметр getRowId нужен если в нет столбца с явным id, для его динамического создания можно использовать функцию */}
                        {/* <DataGrid rows={data} columns={columns.current} density="compact" getRowId={getRowId} /> */}
                        <DataGrid rows={data} columns={columns.current} density="compact" />
                    </div>
                )}
            </Box>
        </>
    );
};

export default Techman;
