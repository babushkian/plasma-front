// export const roles = {
//     USER: "Пользователь",
//     ADMIN: "Администратор",
//     TECHMAN: "Технолог",
//     MASTER: "Мастер",
//     OPERATOR: "Оператор",
//     LOGIST: "Логист",
// };
export const roles = {
    "Пользователь": "USER" ,
    "Администратор": "ADMIN",
    "Технолог": "TECHMAN",
    "Мастер": "MASTER",
    "Оператор": "OPERATOR",
    "Логист": "LOGIST",
  
};

export const endpoints = {
    TECHMAN: "/",
    MASTER: "/master",
    OPERATOR: "/operator",
    LOGIST: "/logist",
    LOGIN: "/login",
};
export const allowedEndpoints = {
    USER: [endpoints.TECHMAN],
    ADMIN: [endpoints.TECHMAN, endpoints.MASTER, endpoints.OPERATOR, endpoints.LOGIST],
    TECHMAN: [endpoints.TECHMAN],
    MASTER: [endpoints.MASTER, endpoints.OPERATOR],
    OPERATOR: [endpoints.OPERATOR],
    LOGIST: [endpoints.LOGIST],
};
