import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { getCurrentUser } from "../../utils/requests";
import { saveTokenToStore, saveUserToStore } from "../../utils/local-storage";
import { UserContext } from "../../context.tsx";
import { Navigate } from "react-router-dom";
import {roles, allowedEndpoints} from "../../utils/authorization.ts"

const Login = () => {
    const { currentUser, setCurrentUser } = useContext(UserContext);
    console.log(allowedEndpoints)
    console.log("пользователь в контексте логина:", currentUser)
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate()
    type loginResponse = { access_token: string; token_type: string };
    type userLoginType = { username: string; password: string };

    const handleLogin = async (userobj: userLoginType) => {
        try {
            // Отправка POST-запроса на сервер с использованием axios

            const response = await axios.post<loginResponse>("http://192.168.8.163:8000/auth/login", userobj, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });

            // Проверка успешности логина
            console.log(response);
            if (response.status === 200) {
                const token = response.data.access_token;
                console.log(token);
                saveTokenToStore(token);
                const user = await getCurrentUser();
                if (user) {
                    saveUserToStore(user);
                    setCurrentUser(user);
                    navigate(allowedEndpoints[roles[user.role]][0]) // переход на дефолтный адрес после логина
                }
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        handleLogin({ username, password });
    };

    return (
        <>
            <div>
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button>Login</button>
                </form>
            </div>
            <div>
                <button onClick={() => handleLogin({ username: "dima@mail.ru", password: "1234" })}>
                    Залогиниться дефолтным юзером
                </button>
            </div>

            {/* <div>
                <button onClick={handleLogout}>Разлогиниться</button>
            </div> */}
        </>
    );
};

export default Login;
