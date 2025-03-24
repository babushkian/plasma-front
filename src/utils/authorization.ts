import { UserType, UserRolesType, UserIndexRolesType } from "../pages/Login/Login.types";

// export const roles = {
//     USER: "Пользователь",
//     ADMIN: "Администратор",
//     TECHMAN: "Технолог",
//     MASTER: "Мастер",
//     OPERATOR: "Оператор",
//     LOGIST: "Логист",
// };

export const roles: Record<UserRolesType, UserIndexRolesType> = {
    Пользователь: "USER",
    Администратор: "ADMIN",
    Технолог: "TECHMAN",
    Мастер: "MASTER",
    Оператор: "OPERATOR",
    Логист: "LOGIST",
};

export type EndpointValues = string;

export const endpoints: Record<string, EndpointValues> = {
    TECHMAN: "/",
    MASTER: "/master",
    OPERATOR: "/operator",
    LOGIST: "/logist",
    LOGIN: "/login",
};

export const allowedEndpoints: Record<UserIndexRolesType, EndpointValues[]> = {
    USER: [endpoints.TECHMAN],
    ADMIN: [endpoints.TECHMAN, endpoints.MASTER, endpoints.OPERATOR, endpoints.LOGIST],
    TECHMAN: [endpoints.TECHMAN],
    MASTER: [endpoints.MASTER, endpoints.OPERATOR],
    OPERATOR: [endpoints.OPERATOR],
    LOGIST: [endpoints.LOGIST],
};

export const getUserEndpoints = (user: UserType | undefined) => {
    if (user) return allowedEndpoints[roles[user.role]];
    return [endpoints.login];
};

export const getDefaultPage = (user: UserType | undefined) =>{
    return getUserEndpoints(user)[0];
}


export const isEndpointPermitted = (user:UserType | undefined, endpoint:EndpointValues) => {
     return getUserEndpoints(user).includes(endpoint)

}
