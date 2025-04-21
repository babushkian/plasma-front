import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Box, Typography, Button, Grid2 } from "@mui/material";
import { GridColDef, useGridApiRef } from "@mui/x-data-grid";
import { logistCalculateParts, masterGetDetailsByProgramId } from "../../utils/requests";
import { MasterProgramPartsRecordType } from "./LogistTable.types";

import Notification from "../../components/Notification/Notification";
import { hiddenIdColumn } from "../../utils/tableInitialState";
import FilteredDataGrid from "../../components/FilterableDataGrid/FilterableDataGrid";
import { useProgramInfo } from "../../hooks";
import { ImageWidget } from "../../components/IamgeWidget/ImageWidget";
import { BASE_URL } from "../../utils/urls";

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

export function LogistPrint() {
    const programInfo =  useProgramInfo()
    console.log("=============")
    console.log(programInfo)
    
    //просто счетчик для проверки, как перерисовываается таблица при изменении части страницы, которая на таблицу никак не влияет
    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<FilteredMasterProgramParts[]>([]);
    const apiRef = useGridApiRef();

    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [notification, setNotification] = useState(false); // уведомление, что данные ушли на сервер

    const notificationMessage = useRef("Ошибка при отправке данных!");
    // эта функция никогда не изменяется



    const createColumns = useCallback(
        (headers: Record<string, string>) => {
            console.log("создаем колонки");
            const clmns: GridColDef[] = columnFields.map((columnname) => {
                let col: GridColDef = {
                    field: columnname,
                    headerName: headers[columnname],
                    flex: 1,
                };
                if (columnname === "part_pic") {
                    col = {
                        ...col,
                        width: 130,
                        flex: 0,
                        renderCell: (params) => <ImageWidget source={params.value} />,
                    };
                }

                return col;
            });
            return clmns;
        },
        []
    );

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
        if (programInfo.programIds ===undefined) {
            throw new Error("Отсутствует идентификаторы программ для запроса")
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
            disableVirtualization: true,
        }),
        [apiRef, data]
    );

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">
                    Страница печати {programInfo.programName} 
                </Typography>
                {loadError && <div>Ошибка загрузки</div>}
                {showTable && (
                    <>

                            <Button variant="contained"  >
                                Печать
                            </Button>

                        <div style={{ height: 2600, width: "100%" }}>
                            {/*такой подход позволяет избежать лишних перерисовок, когда параметры передаются одим объектом*/}
                            <FilteredDataGrid {...gridParams} />
                        </div>
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
