import React, { useState } from "react";
import DatePickerComponent from "./DatePicker";
import { useDispatch, useSelector } from "react-redux";

import { AddDispatch } from "../../store/store";
import { dateDiapazonActions } from "../../store/date_diapazon.slice";
import { DateDiapazonType } from "../../pages/Techman/Techman.types";
import {  Typography, Grid2 } from "@mui/material";


import { convertDateToString, convertStringToDate } from "../../utils/convert_time";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");
console.log(dayjs());

interface IDateDiapazonProps {
    setDates: React.Dispatch<React.SetStateAction<DateDiapazonType>>;
    defultDates: DateDiapazonType;
}

export const DateDiapazon = ({ defultDates, setDates }: IDateDiapazonProps) => {
    const [startDate, setStartDate] = useState(dayjs("2025-01-03"));
    const [endDate, setEndDate] = useState(dayjs("2025-02-23"));
    const [error, setError] = useState<string>("");

    const dispatch = useDispatch<AddDispatch>();

    function compareDates(date: Dayjs, otherDate: Dayjs | null, greater = true) {
        let result = null;
        if (otherDate) {
            result = greater ? date.isBefore(otherDate) : date.isAfter(otherDate);
        }
        if (result) {
            setError("Дата окончания не может быть раньше даты начала");
        } else {
            setError("");
        }
    }

    const handleStartDate = (date: Dayjs | null) => {
        if (date instanceof Dayjs) {
            setStartDate(date);
            setDates({startDate: date.toDate(), endDate:endDate.toDate()})
            compareDates(date, endDate, true);
            //dispatch(dateDiapazonActions.setDiapazon({startDate: convertDateToString(startDate), endDate: convertDateToString(endDate) }))
        }
    };

    const handleEndDate = (date: Dayjs | null) => {
        if (date instanceof Dayjs) {
            setEndDate(date);
            setDates({startDate:startDate.toDate(), endDate: date.toDate()})
            compareDates(date, startDate, false);
            //dispatch(dateDiapazonActions.setDiapazon({startDate: convertDateToString(startDate), endDate: convertDateToString(endDate) }))
        }
    };

    return (
        <>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                <Grid2 container spacing={2} justifyContent="center">
                    <Grid2>
                        <Typography align="center">Начальная дата</Typography>
                        <DatePicker value={startDate} maxDate={endDate} />
                    </Grid2>
                    <Grid2>
                        <Typography align="center">Конечная дата</Typography>
                        <DatePicker value={endDate} minDate={startDate} />
                    </Grid2>
                </Grid2>
            </LocalizationProvider>
            {error && <p className="error-message">{error}</p>}
        </>
    );
};
