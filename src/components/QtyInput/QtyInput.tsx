import React, { useState } from "react";


type SetQtyType = {
    rowId: number;
    applyQty: (rowId:number, qty:number)=> void
}

const QtyInput = ({rowId,  applyQty}:SetQtyType) => {
    const [qty, setQty] = useState<number>(0);

    const hadleSetQty = (event: React.ChangeEvent<HTMLInputElement>)=> {
        const newValue = Number.parseInt(event.target.value)
        setQty( newValue)
        applyQty(rowId, newValue)
    }

    return (
        <>
            <input  value={qty} onChange={(e)=>hadleSetQty(e)} />
        </>
    );
};

export default QtyInput;
