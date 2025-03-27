import { UserType, UserRolesType, UserIndexRolesType } from "../pages/Login/Login.types";

export const roleStrings = {
    USER: "Пользователь",
    ADMIN: "Администратор",
    TECHMAN: "Технолог",
    MASTER: "Мастер",
    OPERATOR: "Оператор",
    LOGIST: "Логист",
};

export const roles: Record<UserRolesType, UserIndexRolesType> = {
    Пользователь: "USER",
    Администратор: "ADMIN",
    Технолог: "TECHMAN",
    Мастер: "MASTER",
    Оператор: "OPERATOR",
    Логист: "LOGIST",
};

export type EndpointData = { endpoint: string; name: string };

export const endpoints: Record<string, EndpointData> = {
    TECHMAN: { endpoint: "/", name: "Технолог" },
    MASTER: { endpoint: "/master", name: "Мастер" },
    OPERATOR: { endpoint: "/operator", name: "Оператор" },
    LOGIST: { endpoint: "/logist", name: "Логист" },
    LOGIN: { endpoint: "/login", name: "Логин" },
    MAIN_REPORT:{endpoint: "/report", name: "Отчет" }
};

export const allowedEndpoints: Record<UserIndexRolesType, EndpointData[]> = {
    USER: [endpoints.MAIN_REPORT],
    ADMIN: [endpoints.TECHMAN, endpoints.MASTER, endpoints.OPERATOR, endpoints.LOGIST, endpoints.MAIN_REPORT],
    TECHMAN: [endpoints.TECHMAN, endpoints.MAIN_REPORT],
    MASTER: [endpoints.MASTER, endpoints.OPERATOR, endpoints.MAIN_REPORT],
    OPERATOR: [endpoints.OPERATOR, endpoints.MAIN_REPORT],
    LOGIST: [endpoints.LOGIST, endpoints.MAIN_REPORT],
};

export const getUserEndpoints = (user: UserType | undefined) => {
    if (user) return allowedEndpoints[roles[user.role]];
    return [endpoints.MAIN_REPORT];
};

export const getDefaultPage = (user: UserType | undefined) => {
    return getUserEndpoints(user)[0].endpoint;
};

export const isEndpointPermitted = (user: UserType | undefined, endpoint: string) => {
    const endpoints = getUserEndpoints(user);
    return endpoints.find((item) => item.endpoint === endpoint);
};
