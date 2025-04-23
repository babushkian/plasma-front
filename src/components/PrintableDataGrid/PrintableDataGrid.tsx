import {
    DataGrid,
    DataGridProps,
    GridRowModel,
    GridColDef,
    GridColumnVisibilityModel,
    GridInitialState,
    GridFilterModel,
} from "@mui/x-data-grid";
import React, { useState, memo, useEffect, useCallback, useRef } from "react";
import SearchToolbar, { SearchToolbarType } from "../CustomToolbar/SearchToolbar";
import { filterRows } from "../../utils/handleGlobalfilter";
import styles from "./PritableDataGrid.module.css";

export type FilterableDataGtidProps = Omit<DataGridProps, "rows" | "columns"> & {
    rows: GridRowModel[];
    columns: GridColDef[];
    tableRef: React.Ref<HTMLDivElement>;
    initialState: GridInitialState;
};

export const PrintableDataGrid = memo(
    ({ rows, columns, tableRef, initialState, ...props }: FilterableDataGtidProps) => {
        const [filteredRows, setFilteredRows] = useState<GridRowModel[]>(rows);
        const [filterText, setFilterText] = useState("");
        const tableHeigth = useRef(600); //высота таблицы по умолчанию
        const prevFilterText = useRef(filterText);
        const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
            initialState.columns?.columnVisibilityModel
        );
        const [filterModel, setFilterModel] = React.useState<GridFilterModel>({
            items: [
                {
                    field: "",
                    operator: "",
                    value: "",
                },
            ],
        });

        // фильтрует столбцы для таблицы
        const getFilteredData = useCallback(
            (filterText: string) => {
                setFilteredRows(filterRows(rows, filterText));
            },
            [rows]
        );

        const handleVisibilityModel = (newModel: GridColumnVisibilityModel) => {
            setColumnVisibilityModel(newModel);
        };

        useEffect(
            () => {
                tableHeigth.current = 145 + filteredRows.length * 145;
            }, // примерная высота одной строки + шапка и футер
            [filteredRows]
        );
        // фильтрация по таблице происходит либо мгновенно, когда внутри таблицы меняются значения
        // либо с паузой, когра происходит ввод глобального фильтра, чтобы таблица не дергалась на каждое нажатие клавиши
        useEffect(() => {
            let timeout = 0;
            const changed = filterText !== prevFilterText.current;
            if (changed) timeout = 500;
            const timeoutId = setTimeout(() => {
                getFilteredData(filterText);
                prevFilterText.current = filterText;
            }, timeout);
            return () => {
                clearTimeout(timeoutId);
            };
        }, [filterText, getFilteredData]);

        return (
            <>
                <div style={{ height: 700, width: "100%" }}>
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        {...props}
                        slots={{ toolbar: SearchToolbar }}
                        slotProps={{ toolbar: { filterText, setFilterText } as SearchToolbarType }}
                        getRowHeight={() => "auto"}
                        columnVisibilityModel={columnVisibilityModel}
                        onColumnVisibilityModelChange={handleVisibilityModel}
                        filterModel={filterModel}
                        onFilterModelChange={(newFilterModel) => setFilterModel(newFilterModel)}
                    />
                </div>
                <div
                    id="table-div"
                    ref={tableRef}
                    // высота таблицы нужна обязательно, иначе обрезает строки
                    style={{ height: tableHeigth.current, width: "1306px" }}
                    className={styles["print-container"]}
                >
                    <DataGrid
                        rows={filteredRows}
                        columns={columns}
                        className={styles["print-table"]}
                        {...props}
                        getRowHeight={() => "auto"}
                        disableVirtualization
                        columnVisibilityModel={columnVisibilityModel}
                        filterModel={filterModel}
                    />
                </div>
            </>
        );
    }
);
