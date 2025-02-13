import React, { useState } from "react";
import DatePickerComponent from "./DatePicker";
import { useDispatch,  useSelector } from "react-redux";

import {AddDispatch} from "../../store/store"
import {dateDiapazonActions} from "../../store/date_diapazon.slice"
import {convertDateToString} from "../../utils/convert_time"



// interface IDateDiapazonProps {
//     onSubmit: (dates: { startDate: Date | null; endDate: Date | null }) => void;
//     setParentDates: (dates: { startDate: Date | null; endDate: Date | null }) => void;
// }

export const DateDiapazon = () => {    
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
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
            compareDates(date, endDate, true);
            dispatch(dateDiapazonActions.setDiapazon({startDate: convertDateToString(startDate), endDate: convertDateToString(endDate) }))
        }
    };

    const handleEndDate = (date: Date | null) => {
        if (date instanceof Date) {
            setEndDate(date);
            compareDates(date, startDate, false);
            dispatch(dateDiapazonActions.setDiapazon({startDate: convertDateToString(startDate), endDate: convertDateToString(endDate) }))
        }
    };

    return (
        <>
            <div className="input-container">
                <div className={`date-picker-container ${error ? "error" : ""}`}>
                    <label>Начало</label>
                    <DatePickerComponent
                        selectedDate={startDate}
                        onChange={handleStartDate}
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
