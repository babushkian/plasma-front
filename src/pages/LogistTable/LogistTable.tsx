import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Typography, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { ProgramExtendedType } from "../Master/Master.types";

import { logistCalculateParts, masterGetDetailsByProgramId } from "../../utils/requests";

import { MasterProgramPartsRecordType } from "./LogistTable.types";
import QtyInput from "../../components/QtyInput/QtyInput";

type factQtyType = { id: number; qty_fact: number };
type factQtyRecordType = Record<number, factQtyType>;

// столбцы, отображаемые в таблице
const columnFields: (keyof MasterProgramPartsRecordType)[] = [
    "id",
    "ProgramName",
    "program_status",
    "QtyInProcess",
    "qty_fact",
    "WONumber",
];

const LogistTable = () => {
    // Состояние, которое передается при нажатии на сылку. Нужно для отображения имени программы в заголовке,
    // так как у деталей такой информции нет
    const { state }: { state: ProgramExtendedType } = useLocation();

    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<MasterProgramPartsRecordType[]>([]);

    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    // объект с измененными стрками, в которые введено количество изготовленных деталей
    const [factQty, setFactQty] = useState<factQtyRecordType>({});

    /**Функция загрузки данных о деталях */
    const loader = async () => {
        setShowTable(false);
        const response = await masterGetDetailsByProgramId(state.id);
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
    }, []);

    useEffect(() => {
        console.log("изменился фрейм:", data);
    }, [data]);

    const createColumns = useCallback(() => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            const col: GridColDef = {
                field: columnname,
                headerName: columnname,
                flex: 1,
            };
            return col;
        });
        clmns.push({
            field: "действие",
            headerName: "действие",
            flex: 1,
            renderCell: (params) => (
                <QtyInput rowId={params.row.id} initialQty={params.row.qty_fact} applyQty={setQty} />
            ),
        });

        return clmns;
    }, []);

    useEffect(() => {
        columns.current = createColumns();
    }, [data, createColumns]);

    
    const setQty: (programId: number, qty: number) => void = (programId, qty) => {
        console.log("весь фрейм:", data);
        console.log("пераметры: ", programId, qty);
        const dataIndex = data.findIndex((item) => programId === item.id);
        console.log("индекс строки", dataIndex, "значение", qty);

        if (data[dataIndex].qty_fact === qty) {
            return;
        } else {
            // добвляем элемент в массив
            setFactQty((prev) => ({ ...prev, [programId]: { id: programId, qty_fact: qty } }));
        }
    };


    const sendQty: () => Promise<void> = async () => {
        if (Object.keys(factQty).length === 0) {
            return;
        }
        const partsQty = Object.values(factQty);
        await logistCalculateParts(partsQty);
        // сброс заполненных работников и перезагрузка страницы

        setFactQty(() => ({}));
        loader();
    };

    const showData = () => console.log(data);

    // столбцы, которые нужно выводить в таблице
    const fields = ["id", "PartName", "WONumber", "QtyInProcess", "qty_fact", "part_status", "fio_doer_id"];

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">
                    Редактирование деталей программы № {state.ProgramName} на странице логиста
                </Typography>

                {loadError && <div>Ошибка загрузки</div>}
                {showTable && (
                    <>
                        <Button variant="contained" onClick={sendQty} disabled={false}>
                            Применить фактическое количество деталей
                        </Button>
                        <div style={{ height: 600, width: "100%" }}>
                            <DataGrid rows={data} columns={columns.current} />
                        </div>
                    </>
                )}
                <Button variant="contained" onClick={showData} disabled={false}>
                    вывести данные
                </Button>
            </Box>
        </>
    );
};

export default LogistTable;
