import { TextField } from "@mui/material";
type SetQtyType = {
    rowId: number;
    initialQty: number;
    applyQty: (rowId: number, qty: number) => void;
};

const QtyInput = ({ rowId, initialQty, applyQty }: SetQtyType) => {
    const hadleSetQty = (event: React.ChangeEvent<HTMLInputElement>) => {
        // если удалить из строки ввода всё, там появляется NaN, что приводит к ошибке
        // В этом случае нужно принудительно заменять NaN на 0
        const converted = Number.parseInt(event.target.value);
        const newValue = !isNaN(converted) ? converted : 0;
        applyQty(rowId, newValue);
    };

    return (
        <>
            <TextField size="small" sx={{ margin: 1 }} value={initialQty} onChange={hadleSetQty} />
        </>
    );
};

export default QtyInput;
