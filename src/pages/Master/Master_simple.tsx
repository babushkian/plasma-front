import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLoaderData } from "react-router-dom";
import { Box, Typography, Button, Stack, Snackbar, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import DumbDoerSelect from "../../components/DoerSelect/DumbDoerSelect";

import PrioritySelect from "../../components/PrioritySelect/PropritySelect";
import { assignProgramsRequest, getProgramsAndDoers } from "../../utils/requests";
import { DoerType, ProgramType, ProgramExtendedType, ResponseType, AssignProgramRequestType } from "./Master.types";
import { ProgramPriorityType } from "../Logist/Logist.types";

const priorityArray: ProgramPriorityType[] = Object.values(ProgramPriorityType);
const columnFields: (keyof ProgramExtendedType)[] = ["id", "program_priority", "program_status", "doerIds"];

const Master = () => {
    //const data = useLoaderData() as ResponseType;

    //данные пришедшие с свервера и неподготовленные для отображения в таблице
    const [data, setData] = useState<ResponseType>();

    /**
     * Загрузка программ и операторов для отображения на странице мастера
     */
    const loadData = async () => {
        const rawData = await getProgramsAndDoers();
        if (rawData?.programs) {
            setData(rawData);
        }
    };

    useEffect(() => {
        // загрузка данных при загрузке страницы
        loadData();
    }, []);

    // обработанные данные с сервера
    const [programsData, setProgramsData] = useState<Partial<ProgramType>[] | null>(null);
    // в переменной содержатся сфмилии исполнителей, они не меняются, поэтому useState не нужен
    const doers = useRef<DoerType[]>([]);
    //записи в такблице, которые были модифицированы
    const [updatedPrograms, setUpdatedPrograms] = useState<Array<number>>([]);
    const [notification, setNotofication] = useState(false);

    /**Когда данные загружаются, их надо подогнать под конкретную таблицу, а именно выделить
     * из пришедшего с сервера объекта только нужные имена столбцов для отображения их в таблице.
     * заполняет переменную programsData
     * необходимые колонки берет из columnFields
     * */
    useEffect(() => {
        console.log("формируем новые данные в таблицу");
        if (data?.programs !== undefined) {
            console.log("с сервера пришли нормальные данные, можно формировать", data.programs[0]);
            setProgramsData(
                data.programs.map((item) => {
                    const row = columnFields.reduce<Partial<ProgramExtendedType>>((acc, field) => {
                        acc[field] = item[field];
                        return acc;
                    }, {});
                    row["doerFio"] = item.fio_doers.map((doer) => doer.fio_doer).join(", ");
                    row["doerIds"] = item.fio_doers.map((doer) => doer.id);
                    row["dimensions"] = `${Math.round(item.SheetLength)} x ${Math.round(item.SheetWidth)} x 
                                        ${item.Thickness}`;
                    return row;
                })
            );

            doers.current = [...data.doers.sort((a, b) => a.fio_doer.localeCompare(b.fio_doer))];
        }
    }, [data]);


    const handlePriorityChange = useCallback(
        (rowId: number, value: ProgramPriorityType) => {
            if (!updatedPrograms.includes(rowId)) {
                setUpdatedPrograms((prev) => [...prev, rowId]);
            }
            setProgramsData((prev) =>
                prev!.map((row) => {
                    if (row.id === rowId) {
                        return { ...row, program_priority: value };
                    }
                    return row;
                })
            );
        },
        [updatedPrograms]
    );

    const handleDoerAssign = useCallback(
        (rowId: number, doerIds: number[]) => {
            if (!updatedPrograms.includes(rowId)) {
                setUpdatedPrograms((prev) => [...prev, rowId]);
            }
            setProgramsData((prev) =>
                prev!.map((row) => {
                    if (row.id === rowId) {
                        return { ...row, doerIds };
                    }
                    return row;
                })
            );
        },
        [updatedPrograms]
    );

    useEffect(() => console.log("измененные ряды:", updatedPrograms), [updatedPrograms]);
    useEffect(() => console.log("изменились данные в таблице:"), [programsData]);
    useEffect(() => console.log("новые данные с сервена, нужно подготавливать для таблицы:"), [data]);

    const handleAssignPrograms = async () => {
        const programs = programsData
            // рассматриваем только те записи, у которых есть фамилии. Без фамилий приоритет поменять
            // нельзя, поле с исполнителями обязательно при отправке на сервер
            ?.filter((item) => updatedPrograms.includes(item.id) && item.doerIds.length)
            .map((item) => {
                if (item.doerIds.length) {
                    return { id: item.id, fio_doers_ids: item.doerIds, program_priority: item.program_priority };
                }
            });
        console.log(programs);
        //если фамилии не выбраны, запрос не посылаем

        if (programs.length === 0) {
            return;
        }

        await assignProgramsRequest(programs);
        // сброс заполненных работников и перезагрузка страницы
        setUpdatedPrograms([]);
        setNotofication(true);
        loadData();
    };

    const simple_table = useCallback( () => {
        return programsData?.map((row) => {
            return (
                <tr key={row.id}>
                    <td>{row.id!.toString()}</td>
                    <td>{row.program_status}</td>
                    <td>{row.doerIds.toString()}</td>
                    <td>{row.program_priority}</td>
                    <td>
                        <PrioritySelect
                            selectedValue={row.program_priority!}
                            rowId={row.id!}
                            priorityOptions={priorityArray}
                            assignHandler={handlePriorityChange}
                        />
                    </td>
                    <td>
                        <DumbDoerSelect
                            selectValue={row.doerIds}
                            rowId={row.id}
                            doers={doers.current}
                            assignHandler={handleDoerAssign}
                        />
                    </td>
                </tr>
            );
        });
    },[handleDoerAssign, handlePriorityChange, programsData])

    const handleClosePopup = () => setNotofication(false);

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">Рабочее место мастера</Typography>
                <Stack direction="row" spacing={2}>
                    <Button variant="contained" onClick={handleAssignPrograms} disabled={updatedPrograms.length === 0}>
                        Отправить в работу
                    </Button>
                </Stack>
                <Snackbar
                    message="Записи обновлены"
                    open={notification}
                    autoHideDuration={5000}
                    onClose={handleClosePopup}
                    action={
                        <IconButton aria-label="close" color="inherit" sx={{ p: 0.5 }} onClick={handleClosePopup}>
                            <CloseIcon />
                        </IconButton>
                    }
                />

                {programsData !== null && (
                    <div style={{ height: 600, width: "100%" }}>
                        <table style={{ margin: "0 auto" }}>
                            <tbody>{simple_table()}</tbody>
                        </table>
                    </div>
                )}
            </Box>
        </>
    );
};
export default Master;
