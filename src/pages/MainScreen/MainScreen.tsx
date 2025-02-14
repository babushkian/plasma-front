import React, { useState, lazy, Suspense } from "react";

import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL, URL_GET_PROGRAMS } from "../../utils/urls";
import { PrognameType } from "./MainScreen.types";
import { AddDispatch, RootState } from "../../store/store";
import { dateDiapazonActions } from "../../store/date_diapazon.slice";
import { DateDiapazon } from "../../components/DateDiapazon/DateDiapazon";
import { convertDateToString, convertStringToDate } from "../../utils/convert_time";
import { DateDiapazonType, ProgramStatus, handleCreateDataType } from "./MainScreen.types";
import { createDaraRequest } from "../../utils/requests";

const ProgramMainTable = lazy(() => import("../../components/ProgramMainTable/ProgramMainTable"));

axios.defaults.withCredentials = true;

// сопоставление действия над запистью с ее статусом
const actionmap: Record<ProgramStatus, string> = {
    [ProgramStatus.NEW]: "создать",
    [ProgramStatus.CREATED]: "изменить",
};

const MainScreen = () => {
    const defaultDates: DateDiapazonType = { startDate: new Date(2025, 1, 5), endDate: new Date(2025, 1, 15) };
    const [dates, setDates] = useState<DateDiapazonType>(defaultDates);
    const [data, setData] = useState<PrognameType[]>();
    const dispatch = useDispatch<AddDispatch>();

    // чтобы они отображались, их нудно сделать сотсояниям, а то при присвоении экран не перерисовывается
    const { startDate: startDateState, endDate: endDateState } = useSelector((state: RootState) => state.diapazon);



    // TODO:  вставить данные из глобального состояния
    /*загружаем заные о програмах */
    const loadData = async () => {
        try {
            const response = await axios.get<PrognameType[]>(`${BASE_URL}/${URL_GET_PROGRAMS}`, {
                params: {
                    start_date: convertDateToString(dates.startDate),
                    end_date: convertDateToString(dates.endDate),
                },
            });
            setData(response.data);
            console.log("Protected data:", response.data);
        } catch (error) {
            console.error("Error fetching protected data:", error);
            return;
        }
    };

    /* оправлем данные программы для обновления статуса */
    const handleCreateData: handleCreateDataType = async (params) => {
        //createDaraRequest(params);
        console.log("создется запись в таблице:", params.ProgramName, params.program_status)
        loadData();
    };

    const dispatchDiapazon = () => {
        dispatch(
            dateDiapazonActions.setDiapazon({
                startDate: convertDateToString(new Date(2025, 0, 1)),
                endDate: convertDateToString(new Date(2025, 1, 15)),
            })
        );
    };

    //------------------------------
    // не работает получение данных из хранилища
    return (
        <>
            <h2>Главное меню</h2>
            <DateDiapazon defultDates={dates} setDates={setDates} />
            {/*работа с глобальным хранилищем*/}
            {/* <div>
                <p>Начальная дата: {startDateState}</p>
                <p>Конечная дата: {endDateState}</p>
            </div> */}

            <div>
                <button type="button" onClick={loadData}>
                    Получить данные
                </button>
            </div>

            <div>
                {/*работа с глобальным хранилищем*/}
                {/* <button type="button" onClick={dispatchDiapazon}>
                    Обновление состояния
                </button> */}
            </div>

            {data && (
                <Suspense fallback={<div>Загрузка...</div>}>
                    <ProgramMainTable data={data} handleCreateData={handleCreateData} />
                </Suspense>
            )}
        </>
    );
};

export default MainScreen;
