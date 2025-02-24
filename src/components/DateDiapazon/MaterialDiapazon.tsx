import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AddDispatch } from "../../store/store";
import { dateDiapazonActions } from "../../store/date_diapazon.slice";
import { DateDiapazonType } from "../../pages/Techman/Techman.types";
import {  Typography, Grid2 } from "@mui/material";

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
    const [startDate, setStartDate] = useState(dayjs(defultDates.startDate));
    const [endDate, setEndDate] = useState(dayjs(defultDates.endDate));
    const [error, setError] = useState<string>("");

//    const dispatch = useDispatch<AddDispatch>();

    function compareDates(date: Dayjs, otherDate: Dayjs | null, greater = true) {
        
        let result = null;
        if (otherDate) {
            console.log(date.format("YYYY.MM.DD"), otherDate.format("YYYY.MM.DD"))
            result = greater ? date.isAfter(otherDate) : date.isBefore(otherDate);
        }
        if (result) {
            setError("Дата окончания не может быть раньше даты начала");
        } else {
            setError("");
        }
    }

    const handleStartDate = (date: Dayjs | null) => {
        console.log("обрабатываемая начальная дата",date)
        if (dayjs.isDayjs(date)) {            
            setStartDate(date);
            setDates({startDate: date, endDate:endDate})
            compareDates(date, endDate, true);
            //dispatch(dateDiapazonActions.setDiapazon({startDate: convertDateToString(startDate), endDate: convertDateToString(endDate) }))
        }
    };

    const handleEndDate = (date: Dayjs | null) => {
        console.log("обрабатываемая конечная дата", date)
        if (dayjs.isDayjs(date)) {            
            setEndDate(date);
            setDates({startDate:startDate, endDate: date})
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
                        <DatePicker value={startDate} maxDate={endDate} onChange={handleStartDate} />
                    </Grid2>
                    <Grid2>
                        <Typography align="center">Конечная дата</Typography>
                        <DatePicker value={endDate} minDate={startDate} onChange={handleEndDate}/>
                    </Grid2>
                </Grid2>
            </LocalizationProvider>
            {error && <p className="error-message">{error}</p>}
        </>
    );
};
