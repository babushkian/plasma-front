import { DataGrid, DataGridProps } from "@mui/x-data-grid";
import { useState, memo } from "react";
import SearchToolbar from "../CustomToolbar/SearchToolbar";


const FilterableDataGtid = memo(({ rows, columns, ...props }: DataGridProps) => {
    const [filteredData, setFilteredData] = useState(rows);
    console.log("таблица перерисовалась")
    return (
        <div>
            <DataGrid rows={filteredData} columns={columns} {...props} slots={{ toolbar: SearchToolbar }} />
        </div>
    );
});
export default FilterableDataGtid;
