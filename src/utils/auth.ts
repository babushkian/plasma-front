import axios from "axios"
import {URL_AUTH_LOGIN, URL_AUTH_LOGOUT, URL_AUTH_AUTHENTICATED} from "./urls"


export const handleLogin = async (pafa) => {
    try {
        // Отправка POST-запроса на сервер с использованием axios

        const response = await axios.post(
            `${BASE_URL}/${LOGIST_CALCULATE_PARTS}`, params,
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        // Проверка успешности логина
        if (response.data.ok) {
            setAutorized(true);
        } else {
            alert("Login failed: " + response.data.message);
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred during login. Please try again.");
    }
};
