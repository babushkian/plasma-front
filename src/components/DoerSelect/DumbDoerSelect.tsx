import { memo } from "react";
import { DoerType, changeFieldType } from "../../pages/Master/Master.types";
import { Select, SelectChangeEvent, MenuItem, InputLabel, Checkbox, Box, Chip } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import { Theme, useTheme } from "@mui/material/styles";
import ListItemText from "@mui/material/ListItemText";

function getStyles(doerId: number, selectedDoers: number[], theme: Theme) {
    return {
        fontWeight: selectedDoers.includes(doerId)
            ? theme.typography.fontWeightMedium
            : theme.typography.fontWeightRegular,
    };
}

type DoerSelectPropsType = {
    selectValue: number[];
    rowId: number;
    doers: DoerType[];
    assignHandler: (programId: number, doerIds: Array<number>, field: changeFieldType) => void;
};

const DumbDoerSelect = memo(
    ({ selectValue, rowId, doers, assignHandler }: DoerSelectPropsType) => {
        const theme = useTheme();
        // console.log("перерисовка", rowId);
        const hadleSelectDoer = (event: SelectChangeEvent) => {
            const eventValue: number[] = event.target.value;
            console.log(eventValue);
            assignHandler(rowId, eventValue, "doerIds");
        };

        // нужно сделать выделение опций галочками, чтобы их было видно
        // а так же загрузка в селект уже имеющихся выбранных опций
        return (
            <FormControl sx={{ m: 1, width: 265 }}>
                <InputLabel id="master-program-doers">операторы</InputLabel>
                <Select
                    labelId="master-program-doers"
                    // sx={{ m: 1, minWidth: 200, height: 36, fontSize: 14 }}
                    input={<OutlinedInput label="операторы" />}
                    multiple
                    onChange={hadleSelectDoer}
                    value={selectValue}
                    renderValue={(selectValue) => (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {doers
                                .filter((item) => selectValue.includes(item.id))
                                .map((item) => (
                                    <Chip key={item.id} label={item.fio_doer} />
                                ))}
                        </Box>
                    )}
                >
                    {doers.map((doer) => (
                        <MenuItem value={doer.id} key={doer.id} style={getStyles(doer.id, selectValue, theme)}>
                            <Checkbox checked={selectValue.includes(doer.id)} />
                            <ListItemText primary={doer.fio_doer} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    },

);

export default DumbDoerSelect;
