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
    Grid2,
    List,
    ListItemText,
    ListItem,
    Divider,
    ListItemButton,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { getDoers, userRegister } from "../../utils/requests";
import { DoerType } from "../Master/Master.types";

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
    const [doers, setDoers] = useState<DoerType[] | undefined>(undefined);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        console.log("регистрируем оператора");
        event.preventDefault();
        const isValid = validate();
        console.log("провалидировали", isValid);
        if (isValid) {
            const response = await userRegister(formData);
            console.log(response);
            setFormData(initialdata)
            setFormValid(initFormValid)
            loadOperators();

        }
    };

    const validate = () => {
        console.log("валидируем");
        const errors = { ...initFormValid };
        for (const field in formData) {
            console.log(field, "данные", formData[field]);
            if (formData[field].trim() === "") {
                errors[field] = false;
            }
            console.log("ошибки", errors);
            setFormValid({ ...errors });
        }
        return Object.values(errors).every((item) => item);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const loadOperators = async () => {
        const response = await getDoers();
        if (response) {
            setDoers(response.sort((a, b) => a.fio_doer.localeCompare(b.fio_doer)));
        }
    };

    useEffect(() => {
        loadOperators();
    }, []);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 1200, px: 2 }}>
            <Typography variant="h5" align="center" gutterBottom>
                Добавить оператора
            </Typography>
            <Grid2 container direction="row" gap={2} sx={{ width: 1000, height: "100%" }} alignContent={"center"}>
                <Grid2 size={5}>
                    <form onSubmit={handleSubmit}>
                        <Stack sx={{ backgroundColor: "background.paper", borderRadius: 1, padding: 1, rowGap: 0.5 }}>
                            <TextField
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                label="Email"
                                sx={{ m: 1 }}
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
                                sx={{ m: 1 }}
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
                                sx={{ m: 1 }}
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
                                sx={{ m: 1 }}
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
                </Grid2>
                <Grid2 size={6}>
                    <List sx={{ width: "100%", minWidth: 360, bgcolor: "background.paper", borderRadius: 1 }}>
                        {doers?.map((item, index) => (
                            <>
                                {index > 0 && <Divider variant="middle" />}
                                <ListItemButton key={item.id} sx={{ width: "100%" }}>
                                    <ListItemText primary={item.fio_doer} />
                                </ListItemButton>
                            </>
                        ))}
                    </List>
                </Grid2>
                {/* здесь нужно вывести всполывающее сообщение, что пользователь добавлен */}
            </Grid2>
        </Box>
    );
}
