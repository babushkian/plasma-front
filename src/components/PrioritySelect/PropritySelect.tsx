import { FormControl, MenuItem, Select, SelectChangeEvent } from "@mui/material";

import { ProgramPriorityType } from "../../pages/Logist/Logist.types";

type PriorityPropsType = {
    selectedValue: ProgramPriorityType;
    rowId: number;
    priorityOptions: ProgramPriorityType[];
    assignHandler: (rowId: number, priorityValue: ProgramPriorityType) => void;
};

const PrioritySelect = ({ selectedValue, rowId, priorityOptions, assignHandler }: PriorityPropsType) => {
    const onChange = (event: SelectChangeEvent) => {
        assignHandler(rowId, event.target.value as ProgramPriorityType);
        
    };

    return (
        <FormControl sx={{ m: 1, width: 150 }}>
        <Select value={selectedValue} onChange={onChange}>
            {priorityOptions.map((option) => (
                <MenuItem value={option} key={option}>{option}</MenuItem>
            ))}
        </Select>
        </FormControl>
    );
};

export default PrioritySelect;
