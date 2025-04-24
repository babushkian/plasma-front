import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Box, Typography, Button, Grid2 } from "@mui/material";
import { GridColDef, useGridApiRef, gridClasses } from "@mui/x-data-grid";
import { logistCalculateParts, masterGetDetailsByProgramId } from "../../utils/requests";
import { MasterProgramPartsRecordType } from "./LogistTable.types";
import { useReactToPrint } from "react-to-print";
import Notification from "../../components/Notification/Notification";
import { hiddenIdColumn } from "../../utils/tableInitialState";
import { useProgramInfo } from "../../hooks";
import { ImageWidget } from "../../components/IamgeWidget/ImageWidget";
import { BASE_URL } from "../../utils/urls";

import { PrintableDataGrid } from "../../components/PrintableDataGrid/PrintableDataGrid";

const columnFields = [
    "id",
    "ProgramName",
    "PartName",
    "WONumber",
    "part_pic",
    "PartLength",
    "PartWidth",
    "WOData1",
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

export function LogistPrint3() {
    const programInfo = useProgramInfo();
    console.log("=============");
    console.log(programInfo);

    //просто счетчик для проверки, как перерисовываается таблица при изменении части страницы, которая на таблицу никак не влияет
    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<FilteredMasterProgramParts[]>([]);
    const apiRef = useGridApiRef();

    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [notification, setNotification] = useState(false); // уведомление, что данные ушли на сервер
    // прпорбую считать высоту таблицы руками, чтобы подставлять в div, может после этого печататься легче будет

    const tableRef = useRef<HTMLDivElement>(null);
    const notificationMessage = useRef("Ошибка при отправке данных!");
    // эта функция никогда не изменяется

    const handlePrint = useReactToPrint({ contentRef: tableRef, documentTitle: "title" }); // !!!!!!!!!!

    const createColumns = useCallback((headers: Record<string, string>) => {
        console.log("создаем колонки");
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let col: GridColDef = {
                field: columnname,
                headerName: headers[columnname],
                flex: 1,
                // flex: 0,
                // width: 100,
            };
            if (columnname === "part_pic") {
                col = {
                    ...col,
                    width: 120,
                    flex: 0,
                    renderCell: (params) => <ImageWidget source={params.value} />,
                };
            }
            if (columnname === "PartName") {
                col = {
                    ...col,
                    // width: 110,
                    // flex: 0,
                };
            }
            if (columnname === "fio_doers") {
                col = {
                    ...col,
                    width: 130,
                    flex: 0,
                };
            }

            return col;
        });
        return clmns;
    }, []);

    const prepareData = (data) => {
        const prepared = data.map((row) => {
            let preparedRow = columnFields.reduce<Partial<FilteredMasterProgramParts>>((acc, field) => {
                acc[field] = row[field];
                return acc;
            }, {});
            preparedRow["part_pic"] = row.part_pic ? `${BASE_URL}${row.part_pic}` : null;
            preparedRow["fio_doers"] = row["fio_doers"].map((item) => item.fio_doer).join(", ");
            return preparedRow;
        });
        return prepared;
    };

    /**Функция загрузки данных о деталях */
    const loader = async () => {
        setShowTable(false);
        if (programInfo.programIds === undefined) {
            throw new Error("Отсутствует идентификаторы программ для запроса");
        }
        const response = await masterGetDetailsByProgramId(programInfo.programIds);
        if (response !== undefined) {
            setData(prepareData(response.data));
            columns.current = createColumns(response.headers);
            setShowTable(true);
        } else {
            setLoadError(true);
        }
    };

    /** При загрузке страницы загружаем данные о деталях*/
    useEffect(() => {
        loader();
    }, []); // не надо вставлять зависимости, иначе появляются внезапные перезагрузки бесконтрольные

    // не заметил ээфекта от мемоизации. Не перерисовывает даже если передаем в таблицу обычный объект
    // который должен каждый раз создаваться заново
    const gridParams = useMemo(
        () => ({
            rows: data,
            setRows: setData,
            columns: columns.current,
            initialState: hiddenIdColumn,
            apiRef: apiRef,
            tableRef: tableRef,
        }),
        [apiRef, data]
    );

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Grid2 container sx={{width:"100%"}}>
                    <Grid2 size={3}></Grid2>
                    <Grid2 size={6}>
                    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                        <Typography variant="h5">Страница печати {programInfo.programName}</Typography>
                        {loadError && <div>Ошибка загрузки</div>}
</Box>
                    </Grid2>
                    <Grid2 size={3}>
                    <Box display="flex" justifyContent="end" alignItems="center" height="100%" paddingX={1}>
                            <Button variant="contained" onClick={() => handlePrint()} disabled={!showTable}>
                                Печать
                            </Button>
                            </Box>
                        </Grid2>

                </Grid2>
                {showTable && (
                    <>
                        <PrintableDataGrid {...gridParams}></PrintableDataGrid>

                        <Notification
                            message={notificationMessage.current}
                            value={notification}
                            setValue={setNotification}
                        />
                    </>
                )}
            </Box>
        </>
    );
}
