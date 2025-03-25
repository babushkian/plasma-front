import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Box, Typography} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { ProgramExtendedType } from "../Master/Master.types";

import { getProgramParts } from "../../utils/requests";

import { MasterProgramPartsRecordType } from "../LogistTable/LogistTable.types";

type factQtyType = { id: number; qty_fact: number };
type factQtyRecordType = Record<number, factQtyType>;

// столбцы, отображаемые в таблице
const columnFields: (keyof MasterProgramPartsRecordType)[] = ["ProgramName", "program_status"];

const PlasmaParts = () => {
    // Состояние, которое передается при нажатии на сылку. Нужно для отображения имени программы в заголовке,
    // так как у деталей такой информции нет
    const { state }: { state: ProgramExtendedType } = useLocation();

    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<MasterProgramPartsRecordType[]>([]);

    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const counter = useRef(1)

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
        console.log("перерисовка колонок", counter.current)
        counter.current += 1
        const clmns: GridColDef[] = Object.keys(data[0]).map((columnname) => {
            const col: GridColDef = {
                field: columnname,
                headerName: columnname,
                flex: 1,
            };
            return col;
        });
        setShowTable(true);
        return clmns;
    }, [data]);

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
                        <DataGrid rows={data} columns={columns.current} getRowId={(row) => row.PK_PIP} />
                    </div>
                )}
            </Box>
        </>
    );
};

export default PlasmaParts;
