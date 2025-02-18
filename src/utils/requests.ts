import axios from "axios";

import { ProgramStatus } from "../pages/Techman/Techman.types";
import { BASE_URL, URL_CREATE_PROGRAM_DATA, GET_MASTER_PROGRAMS_AND_DOERS } from "./urls";

export interface ICreateData {
    program_status: ProgramStatus;
    ProgramName: string;
}

export const createDaraRequest = async (params: ICreateData[]) => {
    try {
        // Отправка POST-запроса на сервер с использованием axios
        console.log("------------------запрос на обновление---------------------")
        console.log(params)
        const response = await axios.post(`${BASE_URL}/${URL_CREATE_PROGRAM_DATA}`, params );
        console.log("Ответ сервера: ", response);
    } catch (error) {
        if (error instanceof Error )
            console.error("Ошибка при запросе на создание программ:", error);
        
    }
};

export const getProgramsAndDoers = async () => {
    try {
    const path = `${BASE_URL}/${GET_MASTER_PROGRAMS_AND_DOERS}`;
    const { data } = await axios.get(path);
    console.log(data)
    return data;
    } catch (error) {
        if (error instanceof Error )
            console.error("Ошибка при запросе программ для распределения:", error);

    }
}