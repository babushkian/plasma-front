import React, { useState } from "react";


type DoerSelectPropsType = {
    rowId: number;
    doers: DoerType[];
    assignHandler: (programId: number, doerId: number )=>void
}

const QtyInput = ({rowId, doers, assignHandler}:DoerSelectPropsType) => {
    const [selectedDoer, setSelectedDoer] = useState<number>(0);
    const doersList = doers.map((doer) => {
        return (
            <option key={doer.id} value={doer.id}>
                {" "}
                {doer.fio_doer}{" "}
            </option>
        );
    });

    const hadleSelectDoer = (event: React.ChangeEvent<HTMLSelectElement>)=> {
        const doerId = Number.parseInt(event.target.value)
        setSelectedDoer(doerId)
        assignHandler(rowId, doerId)
    }

    return (
        <>
            <select value={selectedDoer} onChange={hadleSelectDoer}>{doersList}</select>
        </>
    );
};

export default QtyInput;
