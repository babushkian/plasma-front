import { useState, useEffect, useRef, useCallback, useContext } from "react";
import { Box, Typography, Button, Stack, Checkbox } from "@mui/material";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";

import { getReportData } from "../../utils/requests";
import { ProgramType } from "../Master/Master.types";
import { hiddenIdColumn } from "../../utils/tableInitialState";
import { MasterProgramPartsRecordType } from "../LogistTable/LogistTable.types";

import ReportToolbar from "../../components/CustomToolbar/ReportToolbar";
import { DateDiapazon } from "../../components/DateDiapazon/DateDiapazon";
import { DateDiapazonContext } from "../../context";

export type ProgramAndFioType = ProgramType & { dimensions: string };

const Logist = () => {
    const { dateDiapazon } = useContext(DateDiapazonContext);
    const apiRef = useGridApiRef();
    const [data, setData] = useState<MasterProgramPartsRecordType[]>([]);
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const headers = useRef<Record<string, string>>({});
    const columns = useRef<GridColDef>([]);

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
        const dates = {
            start_date: dateDiapazon.startDate.format("YYYY-MM-DD"),
            end_date: dateDiapazon.endDate.format("YYYY-MM-DD"),
        };
        const responseData = await getReportData(dates);

        if (responseData !== undefined) {
            setData(responseData.data);
            headers.current = responseData.headers;
            setLoadError(false);
        } else {
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

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">Отчет</Typography>
                <DateDiapazon />
                <Button variant="contained" onClick={loader}>
                    Получить данные за период
                </Button>

                {loadError && <div>Ошибка загрузки</div>}

                {showTable && (
                    <div style={{ height: 760, width: "100%" }}>
                        <DataGrid
                            rows={data}
                            columns={columns.current}
                            slots={{ toolbar: ReportToolbar }}
                            slotProps={{ toolbar: { columns: columns.current } }}
                            initialState={hiddenIdColumn}
                            getRowHeight={() => "auto"}
                        />
                    </div>
                )}
            </Box>
        </>
    );
};
export default Logist;
