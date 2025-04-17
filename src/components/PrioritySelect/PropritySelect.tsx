import { memo } from "react";
import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { ProgramPriorityType } from "../../pages/Logist/Logist.types";

import styles from "../../pages/Operator/Oerator.module.css"

type ChangeDataCallback = ()=> string
type AssignData = {
    [key: string]: ChangeDataCallback;
};
type AssignHandlerType = (rowId: number, data: AssignData) => void;
type PriorityPropsType = {
    selectValue: ProgramPriorityType;
    rowId: number;
    priorityOptions: ProgramPriorityType[];
    assignHandler: AssignHandlerType;
};


const stylesmap = {
    LOW: styles.bg_low,
    MEDIUM: styles.bg_medium,
    HIGH: styles.bg_high,
    CRITICAL: styles.bg_critical,
};

const backgroundMap = {
    LOW: "rgba(56, 158, 13, 0.6)",
    MEDIUM: "rgba(212, 177, 6, 0.6)",
    HIGH: "rgba(212, 107, 8, 0.6)",
    CRITICAL: "rgba(216, 51, 59, 0.6)",
};


const PrioritySelect = memo(({ selectValue, rowId, priorityOptions, assignHandler }: PriorityPropsType) => {
    const onChange = (event: SelectChangeEvent) => {
        assignHandler(rowId, {program_priority: ()=> event.target.value as ProgramPriorityType});
        
    };

    return (
        <FormControl sx={{ m: 1, width: 150 }} size="small">
        <Select value={selectValue} onChange={onChange} className={stylesmap[selectValue]}>
            {priorityOptions.map((option) => (
                <MenuItem value={option}  key={option}>{option}</MenuItem>
                // раскрашенные опции
                // <MenuItem value={option}  sx={{background:backgroundMap[option], "&.Mui-selected":{background:backgroundMap[option]}}} key={option}>{option}</MenuItem>
            ))}
        </Select>
        </FormControl>
    );
});

export default PrioritySelect;
