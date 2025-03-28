import { useState, useContext } from "react";
import { DateDiapazonContext } from "../../context.tsx";


import { Typography, Grid2 } from "@mui/material";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");





export const DateDiapazon = () => {
    const [error, setError] = useState<string>("");
    
    const {dateDiapazon:{startDate, endDate}, setDateDiapazon} = useContext(DateDiapazonContext)

    function compareDates(date: Dayjs, otherDate: Dayjs | null, greater = true) {
        let result = null;
        if (otherDate) {
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
            setDateDiapazon({startDate: date, endDate})
            compareDates(date, endDate, true);
        }
    };

    const handleEndDate = (date: Dayjs | null) => {
        console.log("обрабатываемая конечная дата", date)
        if (dayjs.isDayjs(date)) {            
            setDateDiapazon({startDate, endDate: date})
            compareDates(date, startDate, false);
        }
    };

    return (
        <>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
                <Grid2 container spacing={2} justifyContent="center">
                    <Grid2>
                        <DatePicker label="Начальная дата" value={startDate} maxDate={endDate} onChange={handleStartDate} />
                    </Grid2>
                    <Grid2>
                        <DatePicker  label="Конечная дата" value={endDate} minDate={startDate} onChange={handleEndDate}/>
                    </Grid2>
                </Grid2>
            </LocalizationProvider>
            {error && <p className="error-message">{error}</p>}
        </>
    );
};
