import { DataGrid, DataGridProps } from "@mui/x-data-grid";
import { useState, memo, useEffect, useCallback } from "react";
import SearchToolbar, { SearchToolbarType } from "../CustomToolbar/SearchToolbar";
import { filterRows } from "../../utils/handleGlobalfilter";
import { Height } from "@mui/icons-material";

const FilterableDataGtid = memo(({ rows, columns, ...props }: DataGridProps) => {
    // rows и columns сохраняются в компонетне, а а таблицу отправляются filtered
    const [filteredRows, setFilteredRows] = useState(rows);
    const [filterText, setFilterText] = useState("");

    const filterData = useCallback(() => {
        setFilteredRows( filterRows(rows, filterText))
    }, [filterText, rows]);

    useEffect(() => {
        const timeoutId = setTimeout(filterData, 500);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [filterText, filterData]);

    console.log("таблица перерисовалась");
    return (
        <div style={{height:700}}>
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
