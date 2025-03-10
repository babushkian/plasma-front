import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { Box, Typography, Button, Stack, Checkbox } from "@mui/material";
import { DataGrid, GridColDef} from "@mui/x-data-grid";

import { getDoers, logistGetPrograms } from "../../utils/requests";
import { ProgramType } from "../Master/Master.types";

export type ProgramAndFioType = ProgramType & { dimensions: string };

const Logist = () => {
    const [data, setData] = useState<ProgramAndFioType[]>([]);

    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);

    const columnFields: (keyof ProgramAndFioType)[] = ["ProgramName", "dimensions", "program_status"];
    const columns: GridColDef[] = columnFields.map((columnname) => {
        let colTemplate: GridColDef = {
            field: columnname,
            headerName: columnname,
            flex: 1,
        };
        if (columnname === "ProgramName") {
            colTemplate = {
                ...colTemplate,
                renderCell: (params) => (
                    <MuiLink component={Link} state={params.row} to={`/logist/${params.row.ProgramName}`}>
                        {params.row.ProgramName}
                    </MuiLink>
                ),
            };
        }

        return colTemplate;
    });

    const loader = async () => {
        setShowTable(false);
        const responseData = await logistGetPrograms();

        if (responseData !== undefined) {
            // делаем словарь, где ключи - идентификаторы исполнителей, а значения - имена исполнителей

            const fioData = responseData.map((item) => {
                const dimensions = `${Math.round(item.SheetLength)} x ${Math.round(item.SheetWidth)} x ${
                    item.Thickness
                }`;

                return { ...item, dimensions };
            });
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
                    <div style={{ height: 600, width: "100%" }}>
                        <DataGrid rows={data} columns={columns} />
                    </div>
                )}
            </Box>
        </>
    );
};
export default Logist;
