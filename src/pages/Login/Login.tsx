import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { getCurrentUser } from "../../utils/requests";
import { TOKEN_LOCAL_STORAGE_KEY, USER_LOCAL_STORAGE_KEY } from "../../utils/local-storage";
import { UserType } from "./Login.module.css"
import { UserContext } from "../../context";

const Login = () => {
    const {currentUser, setCurrentUser} = useContext(UserContext)

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [autorized, setAutorized] = useState<boolean>(false);
    const [token, setToken] = useState<string | undefined>(undefined);

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
                console.log(response.data.access_token);
                setAutorized(true);
                setToken(response.data.access_token);
                localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, response.data.access_token);
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    };

    const handleLogout = async () => {
        try {
            // Отправка POST-запроса на сервер с использованием axios
            const response = await axios.post("http://192.168.8.163:8000/auth/logout", "", {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log(response);
            setAutorized(false);
            setToken(undefined);
            localStorage.removeItem(TOKEN_LOCAL_STORAGE_KEY);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                const user = await getCurrentUser();
                if (user) {
                    localStorage.setItem(USER_LOCAL_STORAGE_KEY, JSON.stringify(user));
                    setCurrentUser(user)
                }
            }
        };
        loadUser();
    }, [token]);


    const handleSubmit = (event) => {
        event.preventDefault();
        handleLogin({ username, password });
    };

    const label = autorized ? <div>Авторизован</div> : <div>Не авторизован</div>;

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

            <div>
                <button onClick={handleLogout}>Разлогиниться</button>
            </div>

            {label}
        </>
    );
};

export default Login;
