import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";

import { Box, Typography, Button } from "@mui/material";
import { GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { ProgramExtendedType } from "../Master/Master.types";

import { logistCalculateParts, masterGetDetailsByProgramId } from "../../utils/requests";

import { MasterProgramPartsRecordType } from "./LogistTable.types";
import {QtyInput} from "../../components/QtyInput/QtyInput";
import Notification from "../../components/Notification/Notification";
import { hiddenIdColumn } from "../../utils/tableInitialState";
import FilteredDataGrid from "../../components/FilterableDataGrid/FilterableDataGrid";
import {useModifiedRows} from "../../hooks"
import {updateTableData} from "../../utils/update-any-field-in-table"

const columnFields = [
    "id",
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
] as const;

// так как мы удаляем из таблицы лишние строки и преобразуем массив работников в строку с перечислением этих работников,
// то нужно из первоначального типа убрать первонеяальне определение поля "fio_doers" и заменить его на строку
type FilteredMasterProgramParts = Omit<
    Pick<MasterProgramPartsRecordType, (typeof columnFields)[number]>,
    "fio_doers"
> & { fio_doers: string };


export function LogistTable() {
    // Состояние, которое передается при нажатии на сылку. Нужно для отображения имени программы в заголовке,
    // так как у деталей такой информции нет
    const { state }: { state: ProgramExtendedType } = useLocation();
    //просто счетчик для проверки, как перерисовываается таблица при изменении части страницы, которая на таблицу никак не влияет
    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<FilteredMasterProgramParts[]>([]);
    const apiRef = useGridApiRef();
    
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [notification, setNotification] = useState(false); // уведомление, что данные ушли на сервер
    const { modifiedRows, clearModifiedRows, updateModifiedRows } = useModifiedRows();
    
    const dataUpdater = useMemo( ()=> updateTableData(columnFields, setData), []);

    /**Функция загрузки данных о деталях */
    const loader = async () => {
        setShowTable(false);
        const response = await masterGetDetailsByProgramId(state.id);
        if (response !== undefined) {
            const processedData = response.data.map((row) => {
                const processedRow: FilteredMasterProgramParts = {};
                columnFields.map((colName) => {
                    if (colName === "fio_doers") {
                        processedRow[colName] = row["fio_doers"].map((item) => item.fio_doer).join(", ");
                    } else {
                        processedRow[colName] = row[colName];
                    }
                });
                return processedRow;
            });
            setData(processedData);
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


    const updateTable = useCallback(
        (rowId: number, processObject) => {
            updateModifiedRows(rowId);
            dataUpdater(rowId, processObject)
        },
        [dataUpdater, updateModifiedRows]
    );


    const createColumns = useCallback((headers:Record<string, string>) => {
        console.log("создаем колонки");
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let col: GridColDef = {
                field: columnname,
                headerName: headers[columnname],
                flex: 1,
            };

            if (columnname == "qty_fact") {
                col = {
                    ...col,
                    flex: 0,
                    width: 100,
                    renderCell: (params) => (
                        <QtyInput rowId={params.row.id} initialQty={params.row.qty_fact} assignHandler={updateTable} />
                    ),
                };
            }

            return col;
        });
        return clmns;
    }, [updateTable]);

    const sendQty: () => Promise<void> = async () => {
        const partsQty = data
            .filter((item) => modifiedRows.has(item.id))
            .map((item) => ({ id: item.id, qty_fact: item.qty_fact }));
        await logistCalculateParts(partsQty);
        setNotification(true);
        clearModifiedRows()
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
            apiRef: apiRef,
        }),
        [apiRef, data]
    );

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">
                    Тестовое редактирование деталей программы № {state.ProgramName} на странице логиста
                </Typography>
                <Notification value={notification} setValue={setNotification} />
                {loadError && <div>Ошибка загрузки</div>}
                {showTable && (
                    <>
                        <Button variant="contained" onClick={sendQty} disabled={!modifiedRows.size}>
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


