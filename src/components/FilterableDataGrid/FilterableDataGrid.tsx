import { DataGrid, DataGridProps, GridRowModel, GridColDef } from "@mui/x-data-grid";
import { useState, memo, useEffect, useCallback } from "react";
import SearchToolbar, { SearchToolbarType } from "../CustomToolbar/SearchToolbar";
import { filterRows, syncFiltered } from "../../utils/handleGlobalfilter";

export type FilterableDataGtidProps = Omit<DataGridProps, "rows" | "columns"> & {
    rows: GridRowModel[];
    setRows: React.Dispatch<React.SetStateAction<GridRowModel[]>>;
    columns: GridColDef[];
};

const FilterableDataGtid = memo(({ rows, setRows, columns, ...props }: FilterableDataGtidProps) => {
    // rows и columns сохраняются в компонетне, а в таблицу отправляются filtered
    const [filteredRows, setFilteredRows] = useState<GridRowModel[]>(rows);
    const [filterText, setFilterText] = useState("");
    const [tableWasMutated, setTableWasMutated] = useState(false)

    // фильтрует столбцы для таблицы
    const getFilteredData = useCallback((filterText:string) => {
        setFilteredRows(filterRows(rows, filterText));
    }, [rows]);

    useEffect(() => {
        const timeoutId = setTimeout(()=>getFilteredData(filterText), 500);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [filterText, getFilteredData]);


    // useEffect(() => {
    //     if ( filteredRows !== rows) {
    //         syncFiltered(filteredRows, setRows);
    //         console.log("СИНХРОНИЗАЦИЯ");
            
    //     }
    // }, [filteredRows, rows, setRows]);

    useEffect(() => {
        console.log("rows это новый объект!");
    }, [rows]);

    console.log("таблица перерисовалась");
    return (
        <div style={{ height: 700 }}>
            <DataGrid
                rows={filteredRows}
                columns={columns}
                {...props}
                slots={{ toolbar: SearchToolbar }}
                slotProps={{ toolbar: { filterText, setFilterText } as SearchToolbarType }}
            />
        </div>
    );
});
export default FilterableDataGtid;
