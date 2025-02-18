import React, { useState, useEffect, lazy, Suspense } from "react";

import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL, URL_GET_PROGRAMS } from "../../utils/urls";
import { PrognameType } from "./Techman.types";
import { AddDispatch, RootState } from "../../store/store";
import { dateDiapazonActions } from "../../store/date_diapazon.slice";
import { DateDiapazon } from "../../components/DateDiapazon/DateDiapazon";
import { convertDateToString, convertStringToDate } from "../../utils/convert_time";
import { DateDiapazonType, ProgramStatus, handleCreateDataType, handleSelectType } from "./Techman.types";
import { createDaraRequest, ICreateData } from "../../utils/requests";
import styles from "./Techman.module.css";

const ProgramMainTable = lazy(() => import("../../components/ProgramMainTable/ProgramMainTable"));

axios.defaults.withCredentials = true;

// сопоставление действия над запистью с ее статусом
const actionmap: Record<ProgramStatus, string> = {
    [ProgramStatus.NEW]: "создать",
    [ProgramStatus.CREATED]: "изменить",
};

const Techman = () => {
    const defaultDates: DateDiapazonType = { startDate: new Date(2025, 1, 10), endDate: new Date(2025, 1, 15) };
    const [dates, setDates] = useState<DateDiapazonType>(defaultDates);
    const [data, setData] = useState<PrognameType[]>([]);

    type CreateDataObject = Record<string, ICreateData>;
    const [selectedData, setSelectedData] = useState<CreateDataObject>({}); // массив для отправки на сервер
    const [selectedQty, setSelectedQty] = useState<number>(0);

    // const dispatch = useDispatch<AddDispatch>();

    const [loading, setLoading] = useState(false);
    const [showTable, setShowTable] = useState(false);

    // чтобы они отображались, их нудно сделать сотсояниям, а то при присвоении экран не перерисовывается
    // const { startDate: startDateState, endDate: endDateState } = useSelector((state: RootState) => state.diapazon);

    // TODO:  вставить данные из глобального состояния
    /*загружаем заные о програмах */
    const loadData = async () => {
        setShowTable(false);
        setLoading(true);
        // задержка загрузки данных для того, чтобы отправленные на сервер данные успели обновиться
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 400));

        try {
            const response = await axios.get<PrognameType[]>(`${BASE_URL}/${URL_GET_PROGRAMS}`, {
                params: {
                    start_date: convertDateToString(dates.startDate),
                    end_date: convertDateToString(dates.endDate),
                },
            });
            setData(response.data);
            console.log("данные с сревера:", response.data);
            setLoading(false);
            setShowTable(true);
        } catch (error) {
            console.error("Error fetching protected data:", error);
            return;
        }
    };

    /* оправлем данные программы для обновления статуса */
    const handleCreateData: handleCreateDataType = async () => {
        const createRecords = Object.values(selectedData)
        createDaraRequest(createRecords);
        setSelectedData({})
        loadData();
    };

    const handleSelect: handleSelectType = (props) => {
        console.log("выбираем запись", props);
        setSelectedData((prev) => {
            // если имя программы уже есть среди выделенных записей, его надо удалить
            if (Object.keys(prev).includes(props.ProgramName)) {
                console.log("надо удалить запись");
                return Object.fromEntries(Object.entries(prev).filter(([key]) => key !== props.ProgramName));
            }
            // а если не встречается - добавить
            return { ...prev, [props.ProgramName]: props };
        });
    };

    useEffect(() => {
        setSelectedQty(Object.keys(selectedData).length);
    }, [selectedData]);

    // глобальное хранилице
    // const dispatchDiapazon = () => {
    //     dispatch(
    //         dateDiapazonActions.setDiapazon({
    //             startDate: convertDateToString(new Date(2025, 0, 1)),
    //             endDate: convertDateToString(new Date(2025, 1, 15)),
    //         })
    //     );
    // };

    return (
        <>
            <h2>Главное меню</h2>
            <DateDiapazon defultDates={dates} setDates={setDates} />
            {/*работа с глобальным хранилищем*/}
            {/* <div>
                <p>Начальная дата: {startDateState}</p>
                <p>Конечная дата: {endDateState}</p>
            </div> */}

            <div className={styles["flex_container"]}>
                <button type="button" onClick={loadData}>
                    Получить данные
                </button>
                <button type="button" onClick={handleCreateData}>Загрузить выбранные записи</button>
                {selectedQty}
            </div>

            <div>
                {/*работа с глобальным хранилищем*/}
                {/* <button type="button" onClick={dispatchDiapazon}>
                    Обновление состояния
                </button> */}
            </div>

            {loading && <div>Загрузка...</div>}
            {showTable && (
                <Suspense fallback={<div>Загрузка...</div>}>
                    <ProgramMainTable data={data} handleSelect={handleSelect} />
                </Suspense>
            )}
        </>
    );
};

export default Techman;
