import { useState, useContext } from "react";
import { DateDiapazonContext } from "../../context.tsx";

// import { useDispatch, useSelector } from "react-redux";
// import { AddDispatch } from "../../store/store";
// import { dateDiapazonActions } from "../../store/date_diapazon.slice";

import { Typography, Grid2 } from "@mui/material";

import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
dayjs.locale("ru");





export const DateDiapazon = () => {
    const [error, setError] = useState<string>("");
    
    const {dateDiapazon:{startDate, endDate}, setDateDiapazon} = useContext(DateDiapazonContext)

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
            setDateDiapazon({startDate: date, endDate})
            compareDates(date, endDate, true);
            //dispatch(dateDiapazonActions.setDiapazon({startDate: convertDateToString(startDate), endDate: convertDateToString(endDate) }))
        }
    };

    const handleEndDate = (date: Dayjs | null) => {
        console.log("обрабатываемая конечная дата", date)
        if (dayjs.isDayjs(date)) {            
            setDateDiapazon({startDate, endDate: date})
            compareDates(date, startDate, false);
            //dispatch(dateDiapazonActions.setDiapazon({startDate: convertDateToString(startDate), endDate: convertDateToString(endDate) }))
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
