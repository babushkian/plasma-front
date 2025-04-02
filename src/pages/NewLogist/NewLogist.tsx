import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { Box, Typography, Button, Stack, Checkbox } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import SearchToolbar from "../../components/CustomToolbar/SearchToolbar";
import { getDoers, logistGetPrograms } from "../../utils/requests";
import { ProgramType } from "../Master/Master.types";
import { hiddenIdColumn } from "../../utils/tableInitialState";
import { endpoints } from "../../utils/authorization";

import FilteredDataGrid from "../../components/FilterableDataGrid/FilterableDataGrid";

export type ProgramAndFioType = ProgramType & { dimensions: string };

const NewLogist = () => {
    const [data, setData] = useState<ProgramAndFioType[]>([]);

    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const headers = useRef<Record<string, string>>({});
    const [counter, setCounter] = useState(0);

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

    const columns: GridColDef[] = columnFields.map((columnname) => {
        let colTemplate: GridColDef = {
            field: columnname,
            headerName: headers.current[columnname],
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

    const loader = async () => {
        setShowTable(false);
        const responseData = await logistGetPrograms();

        if (responseData !== undefined) {
            // делаем словарь, где ключи - идентификаторы исполнителей, а значения - имена исполнителей
            const fioData = responseData.data.map((item) => {
                const dimensions = `${Math.round(item.SheetLength)} x ${Math.round(item.SheetWidth)} x ${
                    item.Thickness
                }`;

                return { ...item, dimensions };
            });
            headers.current = responseData.headers;
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
                {/*тестовая кнопка для проверки, когда перерисовывается таблица (она не должна перерисовываться при нажатии на кнопку) */}
                {/* <Button onClick={()=>setCounter((prev) => prev + 1)}>нажми {counter}</Button> */}
                {loadError && <div>Ошибка загрузки</div>}

                {showTable && (
                    <div style={{ height: "800px", width: "100%" }}>
                        <FilteredDataGrid
                            rows={data}
                            setRows={setData} 
                            columns={columns}
                            initialState={hiddenIdColumn}
                            getRowHeight={() => "auto"}
                        />
                    </div>
                )}
            </Box>
        </>
    );
};
export default NewLogist;
