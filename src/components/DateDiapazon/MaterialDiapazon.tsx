import React, { useState } from "react";
import DatePickerComponent from "./DatePicker";
import { useDispatch,  useSelector } from "react-redux";

import {AddDispatch} from "../../store/store"
import {dateDiapazonActions} from "../../store/date_diapazon.slice"
import {DateDiapazonType} from "../../pages/Techman/Techman.types"
import { TextField } from "@mui/material";
import { convertDateToString, convertStringToDate } from "../../utils/convert_time";

interface IDateDiapazonProps {
    setDates: React.Dispatch<React.SetStateAction<DateDiapazonType>>;
    defultDates: DateDiapazonType
}

export const DateDiapazon = ({defultDates, setDates}:IDateDiapazonProps) => {    
    const [startDate, setStartDate] = useState(defultDates.startDate);
    const [endDate, setEndDate] = useState(defultDates.endDate);
    const [error, setError] = useState<string>("");

    
    const dispatch = useDispatch<AddDispatch>()

    function compareDates(date: Date, otherDate: Date | null, greater = true) {
        let result = null;
        if (otherDate) {
            result = greater ? date > otherDate : otherDate > date;
        }
        if (result) {
            setError("Дата окончания не может быть раньше даты начала");
        } else {
            setError("");
        }
    }

    const handleStartDate = (date: Date | null) => {
        if (date instanceof Date) {
            setStartDate(date);
            setDates({startDate: date, endDate})
            compareDates(date, endDate, true);
            dispatch(dateDiapazonActions.setDiapazon({startDate: convertDateToString(startDate), endDate: convertDateToString(endDate) }))
        }
    };

    const handleEndDate = (date: Date | null) => {
        if (date instanceof Date) {
            setEndDate(date);
            setDates({startDate, endDate: date})
            compareDates(date, startDate, false);
            dispatch(dateDiapazonActions.setDiapazon({startDate: convertDateToString(startDate), endDate: convertDateToString(endDate) }))
        }
    };

    return (
        <>
            <div className="input-container">
                <div className={`date-picker-container ${error ? "error" : ""}`}>
                    <label>Начало</label>
                    <TextField
                        selectedDate={startDate}
                        onChange={(e)=>handleStartDate(e)}
                        maxDate={endDate || undefined}
                    />
                </div>

                <div className={`date-picker-container ${error ? "error" : ""}`}>
                    <label>Окончание</label>
                    <DatePickerComponent
                        selectedDate={endDate}
                        onChange={handleEndDate}
                        minDate={startDate || undefined}
                    />
                </div>
            </div>

            {error && <p className="error-message">{error}</p>}


        </>
    );
};
