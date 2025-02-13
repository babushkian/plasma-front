import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'


interface IDatePickerProps {
    selectedDate: Date | null,
    onChange: (date: Date | null) => void,
    minDate?: Date,
    maxDate?: Date
}
const DatePickerComponent = ({ selectedDate, onChange, minDate, maxDate }: IDatePickerProps) => {
    return (
        <DatePicker
            selected={selectedDate}
            onChange={onChange}
            minDate={minDate }
            maxDate={maxDate }
            dateFormat='yyyy-MM-dd'
            className='date-picker'
        />
    )
}


export default DatePickerComponent
