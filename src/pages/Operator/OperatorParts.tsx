import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Box, Typography, Button, Checkbox } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { DoerType, ProgramExtendedType } from "../Master/Master.types";

import { masterGetDetailsByProgramId, OperatorSetMyPrograms } from "../../utils/requests";

import { MasterProgramPartsRecordType } from "../LogistTable/LogistTable.types";

type CheckedPartsType = Record<number, boolean>;

// столбцы, отображаемые в таблице
const columnFields: (keyof MasterProgramPartsRecordType)[] = [
    "id",
    "ProgramName",
    "program_status",
    "part_status",
    "QtyInProcess",
    "WONumber",
];

const OperatorParts = () => {
    // Состояние, которое передается при нажатии на сылку. Нужно для отображения имени программы в заголовке,
    // так как у деталей такой информции нет
    const { state }: { state: { program: ProgramExtendedType; currentDoer: DoerType } } = useLocation();

    const columns = useRef<GridColDef[]>([]);
    const [data, setData] = useState<MasterProgramPartsRecordType[]>([]);

    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    //const [checkedParts, setCheckedParts] = useState<CheckedPartsType>({})

    /**Функция загрузки данных о деталях */
    const loader = async () => {
        setShowTable(false);
        // найти способ добавить сюда идентификатор пользователя
        // нужно его держать в глобальном состоянии
        const response = await masterGetDetailsByProgramId(state.program.id, state.currentDoer.id);
        if (response !== undefined) {
            const procesedResponse = response.map((item) => ({ ...item, checked: false }));
            setData(procesedResponse);
            setShowTable(true);
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
                <Checkbox checked={params.row.checked} onChange={() => processChecked(params.id)} />
            ),
        });

        return clmns;
    };

    const processChecked = (rowId: number) => {
        setData((prev) =>
            prev!.map((row) => {
                if (row.id === rowId) {
                    return { ...row, checked: !row.checked };
                }
                return row;
            })
        );
    };

    useEffect(() => {
        columns.current = createColumns();
        console.log(data);
    }, [data]);

    const setMyParts = () => {
        const parts = data.filter((item) => item.checked === true).map((item) => item.id);
        const props = { program_id: state.program.id, fio_doer_id: state.currentDoer.id, parts_ids: parts };
        console.log(props);
        OperatorSetMyPrograms(props);
    };

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">
                    Редактирование деталей программы № {state.program.ProgramName} на странице логиста
                </Typography>
                {state.currentDoer.fio_doer}
                {loadError && <div>Ошибка загрузки</div>}
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
