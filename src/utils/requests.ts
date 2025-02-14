import axios from "axios";

import { ProgramStatus } from "../pages/MainScreen/MainScreen.types";
import { BASE_URL, URL_CREATE_PROGRAM_DATA } from "./urls";

export interface ICreateData {
    program_status: ProgramStatus;
    ProgramName: string;
}

export const createDaraRequest = async (params: ICreateData) => {
    try {
        // Отправка POST-запроса на сервер с использованием axios
        const a = [params]
        console.log(a)
        const response = await axios.post(`${BASE_URL}/${URL_CREATE_PROGRAM_DATA}`, a );
        console.log("Была изменена запись", response);
    } catch (error) {
        console.error("Error during login:", error);
    }
};
