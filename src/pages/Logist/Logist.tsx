import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { Box, Typography, Button, Stack, Checkbox } from "@mui/material";
import { GridColDef, useGridApiRef } from "@mui/x-data-grid";

import { logistGetPrograms } from "../../utils/requests";
import { ProgramType } from "../Master/Master.types";
import { hiddenIdColumn } from "../../utils/tableInitialState";

import FilteredDataGrid from "../../components/FilterableDataGrid/FilterableDataGrid";
import { endpoints } from "../../utils/authorization";
import { MasterProgramPartsRecordType } from "../LogistTable/LogistTable.types";
import { ImageWidget } from "../../components/IamgeWidget/ImageWidget";
import { BASE_URL } from "../../utils/urls";

const columnFields: (keyof ProgramType)[] = [
    "id",
    "program_pic",
    "ProgramName",
    "program_priority",
    "program_status",
    "wo_numbers",
    "wo_data1",
    "Thickness",
    "SheetWidth",
    "SheetLength",
    //"fio_doers",
];

function Logist() {
    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<ProgramType[]>([]);
    const apiRef = useGridApiRef();
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);

    const createColumns = useCallback((headers: Record<string, string>) => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let col: GridColDef = {
                field: columnname,
                headerName: headers[columnname],
                flex: 1,
            };
            if (columnname === "program_pic") {
                col = {
                    ...col,
                    width: 320,
                    flex: 0,
                    renderCell: (params) => <ImageWidget source={params.value} />,
                };
            }
            if (columnname === "ProgramName") {
                col = {
                    ...col,
                    renderCell: (params) => (
                        <MuiLink
                            component={Link}
                            state={params.row}
                            to={`${endpoints.LOGIST}/${params.row.ProgramName}`}
                        >
                            {params.row.ProgramName}
                        </MuiLink>
                    ),
                };
            }
            return col;
        });
        return clmns;
    }, []);

    const prepareData = (data) => {
        const prepared = data.map((row) => {
            let preparedRow = columnFields.reduce<Partial<MasterProgramPartsRecordType>>((acc, field) => {
                acc[field] = row[field];
                return acc;
            }, {});
            preparedRow["program_pic"] = `${BASE_URL}${row.program_pic}`;
            preparedRow["wo_numbers"] = row["wo_numbers"].join(", ");
            preparedRow["wo_data1"] = row["wo_data1"].join(", ");
            return preparedRow;
        });
        return prepared;
    };

    const loader = useCallback(async () => {
        setShowTable(false);
        const response = await logistGetPrograms();

        if (response !== undefined) {
            setData(prepareData(response.data));
            columns.current = createColumns(response.headers);
            setLoadError(false);
            setShowTable(true);
        } else {
            setLoadError(true);
        }
    }, [createColumns]);

    useEffect(() => {
        loader();
    }, [loader]);

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
}

export default Logist;
