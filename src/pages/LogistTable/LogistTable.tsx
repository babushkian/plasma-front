import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Typography, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";
import { ProgramExtendedType } from "../Master/Master.types";

import { logistCalculateParts, masterGetDetailsByProgramId } from "../../utils/requests";

import { MasterProgramPartsRecordType } from "./LogistTable.types";
import QtyInput from "../../components/QtyInput/QtyInput";
import Notification from "../../components/Notification/Notification";
import { hiddenIdColumn } from "../../utils/tableInitialState";

type factQtyType = { id: number; qty_fact: number };
type factQtyRecordType = Record<number, factQtyType>;

// столбцы, отображаемые в таблице
// const columnFields: (keyof MasterProgramPartsRecordType)[] = [
//     "id",
//     "ProgramName",
//     "program_status",
//     "QtyInProcess",
//     "qty_fact",
//     "WONumber",
// ];

const columnFields: (keyof MasterProgramPartsRecordType)[] = [
    "PartName",
    "WONumber",
    "WOData1",

    "PartLength",
    "PartWidth",
    "Thickness",
    "fio_doers", // надо замениь на done_by_fio
    "QtyInProcess",
    "storage_cell_id",
    "qty_fact",
];

const LogistTable = () => {
    // Состояние, которое передается при нажатии на сылку. Нужно для отображения имени программы в заголовке,
    // так как у деталей такой информции нет
    const { state }: { state: ProgramExtendedType } = useLocation();

    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<MasterProgramPartsRecordType[]>([]);
    // ндентификатроы измененных сьолбцов
    const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set());
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [notification, setNotification] = useState(false); // уведомление, что данные ушли на сервер

    /**Функция загрузки данных о деталях */
    const loader = async () => {
        setShowTable(false);
        const response = await masterGetDetailsByProgramId(state.id);
        if (response !== undefined) {
            setData(response.data);
            columns.current = createColumns(response.headers);
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

    const setQty = useCallback((rowId: number, qty: number) => {
        setData((prev) =>
            prev!.map((row) => {
                if (row.id === rowId) {
                    setModifiedRows((prev) => {
                        const next = new Set(prev);
                        next.add(rowId);
                        return next;
                    });
                    return { ...row, qty_fact: qty };
                }
                return row;
            })
        );
    }, []);

    const createColumns = useCallback((headers) => {
        console.log("создаем колонки");
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let col: GridColDef = {
                field: columnname,
                headerName: headers[columnname],
                flex: 1,
            };
            if (columnname == "fio_doers") {
                col = {
                    ...col,
                    valueGetter: (value) => value.map((item) => item.fio_doer).join(", "),
                };
            }
            if (columnname == "qty_fact") {
                col = {
                    ...col,
                    flex: 0,
                    width: 100,
                    renderCell: (params) => (
                        <QtyInput rowId={params.row.id} initialQty={params.row.qty_fact} applyQty={setQty} />
                    ),
                };
            }

            return col;
        });
        return clmns;
    }, [setQty]);


    const sendQty: () => Promise<void> = async () => {
        const partsQty = data
            .filter((item) => modifiedRows.has(item.id))
            .map((item) => ({ id: item.id, qty_fact: item.qty_fact }));
        await logistCalculateParts(partsQty);
        setNotification(true);

        setModifiedRows(new Set());
        loader();
    };

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">
                    Редактирование деталей программы № {state.ProgramName} на странице логиста
                </Typography>
                <Notification value={notification} setValue={setNotification} />
                {loadError && <div>Ошибка загрузки</div>}
                {showTable && (
                    <>
                        <Button variant="contained" onClick={sendQty} disabled={!modifiedRows.size}>
                            Применить фактическое количество деталей
                        </Button>
                        <div style={{ height: 600, width: "100%" }}>
                            <DataGrid
                                rows={data}
                                columns={columns.current}
                                slots={{ toolbar: CustomToolbar }}
                                initialState={hiddenIdColumn}
                                getRowHeight={() => "auto"}
                            />
                        </div>
                    </>
                )}
            </Box>
        </>
    );
};

export default LogistTable;
