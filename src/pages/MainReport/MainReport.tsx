import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { Box, Typography, Button, Stack, Checkbox } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";
import { getReportData } from "../../utils/requests";
import { ProgramType } from "../Master/Master.types";
import { hiddenIdColumn } from "../../utils/tableInitialState";
import { MasterProgramPartsRecordType } from "../LogistTable/LogistTable.types";

export type ProgramAndFioType = ProgramType & { dimensions: string };

const Logist = () => {
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
                width:160,
            };
            return colTemplate;
        });
        return columns
    }, [headers]);

    const loader = async () => {
        setShowTable(false);
        const responseData = await getReportData({ start_date: "2025-03-01", end_date: "2025-03-28" });

        if (responseData !== undefined) {
            console.log(responseData);
            console.log(responseData.headers);
            console.log(responseData.data);
            setData(responseData.data)
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
            
            console.log("объект колонок");
            console.log(columns.current);
            setShowTable(true);
        }
    }, [createColumns, data]);


    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">Отчет</Typography>

                {loadError && <div>Ошибка загрузки</div>}

                {showTable && (
                    <div style={{ height: 760, width: "100%" }}>
                        <DataGrid
                            rows={data}
                            columns={columns.current}
                            slots={{ toolbar: CustomToolbar }}
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
