import { useRef, useState, useEffect } from "react";
import { Box, Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, Typography } from "@mui/material";
import { getDoers } from "../../utils/requests";
import { DoerType } from "../Master/Master.types";

const Operator = () => {
    const [doers, setDoers] = useState<DoerType[]>([]);
    const [currentDoer, setcurrentDoer] = useState<DoerType | null >(null);

    const load = async () => {
        const response = await getDoers();
        if (response) {
            setDoers(response);
            setcurrentDoer(response[0])
        }
    };

    useEffect(() => {
        load();
    }, []);

    useEffect(() => console.log(doers), [doers]);

    const hadleSelectDoer = ()=>{console.log("выбрали работника")}

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">Рабочее место оператора</Typography>
                
                <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel id="master-program-doers">Работник</InputLabel>
                    <Select
                        labelId="master-program-doers"
                        // sx={{ m: 1, minWidth: 200, height: 36, fontSize: 14 }}
                        input={<OutlinedInput label="Name" />}
                        
                        onChange={hadleSelectDoer}
                        value={currentDoer}
                        
                        
                    >
                        {doers.map((doer) => (
                            <MenuItem value={doer.id} key={doer.id} >

                                {doer.fio_doer}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
               
            </Box>
        </>
    );
};

export default Operator;
