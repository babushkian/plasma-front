import { useState, useEffect, useRef, useCallback } from "React";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridRowsProp, GridColDef, GridToolbar, useGridApiRef } from "@mui/x-data-grid";
import { getPartsByStatuses } from "../../utils/requests";

const TestLayout = () => {
    const [data, setData] = useState<any[]>([]);
    const [showData, setShowData] = useState(false);
    const columns = useRef(undefined);
    const initStateRef = useRef(undefined)
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

    const createColumns = () => {
        return Object.keys(data[0]).map((colName, index) => {
            return { field: colName, headerName: colName, flex: 1};
        });
    };

    const setInitState = () => {
        const initial = {}
        const columnVis = {}
        Object.keys(data[0]).forEach((colName, index) => {
            let visibility = false
            if (index < 7) {
                visibility = true
            }
            columnVis[colName] = visibility
            
        });
        initial["columns"] = {columnVisibilityModel:columnVis}
        return initial

    }

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (data.length > 0) {
            columns.current = createColumns();
            initStateRef.current = setInitState()
            console.log("initialState")
            console.log(initStateRef.current)
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
