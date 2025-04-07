import { TextField } from "@mui/material";
import React, { useState } from "react";
type SetQtyType = {
    rowId: number;
    initialQty: number;
    applyQty: (rowId: number, qty: number) => void;
};

const QtyInput = ({ rowId, initialQty, applyQty }: SetQtyType) => {
    const [qty, setQty] = useState(initialQty);

    const hadleSetQty = (event: React.ChangeEvent<HTMLInputElement>) => {
        // если удалить из строки ввода всё, там появляется NaN, что приводит к ошибке
        // В этом случае нужно принудительно заменять NaN на 0
        const converted = Number.parseInt(event.target.value);
        const newValue = !isNaN(converted) ? converted : 0;
        //applyQty(rowId, newValue);
        setQty(newValue);
    };

    const updateTable = () => {
        if (qty !== initialQty) applyQty(rowId, qty);
    };

    // это не работает корректно, так как при нажатии на Enter курсор не перескакиевает в другую ячейку
    //а чтобы перескочить в другую ячпйку надо выскочить из поля ввода
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") {
            updateTable();
        }
    };

    return (
        <>
            <TextField
                size="small"
                sx={{ margin: 1 }}
                value={qty}
                onBlur={updateTable}
                onChange={hadleSetQty}
                onKeyDown={handleKeyDown}
                autoComplete= "off"
            />
        </>
    );
};

export default QtyInput;
