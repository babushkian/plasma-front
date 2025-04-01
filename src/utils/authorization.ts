import { UserType, UserRolesType, UserIndexRolesType } from "../pages/Login/Login.types";

export const roleStrings = {
    USER: "Пользователь",
    ADMIN: "Администратор",
    TECHMAN: "Технолог",
    MASTER: "Мастер",
    OPERATOR: "Оператор",
    LOGIST: "Логист",
} as const;

export const roles: Record<UserRolesType, UserIndexRolesType> = {
    Пользователь: "USER",
    Администратор: "ADMIN",
    Технолог: "TECHMAN",
    Мастер: "MASTER",
    Оператор: "OPERATOR",
    Логист: "LOGIST",
} as const ;

export const endpoints = {
    TECHMAN: "/techman", 
    MASTER: "/master", 
    OPERATOR: "/operator", 
    LOGIST: "/logist", 
    LOGIN: "/login", 
    MAIN_REPORT: "/report", 
} as const;

type EndpointValues = typeof endpoints[keyof typeof endpoints];

export type EndpointData = { endpoint: EndpointValues; name: string };

export const appMenuItems: Record<keyof typeof endpoints, EndpointData> = {
    TECHMAN: { endpoint: endpoints.TECHMAN, name: "Технолог" },
    MASTER: { endpoint: endpoints.MASTER, name: "Мастер" },
    OPERATOR: { endpoint: endpoints.OPERATOR, name: "Оператор" },
    LOGIST: { endpoint: endpoints.LOGIST, name: "Логист" },
    LOGIN: { endpoint: endpoints.LOGIN, name: "Логин" },
    MAIN_REPORT:{endpoint: endpoints.MAIN_REPORT, name: "Отчет" }
};

export const allowedEndpoints: Record<UserIndexRolesType, EndpointData[]> = {
    USER: [appMenuItems.MAIN_REPORT],
    ADMIN: [appMenuItems.TECHMAN, appMenuItems.MASTER, appMenuItems.OPERATOR, appMenuItems.LOGIST, appMenuItems.MAIN_REPORT],
    TECHMAN: [appMenuItems.TECHMAN, appMenuItems.MAIN_REPORT],
    MASTER: [appMenuItems.MASTER, appMenuItems.OPERATOR, appMenuItems.MAIN_REPORT],
    OPERATOR: [appMenuItems.OPERATOR, appMenuItems.MAIN_REPORT],
    LOGIST: [appMenuItems.LOGIST, appMenuItems.MAIN_REPORT],
};

export const getUserEndpoints = (user: UserType | undefined) => {
    if (user) return allowedEndpoints[roles[user.role]];
    return [appMenuItems.MAIN_REPORT];
};

export const getDefaultPage = (user: UserType | undefined) => {
    return getUserEndpoints(user)[0].endpoint;
};

export const isEndpointPermitted = (user: UserType | undefined, endpoint: string) => {
    const endpoints = getUserEndpoints(user);
    return endpoints.find((item) => item.endpoint === endpoint);
};
