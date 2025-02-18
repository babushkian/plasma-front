import axios from "axios";

import { ProgramStatus } from "../pages/Techman/Techman.types";
import {
    BASE_URL,
    URL_CREATE_PROGRAM_DATA,
    GET_MASTER_PROGRAMS_AND_DOERS,
    POST_MASTER_ASSIGN_PROGRAMS,
    LOGIST_GET_PROGRAMS,
    MASTER_GET_DOERS,
} from "./urls";
import { ProgramType, DoerType, ResponseType } from "../pages/Master/Master.types";

export interface ICreateData {
    program_status: ProgramStatus;
    ProgramName: string;
}

/**
 * Записывает новые программы для резки в нашу базу
 * @param params
 */
export const createDaraRequest = async (params: ICreateData[]) => {
    try {
        // Отправка POST-запроса на сервер с использованием axios
        const response = await axios.post(`${BASE_URL}/${URL_CREATE_PROGRAM_DATA}`, params);
        console.log("Ответ сервера: ", response);
    } catch (error) {
        if (error instanceof Error) console.error("Ошибка при запросе на создание программ:", error);
    }
};

export const assignProgramsRequest = async (params: { id: number; fio_doer_id: number }[]) => {
    try {
        await axios.post(`${BASE_URL}/${POST_MASTER_ASSIGN_PROGRAMS}`, params);
    } catch (error) {
        if (error instanceof Error) console.error("Ошибка при запросе на создание программ:", error);
    }
};

/**
 * Запрос получает список программ, готовых к распределению и список работников
 */
export const getProgramsAndDoers = async () => {
    console.log("Запрос программ и работников");
    try {
        const path = `${BASE_URL}/${GET_MASTER_PROGRAMS_AND_DOERS}`;
        const { data } = await axios.get<ResponseType>(path);
        return data;
    } catch (error) {
        if (error instanceof Error) console.error("Ошибка при запросе программ для распределения:", error);
    }
};


export const getDoers = async () => {
    try {
        const path = `${BASE_URL}/${MASTER_GET_DOERS}`;
        const { data } = await axios.get<DoerType>(path);
        return data;
    } catch (error) {
        if (error instanceof Error) console.error("Ошибка при запросе работников:", error);
    }
};


export const logistGetPrograms = async () => {
    try {
        const {data} = await axios.get<ProgramType[]>(`${BASE_URL}/${LOGIST_GET_PROGRAMS}`) 
        return data
    } catch (error) {
        console.error("Error fetching protected data:", error);
        return;
    }
};
