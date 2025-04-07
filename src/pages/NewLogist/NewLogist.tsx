import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { Box, Typography, Button, Stack, Checkbox } from "@mui/material";
import { GridColDef, useGridApiRef } from "@mui/x-data-grid";

import { logistGetPrograms } from "../../utils/requests";
import { ProgramType } from "../Master/Master.types";
import { hiddenIdColumn } from "../../utils/tableInitialState";


import FilteredDataGrid from "../../components/FilterableDataGrid/FilterableDataGrid";

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

const NewLogist = () => {
    const [data, setData] = useState<ProgramAndFioType[]>([]);
    const columns = useRef<GridColDef[]>([]);
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const apiRef = useGridApiRef();

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
        return clmns
    },[]);

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
            
            columns.current = createColumns(response.headers)
            setData(fioData);
            setLoadError(false);
            setShowTable(true);
        } else {
            setLoadError(true);
        }
    };

    const gridParams = useMemo(
        () => ({
            rows: data,
            setRows: setData,
            columns: columns.current,
            initialState: hiddenIdColumn,
            apiRef: apiRef,
        }),
        [apiRef, data]
    );

    useEffect(() => {
        loader();
    }, []);

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">Рабочее место логиста</Typography>
                {/*тестовая кнопка для проверки, когда перерисовывается таблица (она не должна перерисовываться при нажатии на кнопку) */}
                {/* <Button onClick={()=>setCounter((prev) => prev + 1)}>нажми {counter}</Button> */}
                {loadError && <div>Ошибка загрузки</div>}

                {showTable && (
                    <div style={{ height: "800px", width: "100%" }}>
                        <FilteredDataGrid {...gridParams} />
                    </div>
                )}
            </Box>
        </>
    );
};
export default NewLogist;
