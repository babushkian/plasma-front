import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Box, Typography, Button, Stack, Checkbox } from "@mui/material";
import { DataGrid, GridColDef, useGridApiRef, GridColumnVisibilityModel} from "@mui/x-data-grid";

import { getReportData } from "../../utils/requests";
import { ProgramType } from "../Master/Master.types";
import { hiddenIdColumn } from "../../utils/tableInitialState";
import { MasterProgramPartsRecordType } from "../LogistTable/LogistTable.types";

import ReportToolbar from "../../components/CustomToolbar/ReportToolbar";
import { DateDiapazon } from "../../components/DateDiapazon/DateDiapazon";
import { DateDiapazonType } from "../Techman/Techman.types";
import dayjs from "dayjs";
import axios from "axios";
import { getVisibilityModelToStore, saveVisibilityModelToStore } from "../../utils/local-storage";

export type ProgramAndFioType = ProgramType & { dimensions: string };

const defaultDates: DateDiapazonType = {
    startDate: dayjs().subtract(dayjs().date() - 1, "day"), //начало месяца
    endDate: dayjs(),
};

const Logist = () => {
    const [dates, setDates] = useState<DateDiapazonType>(defaultDates);

    const [data, setData] = useState<MasterProgramPartsRecordType[]>([]);
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [columnVisibilityModel, setColumnVisibilityModel] = useState(getVisibilityModelToStore)
    const headers = useRef<Record<string, string>>({});
    const columns = useRef<GridColDef>([]);

    const errorMessage = useRef("Ошибка загрузки");
    const createColumns = useCallback(() => {
        const columns: GridColDef[] = Object.keys(headers.current).map((columnname) => {
            let colTemplate: GridColDef = {
                field: columnname,
                headerName: headers.current[columnname],
                width: 160,
            };
            if (columnname == "fio_doers") {
                colTemplate = {
                    ...colTemplate,
                    valueGetter: (value) => {
                        if (Array.isArray(value)) {
                            return value.map((item) => item.fio_doer).join(", ");
                        }
                        return value.fio_doer;
                    },
                };
            }
            if (columnname == "done_by_fio_doer") {
                colTemplate = {
                    ...colTemplate,
                    valueGetter: (value) => value?.fio_doer,
                };
            }

            return colTemplate;
        });
        return columns;
    }, [headers]);

    const loader = async () => {
        setShowTable(false);
        const datesObj = {
            start_date: dates.startDate.format("YYYY-MM-DD"),
            end_date: dates.endDate.format("YYYY-MM-DD"),
        };
        try {
            const responseData = await getReportData(datesObj);
            if (responseData !== undefined) {
                setData(responseData.data);
                headers.current = responseData.headers;
                setLoadError(false);
            } else {
                setLoadError(true);
            }
        } catch (error) {
            errorMessage.current = "Ошибка загрузки"
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    errorMessage.current = "Отсутствуют записи за выбранный период"
                }
            }
            setLoadError(true);
        }
    };

    useEffect(() => {
        loader();
    }, []);

    useEffect(() => {
        if (data.length) {
            columns.current = createColumns();
            setShowTable(true);
        }
    }, [createColumns, data]);

    useEffect(()=>console.log(columnVisibilityModel), [columnVisibilityModel])
    const handleVisibilityModel = (newModel: GridColumnVisibilityModel)=>{
        setColumnVisibilityModel(newModel)
        saveVisibilityModelToStore(newModel)
    }
    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">Отчет</Typography>
                <DateDiapazon dates={dates} setDates={setDates} />
                <Button variant="contained" onClick={loader}>
                    Получить данные за период
                </Button>

                {loadError && <div>{errorMessage.current}</div>}

                {showTable && (
                    <div style={{ height: 700, width: "100%" }}>
                        <DataGrid
                            rows={data}
                            columns={columns.current}
                            slots={{ toolbar: ReportToolbar }}
                            slotProps={{ toolbar: { columns: columns.current } }}
                            initialState={hiddenIdColumn}
                            getRowHeight={() => "auto"}
                            columnVisibilityModel={columnVisibilityModel}
                            onColumnVisibilityModelChange={handleVisibilityModel}
                        />
                    </div>
                )}
            </Box>
        </>
    );
};
export default Logist;
