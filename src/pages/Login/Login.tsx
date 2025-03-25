import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getCurrentUser } from "../../utils/requests";
import { saveTokenToStore, saveUserToStore } from "../../utils/local-storage";
import { UserContext } from "../../context.tsx";
import {
    Box,
    Button,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { getDefaultPage } from "../../utils/authorization.ts";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type loginResponse = { access_token: string; token_type: string };
type userLoginType = { username: string; password: string };

const Login = () => {
    const { currentUser, setCurrentUser } = useContext(UserContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

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
                saveTokenToStore(token);
                const user = await getCurrentUser();
                if (user) {
                    saveUserToStore(user);
                    setCurrentUser(user);
                    navigate(getDefaultPage(user)); // переход на дефолтный адрес после логина
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
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    mt: 1,
                    my: "auto",
                    width: 800,
                }}
            >
                <Typography variant="h5" align="center" gutterBottom>
                    Login
                </Typography>
                
                    <Stack sx={{background:"#EEE"}}>
                        <TextField
                            name="username"
                            
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            label="Пользователь"
                            sx={{ m: 1, width: "300px" }}
                            variant="outlined"
                        />

                        <FormControl sx={{ m: 1, width: "300px" }} variant="outlined">
                            <InputLabel htmlFor="outlined-adornment-password">Пароль</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
        
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            onMouseUp={handleMouseUpPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Пароль"
                            />
                        </FormControl>
                        <Button variant="contained" onClick={handleSubmit}> Войти</Button>
                    </Stack>

                    <Stack spacing={2}>
                    <Button variant="contained" onClick={() => handleLogin({ username: "dima@mail.ru", password: "1234" })}> Войти админом</Button>
                    <Button variant="contained" onClick={() => handleLogin({ username: "as@mail.ru", password: "1234" })}> Войти мастером</Button>
                    <Button variant="contained" onClick={() => handleLogin({ username: "vp@mail.ru", password: "1234" })}> Войти оператором</Button>
                    </Stack>
                
            </Box>
        </Box>
    );
};

export default Login;
