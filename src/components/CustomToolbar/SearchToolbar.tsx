import { GridToolbarColumnsButton, GridToolbarContainer, GridToolbarFilterButton } from "@mui/x-data-grid";
import { Box, TextField } from "@mui/material";
import { useEffect, useState, useCallback } from "react";

function SearchToolbar(props) {
    const [filterText, setFilterText] = useState("");

    const handleChangeText = (value: string) => {
        setFilterText(value);
        console.log(value);
    };

    const filterData = useCallback(() => {
        console.log("filtered:", filterText);
    }, [filterText]);

    useEffect(() => {
        const timeoutId = setTimeout(filterData, 500);
        return () => {
            clearTimeout(timeoutId);
        };
    }, [filterText, filterData]);

    return (
        <GridToolbarContainer>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <Box flex={1} />
            <TextField
                sx={{ flex: 1 }}
                variant="standard"
                placeholder="поиск по таблице"
                value={filterText}
                onChange={(e) => handleChangeText(e.target.value)}
            />
        </GridToolbarContainer>
    );
}

export default SearchToolbar;
