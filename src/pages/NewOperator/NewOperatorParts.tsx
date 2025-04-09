import { useEffect, useState, useCallback, useRef, useContext, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Typography, Button, Checkbox } from "@mui/material";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";
import { DoerType, ProgramExtendedType } from "../Master/Master.types";
import Notification from "../../components/Notification/Notification";
import { getDoers, masterGetDetailsByProgramId, OperatorSetMyPrograms } from "../../utils/requests";
import { MasterProgramPartsRecordType } from "../LogistTable/LogistTable.types";
import { OperatorSelectContext } from "../../context.tsx";
import { hiddenIdColumn } from "../../utils/tableInitialState.ts";

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
    "WOData1",
    "QtyInProcess",
    "qty_fact",
    "PartLength",
    "PartWidth",
    "Thickness",
    "fio_doers",
    "done_by_fio",// добавилась эта колонка
];
export function NewOperatorParts() {
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
    const [checkedParts, setCheckedParts] = useState<number[]>([]);
    const [notification, setNotification] = useState(false); // уведомление, что данные ушли на сервер
    const headers = useRef<Record<string, string>>({});


    const prepareData = (data:MasterProgramPartsRecordType[], doersProcessed: DoersRecord) => {
        const prepared = data.map((row) => {
            let preparedRow = initialClumnFields.reduce((acc, field) => {
                acc[field] = row[field];
                return acc;
            }, {});
            preparedRow["checkBox"] = {
                checked: Boolean(row.done_by_fio_doer_id),
                disabled: false
            }
            preparedRow["done_by_fio"] = doersProcessed[row.done_by_fio_doer_id]
            ? doersProcessed[row.done_by_fio_doer_id].fio_doer
            : ""
            preparedRow["fio_doers"]= ((value) => {
                if (Array.isArray(value)) {
                    return value.map((item) => item.fio_doer).join(", ");
                }
                return value
            })(row.fio_doers)
            return preparedRow;
        });
        return prepared as ProgramPartsProcessedType[] ;
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
            setLoadError(true)
            throw new Error("Не удалось получить список операторов на стрнице деталей.")
        }
        setDoers(doersProcessed);
        const response = await masterGetDetailsByProgramId(state.program.id, selectedOperatorId);
        if (response !== undefined ) {
            setData(prepareData(response.data, doersProcessed));
            headers.current = {...response.headers, done_by_fio:"Сделал"};
            
        } else {
            setLoadError(true);
            throw new Error(`Не удалось получить детали программы ${state.program.ProgramName}.`)
        }
    };

    /** При загрузке страницы загружаем данные о деталях*/
    useEffect(() => {
        loader();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    const getCurrentUserName = useCallback((currentUserId: number, doers: DoersRecord) => {
        if (Object.keys(doers).length) {
            console.log("список операторов:", doers);
            return doers[currentUserId].fio_doer;
        }
        return "";
    }, []);

    useEffect(() => {
        console.log("СПИСОК ПОЛЬЗОВАТЕЛЕЙ ИЗМЕНИЛСЯ!!!");
        if (selectedOperatorId) {
            currentUserName.current = getCurrentUserName(selectedOperatorId, doers);
        }
    }, [selectedOperatorId, doers, getCurrentUserName]);

    const createColumns = () => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let col: GridColDef = {
                field: columnname,
                headerName: headers.current[columnname],
                flex: 1,
            };
            return col;
        });

        clmns.push({
            field: "actions",
            headerName: "Выбрать для загрузки",
            type: "actions",
            width: 150,
            renderCell: (params) => (
                <Checkbox
                    checked={params.row.checkBox.checked}
                    disabled={params.row.checkBox.disabled}
                    onChange={() => processChecked(params.id as number)}
                />
            ),
        });

        return clmns;
    };

    /**
     * Обработка выбора детали с помощью чекбокса. Модифицируются данные в таблице.
     * А именно поле checkBox.checked в редактируемой строке помещается актуальное состояние чекера.
     * Так же в массив сheckedParts идентификатор записи - это означает, что текущий пользователь работал
     * с конкретной строкой таблицы, и содержимое чекера из этой строки скорее всего придется отприть на сервер.
     * @param rowId  - идентификатор записи, содержащей информацию о конкретной детали
     */
    const processChecked = (rowId: number) => {
        // массив рядов, которые чекнул конкретный оператор.
        // Номера рядов могут повторяться, перед отправкой на сервер будут отсеяны только уникальные значения
        setCheckedParts((prev) => [...prev, rowId]);
        setData((prev) =>
            prev!.map((row) => {
                if (row.id === rowId) {
                    return { ...row, checkBox: { disabled: row.checkBox.disabled, checked: !row.checkBox.checked } };
                }
                return row;
            })
        );
    };

    /**
     * Создаем столбцы таблицы после того как данные загрузились
     */
    useEffect(() => {
        if (data.length) {
            columns.current = createColumns();
            //console.log(data);
            setShowTable(true);
        }
    }, [data]);

    /**
     * Отправляем отмеченные чекбоксом делати на сервер
     */
    const setMyParts = () => {
        const uniqueProcessedParts = [...new Set(checkedParts)];
        // чекбоксы отмеченные галочкой
        const uniqueCheckedParts = uniqueProcessedParts.filter(
            (part) => data.find((item) => item.id === part)!.checkBox.checked === true
        );
        if (uniqueCheckedParts.length) {
            const props = {
                program_id: state.program.id,
                fio_doer_id: selectedOperatorId,
                parts_ids: uniqueCheckedParts,
            };
            OperatorSetMyPrograms(props);
            setNotification(true);
            loader();
            setShowTable(true);
        }
    };

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
                        <Button variant="contained" onClick={setMyParts}>
                            Подтвердить детали, выполненные оператором {currentUserName.current}
                        </Button>
                        <div style={{ height: 600, width: "100%" }}>
                            <DataGrid
                                rows={data}
                                columns={columns.current}
                                slots={{ toolbar: CustomToolbar }}
                                initialState={hiddenIdColumn}
                                getRowHeight={() => "auto"}
                            />
                        </div>
                    </>
                )}
            </Box>
        </>
    );
};


