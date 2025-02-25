import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Link as MuiLink } from '@mui/material';
import { Box, Typography, Button, Stack, Checkbox } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

import { getDoers, logistGetPrograms } from "../../utils/requests";
import { ProgramType } from "../Master/Master.types";

export type ProgramAndFioType = ProgramType & { doerFio: string; dimensions: string };

const Logist = () => {
    const [data, setData] = useState<ProgramAndFioType[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);

    const columnFields: (keyof ProgramAndFioType)[] = ["ProgramName", "MachineName", "dimensions", "doerFio"];
    const columns: GridColDef[] = columnFields.map((columnname) => {
        let colTemplate: GridColDef = {
            field: columnname,
            headerName: columnname,
            flex: 1,
        };
        if (columnname==="ProgramName") {
            colTemplate = {...colTemplate, 
                renderCell: (params) =><MuiLink component= {Link} state={params.row} to={`/logist/${params.row.ProgramName}`}>{params.row.ProgramName}</MuiLink>
            }
        }

        return colTemplate
    });

    // нужно получить данные о работниках и соединить дба запроса в одну структуру
    const loader = async () => {
        setShowTable(false);
        setLoading(true);
        const responseData = await logistGetPrograms();
        const doers = await getDoers();

        if (responseData !== undefined && doers !== undefined) {
            // делаем словарь, где ключи - идентификаторы исполнителей, а значения - имена исполнителей
            const doersMap = doers.map((entry) => [entry.id.toString(), entry.fio_doer]);
            const doersDict = Object.fromEntries(doersMap);
            // добавляем имя исполнителя в каждую запись

            const fioData = responseData.map((item) => {
                let doerFio = "ошибоный индекс";
                if (item.fio_doer_id !== null) {
                    doerFio =
                        doersDict[item.fio_doer_id.toString()] !== undefined
                            ? doersDict[item.fio_doer_id.toString()]
                            : "ошибоный индекс";
                }
                const dimensions = `${Math.round(item.SheetLength)} x ${Math.round(item.SheetWidth)} x ${
                    item.Thickness
                }`;

                return { ...item, doerFio, dimensions };
            });
            setData(fioData);
            setLoading(false);
            setLoadError(false);
            setShowTable(true);
        } else {
            setLoading(false);
            setLoadError(true);
        }
    };

    useEffect(() => {
        loader();
    }, []);

    return (
        <>
{showTable && (        
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">Рабочее место логиста</Typography>

                {loadError && <div>Ошибка загрузки</div>}

                {showTable && (
                    <div style={{ height: 600, width: "100%" }}>
                        <DataGrid rows={data} columns={columns} />
                    </div>
                )}

                
                
            </Box>
)}
        </>
    );
}
export default Logist;
