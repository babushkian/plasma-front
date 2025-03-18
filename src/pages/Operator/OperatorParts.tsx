import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Typography, Button, Checkbox } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { DoerType, ProgramExtendedType } from "../Master/Master.types";
import Notification from "../../components/Notification/Notification"
import { getDoers, masterGetDetailsByProgramId, OperatorSetMyPrograms } from "../../utils/requests";
import { MasterProgramPartsRecordType } from "../LogistTable/LogistTable.types";
type DoersRecord = Record<number, DoerType>;

type ProgramPartsProcessedType = MasterProgramPartsRecordType & {
    checkBox: { checked: boolean; disabled: boolean };
} & { done_by_fio: string };

// столбцы, отображаемые в таблице
const columnFields: (keyof ProgramPartsProcessedType)[] = [
    "id",
    "ProgramName",
    "program_status",
    "part_status",
    "QtyInProcess",
    "WONumber",
    "done_by_fio",
];

const OperatorParts = () => {
    // Состояние, которое передается при нажатии на сылку. Нужно для отображения имени программы в заголовке,
    // так как у деталей такой информции нет
    const { state }: { state: { program: ProgramExtendedType; currentDoer: DoerType } } = useLocation();

    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<ProgramPartsProcessedType[]>([]);
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [checkedParts, setCheckedParts] = useState<number[]>([]);
    const [notification, setNotification] = useState(false); // уведомление, что данные ушли на сервер
    /**Функция загрузки данных о деталях */
    const loader = async () => {
        setShowTable(false);
        // найти способ добавить сюда идентификатор пользователя
        // нужно его держать в глобальном состоянии
        const responseDoers = await getDoers();
        let doersProcessed: DoersRecord;
        if (responseDoers) {
            console.log("ответ сервера", responseDoers);

            doersProcessed = responseDoers.reduce((acc, item) => {
                acc[item.id] = item;
                return acc;
            }, {});

            //setCurrentDoer(response[0]);
        }
        const response = await masterGetDetailsByProgramId(state.program.id, state.currentDoer.id);
        if (response !== undefined && responseDoers !== undefined) {
            
            const procesedResponse = response.map((item) => ({
                ...item,
                checkBox: {
                    checked: Boolean(item.done_by_fio_doer_id),
                    disabled:
                        item.done_by_fio_doer_id && state.currentDoer.id !== item.done_by_fio_doer_id ? true : false,
                },
                done_by_fio: doersProcessed[item.done_by_fio_doer_id]
                    ? doersProcessed[item.done_by_fio_doer_id].fio_doer
                    : "",
            }));
            setData(procesedResponse);
        } else {
            setLoadError(true);
        }
    };

    /** При загрузке страницы загружаем данные о деталях*/
    useEffect(() => {
        loader();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createColumns = () => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            const col: GridColDef = {
                field: columnname,
                headerName: columnname,
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
            console.log(data);
            setShowTable(true)
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
                fio_doer_id: state.currentDoer.id,
                parts_ids: uniqueCheckedParts,
            };
            OperatorSetMyPrograms(props);
            setNotification(true)
            loader()
            setShowTable(true)
        }
    };

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">
                    Редактирование деталей программы № {state.program.ProgramName} на странице оператора
                </Typography>
                {state.currentDoer.fio_doer}
                {loadError && <div>Ошибка загрузки</div>}
                <Notification value={notification} setValue ={setNotification} />
                {showTable && (
                    <>
                        <Button variant="contained" onClick={setMyParts}>
                            Подтвердить детали, выполненные оператором {state.currentDoer.fio_doer}
                        </Button>
                        <div style={{ height: 600, width: "100%" }}>
                            <DataGrid rows={data} columns={columns.current} />
                        </div>
                    </>
                )}
            </Box>
        </>
    );
};

export default OperatorParts;
