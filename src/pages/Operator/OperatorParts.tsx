import { useEffect, useState, useCallback, useRef, useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Typography, Button, Checkbox } from "@mui/material";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar.tsx";
import { DoerType, ProgramExtendedType } from "../Master/Master.types.ts";
import Notification from "../../components/Notification/Notification.tsx";
import { getDoers, masterGetDetailsByProgramId, OperatorSetMyPrograms } from "../../utils/requests.ts";
import { MasterProgramPartsRecordType } from "../LogistTable/LogistTable.types.ts";
import { OperatorSelectContext } from "../../context.tsx";
import { hiddenIdColumn } from "../../utils/tableInitialState.ts";
import FilteredDataGrid from "../../components/FilterableDataGrid/FilterableDataGrid.tsx";
import { useModifiedRows } from "../../hooks/index.ts";
import { updateTableData } from "../../utils/update-any-field-in-table.ts";
import { ImageWidget } from "../../components/IamgeWidget/ImageWidget.tsx";
import { BASE_URL } from "../../utils/urls.ts";

type DoersRecord = Record<number, DoerType>;

type ProgramPartsProcessedType = MasterProgramPartsRecordType & {
    checkBox: { checked: boolean; disabled: boolean };
} & { done_by_fio: string };

const initialClumnFields: (keyof MasterProgramPartsRecordType)[] = [
    "id",
    "PartName",
    "WONumber",
    "WOData1",
    "QtyInProcess",
    "qty_fact",
    "PartLength",
    "PartWidth",
    "Thickness",
];

const columnFields: (keyof ProgramPartsProcessedType)[] = [
    "id",
    "PartName",
    "WONumber",
    "part_pic",
    "PartLength",
    "PartWidth",
    "WOData1",
    "QtyInProcess",
    "qty_fact",
    "Thickness",
    "fio_doers",
    "done_by_fio", // добавилась эта колонка
    "checkBox",
] 


export function OperatorParts() {
    // Состояние, которое передается при нажатии на сылку. Нужно для отображения имени программы в заголовке,
    // так как у деталей такой информции нет
    const { state }: { state: { program: ProgramExtendedType } } = useLocation();

    const operatorIdContext = useContext(OperatorSelectContext);
    if (!operatorIdContext) {
        throw new Error("не определено начальное значение для конекста пользователя");
    }
    const { selectedOperatorId } = operatorIdContext;
    const currentUserName = useRef<string>("");
    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<ProgramPartsProcessedType[]>([]);
    const [doers, setDoers] = useState<DoersRecord>({});
    const apiRef = useGridApiRef();
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [notification, setNotification] = useState(false); // уведомление, что данные ушли на сервер
    const programImg = useRef<string | null>(null)

    const { modifiedRows, clearModifiedRows, updateModifiedRows } = useModifiedRows();
    const dataUpdater = useMemo(() => updateTableData(columnFields, setData), []);

    const updateTable = useCallback(
        (rowId: number, processObject) => {
            updateModifiedRows(rowId);
            dataUpdater(rowId, processObject);
        },
        [dataUpdater, updateModifiedRows]
    );

    const prepareData = (data: MasterProgramPartsRecordType[], doersProcessed: DoersRecord) => {
        const prepared = data.map((row) => {
            let preparedRow = initialClumnFields.reduce((acc, field) => {
                acc[field] = row[field];
                return acc;
            }, {});
            preparedRow["part_pic"] = row.part_pic?`${BASE_URL}${row.part_pic}`: null;
            preparedRow["checkBox"] = {
                checked: Boolean(row.done_by_fio_doer_id),
                disabled: false,
                //disabled: row.done_by_fio_doer_id && selectedOperatorId !== row.done_by_fio_doer_id ? true : false,
            };
            preparedRow["done_by_fio"] = doersProcessed[row.done_by_fio_doer_id]
                ? doersProcessed[row.done_by_fio_doer_id].fio_doer
                : "";
            preparedRow["fio_doers"] = ((value) => {
                if (Array.isArray(value)) {
                    return value.map((item) => item.fio_doer).join(", ");
                }
                return value;
            })(row.fio_doers);
            return preparedRow;
        });
        return prepared as ProgramPartsProcessedType[];
    };

    /**
     * Функция загрузки данных о деталях
     * Сначала загружаются операторы (для отображения фамилий  в таблице).
     * А когда они загрузились, загружаются данные.
     */
    const loader = async () => {
        setShowTable(false);
        const responseDoers = await getDoers();
        let doersProcessed: DoersRecord | undefined = undefined;
        if (responseDoers) {
            doersProcessed = responseDoers.reduce((acc, item) => {
                acc[item.id] = item;
                return acc;
            }, {});
        } else {
            setLoadError(true);
            throw new Error("Не удалось получить список операторов на стрнице деталей.");
        }
        setDoers(doersProcessed);
        const response = await masterGetDetailsByProgramId(state.program.id, selectedOperatorId);
        if (response !== undefined) {
            setData(prepareData(response.data, doersProcessed));
            columns.current = createColumns({
                ...response.headers,
                done_by_fio: "Сделал",
                checkBox: "отметить сделанное",
            });
            programImg.current = response.program_pic?`${BASE_URL}${response.program_pic}`: null;
            setShowTable(true);
        } else {
            setLoadError(true);
            throw new Error(`Не удалось получить детали программы ${state.program.ProgramName}.`);
        }
    };

    /** При загрузке страницы загружаем данные о деталях*/
    useEffect(() => {
        loader();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Определяем имя текущего оператора для вывода на кнопке
     */
    useEffect(() => {
        if (selectedOperatorId && Object.keys(doers).length) {
            currentUserName.current = doers[selectedOperatorId].fio_doer;
        }
    }, [selectedOperatorId, doers]);

    const createColumns = (headers:Record<string, string>) => {
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

            if (columnname === "checkBox") {
                col = {
                    ...col,
                    type: "actions",
                    width: 150,
                    renderCell: (params) => (
                        <Checkbox
                            checked={params.row.checkBox.checked}
                            disabled={params.row.checkBox.disabled}
                            onChange={() => {
                                const checkedObj = { ...params.row.checkBox, checked: !params.row.checkBox.checked };
                                updateTable(params.id, { checkBox: () => checkedObj });
                            }}
                        />
                    ),
                };
            }
            return col;
        });
        return clmns;
    };


    /**
     * Отправляем отмеченные чекбоксом делати на сервер
     */
    const setMyParts = () => {
        const checkedParts = data
            .filter((item) => modifiedRows.has(item.id) && item.checkBox.checked)
            .map((item) => item.id);
        const props = {
            program_id: state.program.id,
            fio_doer_id: selectedOperatorId!,
            parts_ids: checkedParts,
        };
        OperatorSetMyPrograms(props);
        setNotification(true);
        clearModifiedRows();
        loader();

    };

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
                <Typography variant="h5">
                    Редактирование деталей программы № {state.program.ProgramName} на странице оператора
                </Typography>
                {loadError && <div>Ошибка загрузки</div>}
                <Notification value={notification} setValue={setNotification} />
                {showTable && (
                    <>
                        <Button variant="contained" onClick={setMyParts} disabled={!modifiedRows.size}>
                            Подтвердить детали, выполненные оператором {currentUserName.current}
                        </Button>
                        <ImageWidget source={programImg.current}/>
                        <div style={{ height: 600, width: "100%" }}>
                            <FilteredDataGrid {...gridParams} />
                        </div>
                    </>
                )}
            </Box>
        </>
    );
}
