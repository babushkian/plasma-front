import React, { useState, lazy, Suspense } from "react";

import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL, URL_GET_PROGRAMS } from "../../utils/urls";
import { PrognameType } from "./MainScreen.types";
import { AddDispatch, RootState } from "../../store/store";
import { dateDiapazonActions } from "../../store/date_diapazon.slice";
import { DateDiapazon } from "../../components/DateDiapazon/DateDiapazon";
import { convertDateToString, convertStringToDate } from "../../utils/convert_time"

const ProgramMainTable = lazy(() => import("../../components/ProgramMainTable/ProgramMainTable"));

axios.defaults.withCredentials = true;

const MainScreen = () => {
    const [data, setData] = useState<PrognameType[]>();
    // const tableData = useRef<React.JSX.Element[]>([])
    // const [dataInfo, setDataInfo] = useState<React.JSX.Element>(<div>Не загружено...</div>)
    const dispatch = useDispatch<AddDispatch>();
    
    // чтобы они отображались, их нудно сделать сотсояниям, а то при присвоении экран не перерисовывается
    const { startDate: startDateState, endDate: endDateState } = useSelector((state: RootState) => state.diapazon);
    
    // TODO:  вставить данные из глобального состояния
    const loadData = async () => {
        try {
            const response = await axios.get<PrognameType[]>(`${BASE_URL}/${URL_GET_PROGRAMS}`, {
                params: { start_date: "2025-01-30", end_date: "2025-02-14" },
            });
            setData(response.data);
            console.log("Protected data:", response.data);
        } catch (error) {
            console.error("Error fetching protected data:", error);
            return;
        }
    };

    const dispatchDiapazon = () => {
        dispatch(dateDiapazonActions.setDiapazon({ startDate: convertDateToString(new Date(2025, 0, 1)), endDate: convertDateToString(new Date(2025, 1, 15)) }));
    };

    //------------------------------
    // не работает получение данных из хранилища
    return (
        <>
            <h2>Главное меню</h2>
            <DateDiapazon />
            <div>
                <p>Начальная дата: {startDateState}</p>
                <p>Конечная дата: {endDateState}</p>
            </div>

            <div>
                <button type="button" onClick={loadData}>
                    Получить данные
                </button>
            </div>

            <div>
                <button type="button" onClick={dispatchDiapazon}>
                    Обновление состояния
                </button>
            </div>

            {data && (
                <Suspense fallback={<div>Загрузка...</div>}>
                    <ProgramMainTable data={data} />
                </Suspense>
            )}
        </>
    );
};

export default MainScreen;
