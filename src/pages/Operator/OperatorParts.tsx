import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Typography, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { DoerType, ProgramExtendedType } from "../Master/Master.types";

import { logistCalculateParts, masterGetDetailsByProgramId } from "../../utils/requests";

import { MasterProgramPartsRecordType } from "../LogistTable/LogistTable.types";


type factQtyType = { id: number; qty_fact: number };
type factQtyRecordType = Record<number, factQtyType>;

// столбцы, отображаемые в таблице
const columnFields: (keyof MasterProgramPartsRecordType)[] = [
    "id",
    "ProgramName",
    "program_status",
    "QtyInProcess",
    "WONumber",
];

const OperatorParts = () => {
    // Состояние, которое передается при нажатии на сылку. Нужно для отображения имени программы в заголовке,
    // так как у деталей такой информции нет
    const { state }: { state:{ program: ProgramExtendedType, currentDoer:DoerType} } = useLocation();

    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<MasterProgramPartsRecordType[]>([]);

    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);

    /**Функция загрузки данных о деталях */
    const loader = async () => {
        setShowTable(false);
        // найти способ добавить сюда идентификатор пользователя
        // нужно его держать в глобальном состоянии
        const response = await masterGetDetailsByProgramId(state.program.id);
        if (response !== undefined) {
            setData(response);
            setShowTable(true);
        } else {
            setLoadError(true);
        }
    };

    /** При загрузке страницы загружаем данные о деталях*/
    useEffect(() => {
        loader();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const createColumns = () => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            const col: GridColDef = {
                field: columnname,
                headerName: columnname,
                flex: 1,
            };
            return col;
        });
        return clmns;
    };

    useEffect(() => {
        columns.current = createColumns();
    }, [data]);



    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">
                    Редактирование деталей программы № {state.program.ProgramName} на странице логиста
                </Typography>
                {state.currentDoer.fio_doer}
                {loadError && <div>Ошибка загрузки</div>}
                {showTable && (
                    <>
                        <Button variant="contained" onClick={()=>alert("Послали данные")} >
                            Какое-то действие
                        </Button>
                        <div style={{ height: 600, width: "100%" }}>
                            <DataGrid rows={data} columns={columns.current} />
                        </div>
                    </>
                )}
            </Box>
        </>
    );
};

export default OperatorParts;
