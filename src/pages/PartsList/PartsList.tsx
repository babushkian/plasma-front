import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation} from "react-router-dom";

import { Box, Typography, Button } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar"
import { ProgramExtendedType } from "../Master/Master.types";

import { logistCalculateParts, masterGetDetailsByProgramId } from "../../utils/requests";

import { MasterProgramPartsRecordType } from "../LogistTable/LogistTable.types";

type factQtyType = { id: number; qty_fact: number };
type factQtyRecordType = Record<number, factQtyType>;

// столбцы, отображаемые в таблице
// const columnFields: (keyof MasterProgramPartsRecordType)[] = [
//     "id",
//     "ProgramName",
//     "program_status",
//     "QtyInProcess",
//     "qty_fact",
//     "WONumber",
// ];

const columnFields: (keyof MasterProgramPartsRecordType)[] = [
"PartName",
"WONumber",
"WOData1",
"QtyInProcess",
"qty_fact",
"PartLength",
"PartWidth",
"Thickness",
"fio_doers",
]

const PartsList = () => {
    // Состояние, которое передается при нажатии на сылку. Нужно для отображения имени программы в заголовке,
    // так как у деталей такой информции нет
    const { state }: { state: ProgramExtendedType } = useLocation();

    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<MasterProgramPartsRecordType[]>([]);

    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    // объект с измененными стрками, в которые введено количество изготовленных деталей
    const [factQty, setFactQty] = useState<factQtyRecordType>({});
    const headers = useRef({})

    /**Функция загрузки данных о деталях */
    const loader = async () => {
        setShowTable(false);
        const response = await masterGetDetailsByProgramId(state.id);
        if (response !== undefined) {
            setData(response.data);
            headers.current = response.headers
            setShowTable(true);
        } else {
            setLoadError(true);
        }
    };

    /** При загрузке страницы загружаем данные о деталях*/
    useEffect(() => {
        loader();
    }, []);

    useEffect(() => {
        console.log("изменился фрейм:", data);
    }, [data]);

    const createColumns = useCallback(() => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let col: GridColDef = {
                field: columnname,
                headerName: headers.current[columnname],
                flex: 1,
            };
            if (columnname == "fio_doers") {
                col = {
                    ...col,
                    valueGetter: (value) => {
                        if (Array.isArray(value)) {
                            return value.map((item) => item.fio_doer).join(", ");
                        }
                        return value.fio_doer
                    },
                };
            }

            return col;
        });

        return clmns;
    }, []);

    useEffect(() => {
        columns.current = createColumns();
    }, [data, createColumns]);

    
    const setQty: (programId: number, qty: number) => void = (programId, qty) => {
        console.log("весь фрейм:", data);
        console.log("пераметры: ", programId, qty);
        const dataIndex = data.findIndex((item) => programId === item.id);
        console.log("индекс строки", dataIndex, "значение", qty);

        if (data[dataIndex].qty_fact === qty) {
            return;
        } else {
            // добвляем элемент в массив
            setFactQty((prev) => ({ ...prev, [programId]: { id: programId, qty_fact: qty } }));
        }
    };


    const sendQty: () => Promise<void> = async () => {
        if (Object.keys(factQty).length === 0) {
            return;
        }
        const partsQty = Object.values(factQty);
        await logistCalculateParts(partsQty);
        // сброс заполненных работников и перезагрузка страницы

        setFactQty(() => ({}));
        loader();
    };


    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">
                   Информация о деталях программы № {state.ProgramName} на странице логиста
                </Typography>

                {loadError && <div>Ошибка загрузки</div>}
                {showTable && (
                    <>
                        <Button variant="contained" onClick={sendQty} disabled={false}>
                            Применить фактическое количество деталей
                        </Button>
                        <div style={{ height: 600, width: "100%" }}>
                            <DataGrid rows={data} columns={columns.current} slots={{ toolbar: CustomToolbar }}/>
                        </div>
                    </>
                )}
            </Box>
        </>
    );
};

export default PartsList;
