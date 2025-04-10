import axios from "axios";
import { getTokenFromStore, clearStore } from "./local-storage";
import { replace } from "react-router-dom";
import {endpoints} from "./authorization"

export const BASE_URL = "http://192.168.8.163:8000";

export const URL_AUTH_LOGIN = "auth/login";
export const URL_AUTH_LOGOUT = "auth/logout";
export const URL_AUTH_AUTHENTICATED = "auth/authenticated-route";

export const URL_GET_PROGRAMS = "techman/get_programs";
export const URL_GET_PROGRAM_PARTS = "techman/get_program_parts";
export const URL_CREATE_PROGRAM_DATA = "techman/create_data";

export const USER_ME = "user/me"

/**
 * получение всех нераспределенных заданий и фамилий раюотников для распределения
 */
export const MASTER_GET_PROGRAMS_AND_DOERS = "master/get_programs_for_assignment_and_doers";
export const MASTER_ASSIGN_PROGRAMS = "master/assign_program";
export const MASTER_GET_DOERS = "master/get_doers";
export const MASTER_GET_PARTS_BY_PROGRAM_ID = "master/get_parts_by_program_id";
export const MASTER_GET_PARTS_BY_STATUSES = "master/get_parts_by_statuses";

export const OPERATOR_GET_MY_PROGRAMS = "operator/get_my_programs";
export const OPERATOR_START_PROGRAM = "operator/start_program";
export const OPERATOR_SET_MY_PARTS = "operator/this_is_my_parts";

export const LOGIST_GET_PROGRAMS = "logist/get_programs_for_calculation";
export const LOGIST_CALCULATE_PARTS = "logist/calculate_parts";

export const REPORT_PARTS_FULL = "reports/parts_full";

const apiClient = axios.create({
    baseURL: BASE_URL,
});



apiClient.interceptors.request.use(
    (config) => {
        const token = getTokenFromStore()
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log(error)
        if (error.response && error.response.status === 401) {            
            // Токен недействителен или истек
            clearStore(); // Удаляем токен из хранилища
            // Перенаправляем пользователя на страницу логина
            // const navigate = useNavigate()
            // navigate(URL_AUTH_LOGIN)   
        }
        return Promise.reject(error);
    }
);

export default apiClient;



export const setupInterceptors = (navigate) => {
    apiClient.interceptors.request.use(
        (config) => {
            const token = getTokenFromStore();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    apiClient.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                // Токен недействителен или истек

                navigate(endpoints.LOGIN, replace); // Перенаправляем пользователя на страницу логина
                clearStore(); // Удаляем токен из хранилища
            }
            return Promise.reject(error);
        }
    );
};


