import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import {Link} from "react-router-dom"
import { useDispatch } from "react-redux";
import axios from "axios";
import {BASE_URL, URL_GET_PROGRAMS} from "../../utils/urls"
import {PrognameType} from "./MainScreen.types"
import {AddDispatch} from "../../store/store"
import {dateDiapazonActions} from "../../store/date_diapazon.slice"

// import ProgramMainTable from "../../components/ProgramMainTable/ProgramMainTable"

const ProgramMainTable = lazy(() => import("../../components/ProgramMainTable/ProgramMainTable"))

axios.defaults.withCredentials=true;

const MainScreen: React.FC = () => {
    const [data, setData] = useState<PrognameType[]>();
    // const tableData = useRef<React.JSX.Element[]>([])
    // const [dataInfo, setDataInfo] = useState<React.JSX.Element>(<div>Не загружено...</div>)
    const dispatch = useDispatch<AddDispatch>()

    const loadData = async () => {
        try {
            const response = await axios.get<PrognameType[]>(`${BASE_URL}/${URL_GET_PROGRAMS}`, {
                params: {start_date: "2025-01-10", end_date: "2025-02-10" }
            });
            setData(response.data)
            console.log("Protected data:", response.data);
        } catch (error) {
            console.error("Error fetching protected data:", error);
            return
        }
    };
    
    const dispatchDiapazon = ()=> {
        dispatch(dateDiapazonActions.setDiapazon({startDate: new Date(2025, 0, 1), endDate:new Date(2025, 1, 15)}))
    }

    return (
        <>
            <h2>Главное меню</h2>
            <div>Здесь должны быть оконки для ввода дат</div>

            <div>
                <button type="button" onClick={loadData}>Получить данные</button>
            </div>

            <div>
                <button type="button" onClick={dispatchDiapazon}>Обновление состояния</button>
            </div>


            {data && 
            <Suspense fallback={<div>Загрузка...</div>}>
                 <ProgramMainTable data={data} />
            </Suspense>
            }
        </>
    );
};

export default MainScreen;
