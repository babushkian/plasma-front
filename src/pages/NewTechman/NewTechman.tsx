import React, { useState, useEffect, lazy, Suspense, useRef, ChangeEvent, useContext } from "react";

import { Link, useNavigate } from "react-router-dom";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";
import { TechProgramType, ProcessedPrognameType, DateDiapazonType, ICreateData } from "../Techman/Techman.types.ts";
import { DateDiapazon } from "../../components/DateDiapazon/DateDiapazon";
import Notification from "../../components/Notification/Notification";
import { createDataRequest, getNewPrograms } from "../../utils/requests";
import { Box, Typography, Button, Stack, Checkbox, Link as MuiLink } from "@mui/material";

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

const initialColumnFields = ["PostDateTime", "ProgramName", "program_status", "UserName", "Material"];
const columnFields = ["id","PostDateTime", "ProgramName", "program_status", "UserName", "Material", "checked"];

// структура, формирующая опуии для авпадающих списков для полей типа "singleSelect"
type selecOptionsType = Partial<{ [key in ProgNameKeysType]: string[] }> | undefined;

/**
 * Сам компонент
 * @returns
 */
export function NewTechman() {
    // интерфейс для управления таблицей
    const apiRef = useGridApiRef();
    // диапазон дат, за который будут загружаться данные
    const dateDiapazonContext = useContext(DateDiapazonContext);
    if (!dateDiapazonContext) {
        throw new Error("не определено начальное значение для диапазона загрузки программ");
    }
    const { dateDiapazon, setDateDiapazon } = dateDiapazonContext;

    // данные, обработанные для отображения в таблице(все данные целиком, в том числе и те, которые не показываются)
    const [data, setData] = useState<ProcessedPrognameType[]>([]);
    // количество программ, выделенных для загрузки в нашу таблицу из сигмы
    const [selectedPrograms, setSelectedPrograms] = useState<number>(0);
    // стабильная переменная для храенеия данных о столбцах таблицы]
    const columns = useRef<GridColDef[]>([]);
    const [noData, setNoData] = useState(false);
    // объект русификации заголовков  таблицы
    const navigate = useNavigate();

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
                }
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
        const prepared = data.map((item) => {
            // возвращаем данные с добавлением колонок id и checked
            return {
                ...item,
                id: item.ProgramName,
                checked: false,
                PostDateTime: dayjs(item.PostDateTime).format("YYYY-MM-DD"),
            };
        });        
        return prepared;
    };

    /*загружаем даные о програмах с сервера*/
    const loader = async (diapazon: DateDiapazonType) => {
        setShowTable(false);
        setNoData(false);
        try {
            const response = await getNewPrograms({
                start_date: diapazon.startDate.format("YYYY-MM-DD"),
                end_date: diapazon.endDate.format("YYYY-MM-DD"),
            });
            if (response) {
                if ( response.data.length > 0) {
                    const processed = prepareData(response.data);
                    setData(processed);
                    
                    columns.current = createColumns({...response.headers, checked: "выбрать для загрузки"});
                    setShowTable(true);
                } else {
                    setNoData(true);
                }
            }
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.error("Ошибка авторизации: требуется вход в систему.");
                navigate(endpoints.LOGIN);
            }
            console.error("Error fetching protected data:", error);
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

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">Загрузка программ</Typography>
                <DateDiapazon dates={dateDiapazon} setDates={setDateDiapazon} />
                <Stack spacing={2} direction="row">
                    <Button variant="contained" onClick={selectCurrentday}>
                        за сегодня
                    </Button>
                    <Button variant="contained" onClick={selectWeek}>
                        за неделю
                    </Button>

                    <Button variant="contained" onClick={() => loader(dateDiapazon)}>
                        за период
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
                        <DataGrid
                            rows={data}
                            columns={columns.current}
                            slots={{ toolbar: CustomToolbar }}
                            apiRef={apiRef}
                        />
                    </div>
                )}
            </Box>
        </>
    );
}
