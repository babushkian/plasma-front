import { memo } from "react";
import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { ProgramPriorityType } from "../../pages/Logist/Logist.types";
import {changeFieldType} from "../../pages/Master/Master.types"
type PriorityPropsType = {
    selectedValue: ProgramPriorityType;
    rowId: number;
    priorityOptions: ProgramPriorityType[];
    assignHandler: (rowId: number, priorityValue: ProgramPriorityType, field: changeFieldType) => void;
};

const PrioritySelect = memo(({ selectedValue, rowId, priorityOptions, assignHandler }: PriorityPropsType) => {
    //console.log("перерисовка", rowId);
    const onChange = (event: SelectChangeEvent) => {
        assignHandler(rowId, event.target.value as ProgramPriorityType, "program_priority");
        
    };

    return (
        <FormControl sx={{ m: 1, width: 150 }} size="small">
        <Select value={selectedValue} onChange={onChange}>
            {priorityOptions.map((option) => (
                <MenuItem value={option} key={option}>{option}</MenuItem>
            ))}
        </Select>
        </FormControl>
    );
});

export default PrioritySelect;
