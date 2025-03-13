import axios from "axios";

import { ICreateData } from "../pages/Techman/Techman.types";
import {
    BASE_URL,
    URL_CREATE_PROGRAM_DATA,
    MASTER_GET_PROGRAMS_AND_DOERS,
    POST_MASTER_ASSIGN_PROGRAMS,
    LOGIST_GET_PROGRAMS,
    MASTER_GET_DOERS,
    MASTER_GET_PARTS_BY_PROGRAM_ID,
    LOGIST_CALCULATE_PARTS,
    MASTER_GET_PARTS_BY_STATUSES,
    OPERATOR_GET_MY_PROGRAMS,
} from "./urls";
import { ProgramType, DoerType, ResponseType } from "../pages/Master/Master.types";

import { MasterProgramPartsRecordType } from "../pages/LogistTable/LogistTable.types";
import { AssignProgramRequestType } from "../pages/Master/Master.types";

/**
 * Записывает новые программы для резки в нашу базу
 * @param params
 */
export const createDataRequest = async (params: ICreateData[]) => {
    try {
        // Отправка POST-запроса на сервер с использованием axios
        const response = await axios.post(`${BASE_URL}/${URL_CREATE_PROGRAM_DATA}`, params);
        console.log("Ответ сервера: ", response);
    } catch (error) {
        if (error instanceof Error) console.error("Ошибка при запросе на создание программ:", error);
    }
};

export const assignProgramsRequest = async (params: AssignProgramRequestType[]) => {
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
        const path = `${BASE_URL}/${MASTER_GET_PROGRAMS_AND_DOERS}`;
        const { data } = await axios.get<ResponseType>(path);
        return data;
    } catch (error) {
        if (error instanceof Error) console.error("Ошибка при запросе программ для распределения:", error);
    }
};

export const getDoers = async () => {
    try {
        const path = `${BASE_URL}/${MASTER_GET_DOERS}`;
        const { data } = await axios.get<DoerType[]>(path);
        return data;
    } catch (error) {
        if (error instanceof Error) console.error("Ошибка при запросе работников:", error);
    }
};

export const logistGetPrograms = async () => {
    try {
        const { data } = await axios.get<ProgramType[]>(`${BASE_URL}/${LOGIST_GET_PROGRAMS}`);
        return data;
    } catch (error) {
        console.error("Error fetching protected data:", error);
        return;
    }
};

export const masterGetDetailsByProgramId: (
    program_id: number, doer_id?: number
) => Promise<MasterProgramPartsRecordType[] | undefined> = async (program_id, doer_id) => {
    try {
        const { data } = await axios.get<MasterProgramPartsRecordType[]>(
            `${BASE_URL}/${MASTER_GET_PARTS_BY_PROGRAM_ID}`,
            {
                params: { program_id, doer_id },
            }
        );
        //console.log(data);
        return data;
    } catch (error) {
        console.error("Ошибка получения деталей по идентификатору программы:", error);
        return;
    }
};

export const logistCalculateParts: (params: Array<{ id: number; qty_fact: number }>) => Promise<void> = async (params) => {
    try {
        const result = await axios.post(`${BASE_URL}/${LOGIST_CALCULATE_PARTS}`, params);
        console.log(result)
    } catch (error) {
        if (error instanceof Error) console.error("Ошибка при отправке фактического количества деталей:", error);
    }
};



export const getPartsByStatuses = async () => {
    
        const params={include_program_statuses:["создана", "распределена"]}
        try {
            const { data } = await axios.get<MasterProgramPartsRecordType[]>(
                `${BASE_URL}/${MASTER_GET_PARTS_BY_STATUSES}`,
                {
                    params: params,
                }
            );
            return data;
        } catch (error) {
            console.error("Ошибка получения деталей по идентификатору программы:", error);
            return;
        }
};

export const getMyPrograms = async (fio_id:number) => {
    try {
        const { data } = await axios.get<ProgramType[]>(
            `${BASE_URL}/${OPERATOR_GET_MY_PROGRAMS}`,
            {
                params: {fio_id},
            }
        );
        return data;
    } catch (error) {
        console.error("Ошибка получения программ по идентификатору исполнителя:", error);
        return;
    }
};