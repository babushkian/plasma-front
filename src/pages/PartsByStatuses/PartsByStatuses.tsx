import { useState, useEffect, useRef, useCallback } from "React";
import { Box, Typography } from "@mui/material";
import {
    DataGrid,
    GridRowsProp,
    GridColDef,
    GridToolbar,
    useGridApiRef,
    getGridStringOperators,
    getGridNumericOperators,
} from "@mui/x-data-grid";
import { getPartsByStatuses } from "../../utils/requests";

const TestLayout = () => {
    const [data, setData] = useState<any[]>([]);
    const [showData, setShowData] = useState(false);
    const columns = useRef(undefined);
    const initStateRef = useRef(undefined);
    const apiRef = useGridApiRef();
    const loadData = async () => {
        try {
            const responseData = await getPartsByStatuses();
            if (responseData) {
                setData(responseData);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const fieldsDict = {
        ProgramName: "string",
        UsedArea: "number",
        Thickness: "number",
        SheetLength: "number",
        SheetWidth: "number",
        CuttingLength: "number",
        PierceQtyPart: "number",
        Material: "string",
    };

    const createColumns = () => {
        const fields = Object.keys(fieldsDict);
        const columns = Object.keys(data[0]).map((colName) => {
            if (fields.includes(colName)) {
                return { field: colName, headerName: colName, flex: 1, type: fieldsDict[colName] };
            } else {
                return { field: colName, headerName: colName, flex: 1, type: "string" };
            }
        });
        return columns;
    };

    const setInitState = () => {
        const fields = Object.keys(fieldsDict);
        const initial = {};
        const columnVis = {};
        Object.keys(data[0]).forEach((colName) => {
            let visibility = false;
            if (!fields.includes(colName)) {
                columnVis[colName] = false;
            }
        });
        initial["columns"] = { columnVisibilityModel: columnVis };
        console.log("операторы");
        console.log(getGridStringOperators());
        console.log(getGridNumericOperators());
        initial["filter"] = {
            filterModel: {
                items: [
                    // { field: "Material", operator: "contains", value: "gs" },
                    // { field: "Thickness", operator: ">", value: 4 },
                    { field: "PierceQtyPart", operator: "=", value: 2 },
                ],
            },
        };

        return initial;
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (data.length > 0) {
            columns.current = createColumns();
            initStateRef.current = setInitState();
            console.log("initialState");
            console.log(initStateRef.current);
        }
    }, [data]);

    useEffect(() => {
        if (data.length > 0) {
            setShowData(true);
        }
    }, [data]);

    return (
        <Box sx={{ height: "90vh", dispay: "flex" }}>
            <Typography variant="h5" align="center" gutterBottom>
                Проверка загрузки данных
            </Typography>
            {showData && (
                <div style={{ height: 800, width: "100%" }}>
                    <DataGrid
                        rows={data}
                        columns={columns.current}
                        initialState={initStateRef.current}
                        slots={{ toolbar: GridToolbar }}
                        apiRef={apiRef}
                        onStateChange={() => {
                            if (apiRef.current) {
                                console.log("видимые колонки", apiRef.current.getVisibleColumns());
                            }
                        }}
                    />
                </div>
            )}
        </Box>
    );
};

export default TestLayout;
