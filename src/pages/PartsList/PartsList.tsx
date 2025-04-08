import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";

import { Box, Typography } from "@mui/material";
import { GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { ProgramExtendedType } from "../Master/Master.types";

import { masterGetDetailsByProgramId } from "../../utils/requests";
import FilteredDataGrid from "../../components/FilterableDataGrid/FilterableDataGrid";
import { MasterProgramPartsRecordType } from "../LogistTable/LogistTable.types";
import { hiddenIdColumn } from "../../utils/tableInitialState";

const columnFields: (keyof MasterProgramPartsRecordType)[] = [
    //обязательно нужен id
    "PartName",
    "WONumber",
    "WOData1",
    "QtyInProcess",
    "qty_fact",
    "PartLength",
    "PartWidth",
    "Thickness",
    "fio_doers",
];

const PartsList = () => {
    // Состояние, которое передается при нажатии на сылку. Нужно для отображения имени программы в заголовке,
    // так как у деталей такой информции нет
    const { state }: { state: ProgramExtendedType } = useLocation();

    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<MasterProgramPartsRecordType[]>([]);
    const apiRef = useGridApiRef();
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);

    const prepareData = (data: MasterProgramPartsRecordType[]) => {
        const processedData = data.map((item) => {
            const row = columnFields.reduce<MasterProgramPartsRecordType>((acc, field) => {
                acc[field] = item[field];
                return acc;
            }, {});
            row["fio_doers"] = item.fio_doers.map((item) => item.fio_doer).join(", ");
            //////////////////////////
            // так быть не должно, нужно поле  id для деталей
            row["id"] = item.PK_PIP;
            return row;
        });
        return processedData;
    };

    const createColumns = useCallback((headers) => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let col: GridColDef = {
                field: columnname,
                headerName: headers[columnname],
                flex: 1,
            };
            return col;
        });
        return clmns;
    }, []);

    /*Функция загрузки данных о деталях */
    const loader = useCallback( async () => {
        setShowTable(false);
        const response = await masterGetDetailsByProgramId(state.id);
        if (response !== undefined) {
            setData(prepareData(response.data));
            columns.current = createColumns(response.headers);
            setShowTable(true);
        } else {
            setLoadError(true);
        }
    }, [createColumns, state.id])

    /** При загрузке страницы загружаем данные о деталях*/
    useEffect(() => {
        loader();
    }, [loader]);

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
                <Typography variant="h5">Информация о деталях программы № {state.ProgramName}</Typography>

                {loadError && <div>Ошибка загрузки</div>}
                {showTable && (
                    <>
                        <div style={{ height: 700, width: "100%" }}>
                            <FilteredDataGrid {...gridParams} />
                        </div>
                    </>
                )}
            </Box>
        </>
    );
};

export default PartsList;
