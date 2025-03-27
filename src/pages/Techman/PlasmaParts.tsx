import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";
import { ProgramExtendedType } from "../Master/Master.types";

import { getProgramParts } from "../../utils/requests";

import { MasterProgramPartsRecordType } from "../LogistTable/LogistTable.types";

const columnFields: string[] = [
    "PartName",
    "WONumber",
    //"WOData1",
    "QtyInProcess",
    //"qty_fact",
    "PartLength",
    "PartWidth",
    //"Thickness",
    //"fio_doer",
];

const PlasmaParts = () => {
    // Состояние, которое передается при нажатии на сылку. Нужно для отображения имени программы в заголовке,
    // так как у деталей такой информции нет
    const { state }: { state: ProgramExtendedType } = useLocation();

    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<MasterProgramPartsRecordType[]>([]);

    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const counter = useRef(1);

    /** При загрузке страницы загружаем данные о деталях*/
    useEffect(() => {
        const loader = async () => {
            setShowTable(false);
            const response = await getProgramParts(state.ProgramName);
            if (response !== undefined) {
                setData(response);
            } else {
                setLoadError(true);
            }
        };

        loader();
    }, []);

    const createColumns = useCallback(() => {
        // const clmns: GridColDef[] = Object.keys(data[0]).map((columnname) => {
        //     const col: GridColDef = {
        //         field: columnname,
        //         headerName: columnname,
        //         flex: 1,
        //     };
        //     return col;
        // });
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let col: GridColDef = {
                field: columnname,
                headerName: columnname,
                flex: 1,
            };
            if (columnname == "fio_doers") {
                col = {
                    ...col,
                    valueGetter: (value) => {
                        if (Array.isArray(value)) {
                            return value.map((item) => item.fio_doer).join(", ");
                        }
                        return value.fio_doer;
                    },
                };
            }

            return col;
        });

        setShowTable(true);
        return clmns;
    }, []);

    useEffect(() => {
        if (data.length) {
            columns.current = createColumns();
        }
    }, [createColumns, data]);

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">
                    Информация о деталях программы № {state.ProgramName} на странице логиста
                </Typography>

                {loadError && <div>Ошибка загрузки</div>}
                {showTable && (
                    <div style={{ height: 600, width: "100%" }}>
                        <DataGrid
                            rows={data}
                            columns={columns.current}
                            getRowId={(row) => row.PK_PIP}
                            slots={{ toolbar: CustomToolbar }}
                        />
                    </div>
                )}
            </Box>
        </>
    );
};

export default PlasmaParts;
