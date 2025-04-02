import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";

import { Box, Typography, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";
import { ProgramExtendedType } from "../Master/Master.types";

import { logistCalculateParts, masterGetDetailsByProgramId } from "../../utils/requests";

import { MasterProgramPartsRecordType } from "./LogistTable.types";
import QtyInput from "../../components/QtyInput/QtyInput";
import Notification from "../../components/Notification/Notification";
import { hiddenIdColumn } from "../../utils/tableInitialState";
import FilteredDataGrid from "../../components/FilterableDataGrid/FilterableDataGrid";
type factQtyType = { id: number; qty_fact: number };
type factQtyRecordType = Record<number, factQtyType>;

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

const NewLogistTable = () => {
    // Состояние, которое передается при нажатии на сылку. Нужно для отображения имени программы в заголовке,
    // так как у деталей такой информции нет
    const { state }: { state: ProgramExtendedType } = useLocation();
    //просто счетчик для проверки, как перерисовываается таблица при изменении части страницы, которая на таблицу никак не влияет
    const [counter, setCounter] = useState(0);
    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<MasterProgramPartsRecordType[]>([]);

    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    // объект с измененными стрками, в которые введено количество изготовленных деталей
    const [factQty, setFactQty] = useState<factQtyRecordType>({});
    const [notification, setNotification] = useState(false); // уведомление, что данные ушли на сервер
    const headers = useRef<Record<string, string>>({});

    /**Функция загрузки данных о деталях */
    const loader = async () => {
        setShowTable(false);
        const response = await masterGetDetailsByProgramId(state.id);
        if (response !== undefined) {
            setData(response.data);
            headers.current = response.headers;
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

    const setQty = useCallback(
        (rowId: number, qty: number) => {
            const dataIndex = data.findIndex((item) => rowId === item.id);
            if (data[dataIndex].qty_fact === qty) {
                return;
            } else {
                // добвляем элемент в массив
                setFactQty((prev) => ({ ...prev, [rowId]: { id: rowId, qty_fact: qty } }));
            }
        },
        [data]
    );

    const createColumns = useCallback(() => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let col: GridColDef = {
                field: columnname,
                headerName: headers.current[columnname],
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

    useEffect(() => {
        columns.current = createColumns();
    }, [data, createColumns]);

    const sendQty: () => Promise<void> = async () => {
        if (Object.keys(factQty).length === 0) {
            return;
        }
        const partsQty = Object.values(factQty);
        await logistCalculateParts(partsQty);
        setNotification(true);
        // сброс заполненных работников и перезагрузка страницы
        setFactQty(() => ({}));
        loader();
    };
    
    // не заметил ээфекта от мемоизации. Не перерисовывает даже если передаем в таблицу обычный объект     
    // который должен каждый раз создаваться заново
    const gridParams = useMemo(
        () => ({
            rows: data,
            setRows: setData,
            columns: columns.current,
            initialState: hiddenIdColumn,
        }),
        [data]
    );


    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">
                    Тестовое редактирование деталей программы № {state.ProgramName} на странице логиста
                </Typography>
                <Notification value={notification} setValue={setNotification} />
                {/*тестовая кнопка для проверки, когда перерисовывается таблица (она не должна перерисовываться при нажатии на кнопку) */}
                <Button onClick={()=>setCounter((prev) => prev + 1)}>нажми {counter}</Button>

                {loadError && <div>Ошибка загрузки</div>}
                {showTable && (
                    <>
                        <Button variant="contained" onClick={sendQty} disabled={false}>
                            Применить фактическое количество деталей
                        </Button>
                        <div style={{ height: 600, width: "100%" }}>
                            {/*такой подход позволяет избежать лишних перерисовок, когда параметры передаются одим объектом*/}
                            <FilteredDataGrid {...gridParams} />
                        </div>
                    </>
                )}
            </Box>
        </>
    );
};

export default NewLogistTable;
