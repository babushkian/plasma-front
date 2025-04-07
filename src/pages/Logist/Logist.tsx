import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { Box, Typography, Button, Stack, Checkbox } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";
import { logistGetPrograms } from "../../utils/requests";
import { ProgramType } from "../Master/Master.types";
import { hiddenIdColumn } from "../../utils/tableInitialState";

export type ProgramAndFioType = ProgramType & { dimensions: string };

const columnFields: (keyof ProgramAndFioType)[] = [
    "id",
    "program_priority",
    "ProgramName",
    "program_status",
    "wo_numbers",
    "wo_data1",
    "Thickness",
    "SheetWidth",
    "SheetLength",
    //"fio_doers",
];


const Logist = () => {
    const [data, setData] = useState<ProgramAndFioType[]>([]);
    const columns = useRef<GridColDef[]>([]);
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);


    const createColumns = useCallback((headers: Record<string, string>) => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let colTemplate: GridColDef = {
                field: columnname,
                headerName: headers[columnname],
                flex: 1,
            };
            if (columnname === "ProgramName") {
                colTemplate = {
                    ...colTemplate,
                    renderCell: (params) => (
                        <MuiLink component={Link} state={params.row} to={`/l/${params.row.ProgramName}`}>
                            {params.row.ProgramName}
                        </MuiLink>
                    ),
                };
            }
            if (["wo_numbers", "wo_data1"].includes(columnname)) {
                colTemplate = {
                    ...colTemplate,
                    valueGetter: (value) => value.join(", "),
                };
            }
            return colTemplate;
        });
        return clmns;
    }, []);

    const loader = async () => {
        setShowTable(false);
        const response = await logistGetPrograms();

        if (response !== undefined) {
            // делаем словарь, где ключи - идентификаторы исполнителей, а значения - имена исполнителей
            const fioData = response.data.map((item) => {
                const dimensions = `${Math.round(item.SheetLength)} x ${Math.round(item.SheetWidth)} x ${
                    item.Thickness
                }`;

                return { ...item, dimensions };
            });

            columns.current = createColumns(response.headers);
            setData(fioData);
            setLoadError(false);
            setShowTable(true);
        } else {
            setLoadError(true);
        }
    };

    useEffect(() => {
        loader();
    }, []);

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">Рабочее место логиста</Typography>

                {loadError && <div>Ошибка загрузки</div>}

                {showTable && (
                    <div style={{ height: "800px", width: "100%" }}>
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
