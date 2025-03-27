import React, { useState } from "react";
import { Box, TextField } from "@mui/material";
type SetQtyType = {
    rowId: number;
    initialQty: number;
    applyQty: (rowId: number, qty: number) => void;
};

const QtyInput = ({ rowId, initialQty, applyQty }: SetQtyType) => {
    const [qty, setQty] = useState<number>(initialQty);
    
    const hadleSetQty = (event: React.ChangeEvent<HTMLInputElement>) => {
        // если удалить из строки ввода всё, там появляется NaN, что приводит к ошибке
        // В этом случае нужно принудительно заменять NaN на 0
        const converted = Number.parseInt(event.target.value);
        const newValue = !isNaN(converted) ? converted : 0;
        setQty(newValue);
        applyQty(rowId, newValue);
    };

    return (
        <>
           
            <TextField size="small" sx={{margin:1}} value={qty} onChange={hadleSetQty}/>
        </>
    );
};

export default QtyInput;
