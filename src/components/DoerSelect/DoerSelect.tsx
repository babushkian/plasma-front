import { DoerType } from "../../pages/Master/Master.types";
import { Select, SelectChangeEvent, MenuItem } from "@mui/material";
type DoerSelectPropsType = {
    selectValue: number;
    rowId: number;
    doers: DoerType[];
    assignHandler: (programId: number, doerId: number) => void;
};

const DoerSelect = ({ selectValue, rowId, doers, assignHandler }: DoerSelectPropsType) => {
    const hadleSelectDoer = (event: SelectChangeEvent) => {
        const doerId = Number.parseInt(event.target.value);
        assignHandler(rowId, doerId);
    };

    return (
        <>
            <Select
                variant="filled"
                sx={{ m: 1, minWidth: 200, height: 36, fontSize: 14 }}
                onChange={hadleSelectDoer}
                value={selectValue.toString()}
            >
                {doers.map((doer) => (
                    <MenuItem value={doer.id} key={doer.id}>
                        {doer.fio_doer}
                    </MenuItem>
                ))}
            </Select>
        </>
    );
};

export default DoerSelect;
