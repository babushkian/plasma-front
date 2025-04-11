import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./AddOperator.module.css";
import {
    Alert,
    Box,
    Button,
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    OutlinedInput,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { userRegister } from "../../utils/requests";

type OperatorFormType = {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
};

const initialdata: OperatorFormType = {
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "Оператор",
};

type ValidationType = {
    email: boolean;
    password: boolean;
    first_name: boolean;
    last_name: boolean;
};

const initFormValid: ValidationType = {
    email: true,
    password: true,
    first_name: true,
    last_name: true,
};

export function AddOperator() {
    const [formData, setFormData] = useState<OperatorFormType>(initialdata);
    const [formValid, setFormValid] = useState(initFormValid);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        console.log("регистрируем оператора");
        event.preventDefault();
        const isValid = validate()
        console.log("провалидировали", isValid)
        if ( isValid) {
            const response = await userRegister(formData)
            console.log(response)
        }
        

    };

    const validate = () => {
        console.log("валидируем");
        const errors = initFormValid;
        for (const field in formData) {
            console.log(field, "данные", formData[field]);
            if (formData[field].trim() === "") {
                errors[field] = false;
            }
            console.log("ошибки", errors)
            setFormValid({...errors });
        }
        return Object.values(errors).every(item => item);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
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
                    Добавить оператора
                </Typography>

                <form onSubmit={handleSubmit}>
                    <Stack sx={{ backgroundColor: "background.paper", borderRadius: 1, padding: 1, rowGap: 0.5 }}>
                        <TextField
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            label="Email"
                            sx={{ m: 1, width: "300px" }}
                            variant="outlined"
                        />
                        {!formValid.email && (
                            <Typography variant="body2" className={styles.error} align="center" gutterBottom>
                                Поле некрооектно заполнено
                            </Typography>
                        )}

                        <TextField
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            label="Имя"
                            sx={{ m: 1, width: "300px" }}
                            variant="outlined"
                        />
                        {!formValid.first_name && (
                            <Typography variant="body2" className={styles.error} align="center" gutterBottom>
                                Поле некрооектно заполнено
                            </Typography>
                        )}

                        <TextField
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            label="Фамилия"
                            sx={{ m: 1, width: "300px" }}
                            variant="outlined"
                        />
                        {!formValid.last_name && (
                            <Typography variant="body2" className={styles.error} align="center" gutterBottom>
                                Поле некрооектно заполнено
                            </Typography>
                        )}
                        <TextField
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            label="Пароль"
                            sx={{ m: 1, width: "300px" }}
                            variant="outlined"
                        />
                        {!formValid.password && (
                            <Typography variant="body2" className={styles.error} align="center" gutterBottom>
                                Поле некрооектно заполнено
                            </Typography>
                        )}
                        <Button variant="contained" type="submit">
                            Создать
                        </Button>
                    </Stack>
                </form>
                {/* здесь нужно вывести всполывающее сообщение, что пользователь добавлен */}
            </Box>
        </Box>
    );
}
