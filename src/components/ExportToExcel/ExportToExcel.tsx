// код позаимствован из https://github.com/prettyblueberry/mui-datagrid-full-edit/blob/main/src/lib/components/GridExcelExportMenuItem.js
import { Button } from "@mui/material";
import * as XLSX from "xlsx";
import {
    GridColDef,
    gridFilteredSortedRowIdsSelector,
    gridVisibleColumnFieldsSelector,
    useGridApiContext,
} from "@mui/x-data-grid";

function getExcelData(apiRef) {
    // Select rows and columns
    const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
    const visibleColumnsField = gridVisibleColumnFieldsSelector(apiRef);
    // Format the data. Here we only keep the value
    return filteredSortedRowIds.map((id) => {
        const row = {};
        visibleColumnsField.forEach((field) => {
            row[field] = apiRef.current.getCellParams(id, field).value;
        });
        return row;
    });
}

function handleExport(apiRef, columns: GridColDef[]) {
    const data = getExcelData(apiRef);
    const fields = Object.keys(data[0]);
    const translateObj = columns.reduce((acc, item) => {
        acc[item.field] = item.headerName;
        return acc;
    }, {} as Record<string, string | undefined>);
    const rows = data.map((row) => {
        const mRow = {};
        for (const key of fields) {
            mRow[key] = row[key];
        }
        return mRow;
    });


    const columnNames = fields.map((item) => translateObj[item]);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.sheet_add_aoa(worksheet, [[...columnNames]], {
        origin: "A1",
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    console.log(workbook);
    XLSX.writeFile(workbook, document.title + ".xlsx", { compression: true });
}

export default function GridExcelExportMenuItem({ columns }) {
    const apiRef = useGridApiContext();
    return (
        <Button
            variant="contained"
            size="small"
            onClick={() => {
                handleExport(apiRef, columns);
            }}
        >
            Скачать XLSX
        </Button>
    );
}
